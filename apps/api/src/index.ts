import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { getHeroes, getItems, getPlayerMatches, getProfile, type Hero, type Item } from "./steam";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

let heroesCache: { data: Hero[]; ts: number } | null = null;
let itemsCache: Item[] | null = null;
const matchesCache = new Map<string, { data: unknown[]; ts: number }>();

const app = new Hono();

app.get("/api/heroes", async (c) => {
  if (!heroesCache || Date.now() - heroesCache.ts > HOUR) {
    heroesCache = { data: await getHeroes(), ts: Date.now() };
  }
  return c.json(heroesCache.data);
});

app.get("/api/items", (c) => {
  if (!itemsCache) itemsCache = getItems();
  return c.json(itemsCache);
});

app.get("/api/matches/:accountId", async (c) => {
  const accountId = c.req.param("accountId");
  const cached = matchesCache.get(accountId);
  if (cached && Date.now() - cached.ts < 5 * MINUTE) {
    return c.json(cached.data);
  }
  const data = await getPlayerMatches(accountId);
  matchesCache.set(accountId, { data, ts: Date.now() });
  return c.json(data);
});

app.get("/api/profile/:accountId", async (c) => {
  return c.json(await getProfile(c.req.param("accountId")));
});

app.use("/*", serveStatic({ root: "../web" }));

export default app;
