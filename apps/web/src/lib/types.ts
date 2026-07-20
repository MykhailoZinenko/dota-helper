export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  icon: string;
}

export interface Item {
  id: number;
  name: string;
  icon: string;
  cost: number | null;
  cooldown: string | null;
  mana: string | null;
  description: string | null;
  lore: string | null;
}

export interface Profile {
  personaname: string | null;
  avatarfull: string | null;
  steam_id: string | null;
}

export interface ApiPlayer {
  account_id: number;
  player_slot: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  net_worth: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  last_hits: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
}

export interface ApiMatch {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  players: ApiPlayer[];
}

export interface MatchRow {
  match_id: number;
  player_hero: Hero | undefined;
  team: "radiant" | "dire";
  result: "won" | "lost";
  draft: (Hero | undefined)[];
  items: (Item | null)[];
  networth: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  lasthits: number;
  gpm: number;
  xpm: number;
  heroes_damage: number;
  tower_damage: number;
  allies_heal: number;
  duration: number;
}

export interface HeroStat {
  hero: Hero;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  networth: number;
  lasthits: number;
  gpm: number;
  xpm: number;
  kills: number;
  deaths: number;
  assists: number;
}

export type StatKey =
  | "kills"
  | "deaths"
  | "assists"
  | "gpm"
  | "xpm"
  | "lasthits"
  | "heroes_damage"
  | "allies_heal"
  | "tower_damage"
  | "duration";

export interface Statistics {
  average: Record<StatKey, number>;
  max: Record<StatKey, { value: number; hero: Hero | undefined }>;
  wins: number;
  losses: number;
  winrate: number;
}
