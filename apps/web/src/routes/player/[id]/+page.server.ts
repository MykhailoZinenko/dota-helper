import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getHeroes, getItems, getMatches, getProfile } from "$lib/api";
import { buildHeroStats, buildMatchRows, buildStatistics } from "$lib/transform";

export const load: PageServerLoad = async ({ params, fetch }) => {
  const accountId = params.id;
  if (!/^\d+$/.test(accountId)) {
    error(400, "Invalid account id");
  }

  const [heroes, items, matches, profile] = await Promise.all([
    getHeroes(fetch),
    getItems(fetch),
    getMatches(accountId, fetch),
    getProfile(accountId, fetch),
  ]);

  const heroesById = new Map(heroes.map((h) => [h.id, h]));
  const itemsById = new Map(items.map((i) => [i.id, i]));

  const rows = buildMatchRows(matches, heroesById, itemsById, Number(accountId));

  return {
    accountId,
    profile,
    matches: rows,
    statistics: buildStatistics(rows),
    heroStats: buildHeroStats(rows),
  };
};
