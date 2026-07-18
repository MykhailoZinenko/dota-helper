import { env } from "$env/dynamic/private";
import type { ApiMatch, Hero, Item, Profile } from "./types";

const API_URL = env.API_URL ?? "http://localhost:3001";

async function get<T>(path: string, fetchFn: typeof fetch): Promise<T> {
  const res = await fetchFn(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export const getHeroes = (fetchFn: typeof fetch) => get<Hero[]>("/api/heroes", fetchFn);
export const getItems = (fetchFn: typeof fetch) => get<Item[]>("/api/items", fetchFn);
export const getMatches = (id: string, fetchFn: typeof fetch) =>
  get<ApiMatch[]>(`/api/matches/${id}`, fetchFn);
export const getProfile = (id: string, fetchFn: typeof fetch) =>
  get<Profile>(`/api/profile/${id}`, fetchFn);
