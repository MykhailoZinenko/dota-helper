import itemsData from "./data/items.json";

const BASE = "https://api.steampowered.com";
const CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react";
const STEAMID64_BASE = 76561197960265728n;

async function steamGet(path: string, params: Record<string, string | number>) {
  const url = new URL(BASE + path);
  url.searchParams.set("key", process.env.STEAM_API_KEY ?? "");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Steam ${path} responded ${res.status}`);
  }
  return res.json() as Promise<any>;
}

async function pool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

export function heroIcon(name: string) {
  return `${CDN}/heroes/icons/${name.replace("npc_dota_hero_", "")}.png`;
}

export function itemIcon(name: string) {
  const slug = name.startsWith("recipe") ? "recipe" : name;
  return `${CDN}/items/${slug}.png`;
}

export interface Item {
  id: number;
  name: string;
  icon: string;
}

export function getItems(): Item[] {
  return (itemsData as Array<{ id: number | null; key: string; name: string | null; icon: string }>).map((item) => ({
    id: item.id ?? 0,
    name: item.name ?? item.key,
    icon: item.icon,
  }));
}

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  icon: string;
}

export async function getHeroes(): Promise<Hero[]> {
  const data = await steamGet("/IEconDOTA2_570/GetHeroes/v1", { language: "en_us" });
  return data.result.heroes.map((h: any) => ({
    id: h.id,
    name: h.name.replace("npc_dota_hero_", ""),
    localized_name: h.localized_name,
    icon: heroIcon(h.name),
  }));
}

async function getMatchHistory(accountId: string, count = 25): Promise<any[]> {
  const data = await steamGet("/IDOTA2Match_570/GetMatchHistory/v1", {
    account_id: accountId,
    matches_requested: count,
  });
  return data.result.matches ?? [];
}

async function getMatchBySeqNum(seqNum: number): Promise<any | null> {
  const data = await steamGet("/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1", {
    start_at_match_seq_num: seqNum,
    matches_requested: 1,
  });
  return data.result.matches?.[0] ?? null;
}

export async function getPlayerMatches(accountId: string): Promise<any[]> {
  const history = await getMatchHistory(accountId, 25);
  const details = await pool(history, (m) => getMatchBySeqNum(m.match_seq_num), 5);
  return details.filter(Boolean);
}

export interface Profile {
  personaname: string | null;
  avatarfull: string | null;
  steam_id: string | null;
}

export async function getProfile(accountId: string): Promise<Profile> {
  const steamId64 = (BigInt(accountId) + STEAMID64_BASE).toString();
  const data = await steamGet("/ISteamUser/GetPlayerSummaries/v0002", { steamids: steamId64 });
  const player = data.response.players?.[0];
  return {
    personaname: player?.personaname ?? null,
    avatarfull: player?.avatarfull ?? null,
    steam_id: player?.steamid ?? null,
  };
}
