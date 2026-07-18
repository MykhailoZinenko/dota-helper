import type {
  ApiMatch,
  ApiPlayer,
  Hero,
  HeroStat,
  Item,
  MatchRow,
  Statistics,
  StatKey,
} from "./types";

const STAT_KEYS: StatKey[] = [
  "kills",
  "deaths",
  "assists",
  "gpm",
  "xpm",
  "lasthits",
  "heroes_damage",
  "allies_heal",
  "tower_damage",
  "duration",
];

export function buildMatchRows(
  matches: ApiMatch[],
  heroesById: Map<number, Hero>,
  itemsById: Map<number, Item>,
  accountId: number
): MatchRow[] {
  const rows: MatchRow[] = [];

  for (const match of matches) {
    const player = match.players.find((p) => p.account_id === accountId);
    if (!player) continue;

    const isRadiant = player.player_slot < 128;
    const result = match.radiant_win === isRadiant ? "won" : "lost";
    const draft = match.players.map((p) => heroesById.get(p.hero_id));

    const items: (Item | null)[] = [];
    for (let i = 0; i < 6; i++) {
      const itemId = player[`item_${i}` as keyof ApiPlayer] as number;
      items.push(itemId ? (itemsById.get(itemId) ?? null) : null);
    }

    rows.push({
      match_id: match.match_id,
      player_hero: heroesById.get(player.hero_id),
      team: isRadiant ? "radiant" : "dire",
      result,
      draft,
      items,
      networth: player.net_worth,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      kda: player.deaths
        ? (player.kills + player.assists) / player.deaths
        : player.kills + player.assists,
      lasthits: player.last_hits,
      gpm: player.gold_per_min,
      xpm: player.xp_per_min,
      heroes_damage: player.hero_damage,
      tower_damage: player.tower_damage,
      allies_heal: player.hero_healing,
      duration: match.duration,
    });
  }

  return rows;
}

export function buildStatistics(rows: MatchRow[]): Statistics {
  const average = Object.fromEntries(STAT_KEYS.map((k) => [k, 0])) as Record<StatKey, number>;
  const max = Object.fromEntries(
    STAT_KEYS.map((k) => [k, { value: 0, hero: undefined }])
  ) as Statistics["max"];

  let wins = 0;
  let losses = 0;

  for (const row of rows) {
    if (row.result === "won") wins++;
    else losses++;

    for (const key of STAT_KEYS) {
      const value = row[key];
      average[key] += value;
      if (value > max[key].value) {
        max[key] = { value, hero: row.player_hero };
      }
    }
  }

  const count = rows.length || 1;
  for (const key of STAT_KEYS) {
    average[key] = Math.round(average[key] / count);
  }

  const winrate = wins + losses ? (wins / (wins + losses)) * 100 : 0;

  return { average, max, wins, losses, winrate };
}

export function buildHeroStats(rows: MatchRow[]): HeroStat[] {
  const byHero = new Map<string, HeroStat>();

  for (const row of rows) {
    if (!row.player_hero) continue;
    const key = row.player_hero.name;

    let stat = byHero.get(key);
    if (!stat) {
      stat = {
        hero: row.player_hero,
        games: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        networth: 0,
        lasthits: 0,
        gpm: 0,
        xpm: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
      byHero.set(key, stat);
    }

    stat.games++;
    if (row.result === "won") stat.wins++;
    else stat.losses++;
    stat.networth += row.networth;
    stat.lasthits += row.lasthits;
    stat.gpm += row.gpm;
    stat.xpm += row.xpm;
    stat.kills += row.kills;
    stat.deaths += row.deaths;
    stat.assists += row.assists;
  }

  const stats = [...byHero.values()];
  for (const stat of stats) {
    stat.networth /= stat.games;
    stat.lasthits /= stat.games;
    stat.gpm /= stat.games;
    stat.xpm /= stat.games;
    stat.kills /= stat.games;
    stat.deaths /= stat.games;
    stat.assists /= stat.games;
    stat.winrate = stat.wins / stat.games;
  }

  return stats.sort((a, b) => b.games - a.games);
}
