# Dota Helper — Project Roadmap & Handbook

> Living handoff doc. Captures what this is, the principles behind every
> decision, the current state, the conventions, and the plan forward. Read this
> first when resuming work.

Last updated: 2026-07-19.

---

## 1. What this is

**Dota Helper** — a personal Dota 2 stats & analysis app. The user's **first
ever finished project**, being revived and grown. Repo:
`github.com/MykhailoZinenko/dota-helper`.

**Product focus (v1): a player-lookup analytics tool.** Enter any Dota account
ID → a deep, well-designed dashboard of their matches, stats, and heroes.
Player-centric and publicly usable, achievable solo.

**The north-star vision:** *coaching-grade comparison.* Not just "here are your
numbers" (Dotabuff) and not just "here's the meta" (STRATZ) — but **"here's how
YOU actually played vs what's normal/optimal, so you can find your mistakes."**
That's the rare, valuable niche.

**Growth optionality:** start player-centric; keep the architecture open to
later grow toward meta/all-in-one (a la STRATZ) — but that needs aggregate data
at a scale only a service can provide (see §7), so it stays a *later* option.

---

## 2. Origin — the pivot from Earworm

This repo lives inside a folder named `earworm-reborn` (legacy). The session
started trying to revive **Earworm**, a Spotify stats app. That was abandoned
when research showed Spotify's **2026 API lockdown** makes a new public
Spotify-stats app impossible for an independent dev (Extended Quota Mode needs a
registered business + 250k MAU; Nov 2024 killed Related Artists/Audio Features
for new apps; Feb 2026 capped Developer Mode at 5 Premium test users). stats.fm
etc. are grandfathered under old terms.

The pivot was chosen deliberately: dota-helper is a project the user **loves**
(they play Dota), on **builder-friendly** ground (Valve's API is flaky but not
gatekept — the opposite of Spotify). Motivation + gatekeeper-free = the right
foundation.

---

## 3. Core principles (these drive every decision)

1. **Own your ground.** Prefer data/infra you control. The core data (a user's
   matches) is fetched **Valve-direct**, never through a third-party aggregator.
2. **Climbable walls, not permission walls.** Choose problems where *effort →
   progress* (technical difficulty) over problems gated by someone's permission
   (business approval, MAU thresholds). Spotify's wall was unclimbable; Valve's
   is climbable (flaky, route around it).
3. **Do everything by hand — use a service ONLY for what you genuinely can't do
   yourself.** The one thing we can't replicate solo is aggregating *millions of
   high-MMR replays* into meta baselines — that's the *only* reason STRATZ is in
   the stack. We parse **our own** replays ourselves.
4. **Contained dependencies.** Any external service is a *non-critical,
   swappable* layer behind an interface. If STRATZ dies, the app degrades (loses
   comparison), it doesn't break. Core stays ours.
5. **Facts before vibes.** Verify APIs empirically before designing on them.
   This session repeatedly caught wrong assumptions by actually testing
   (Spotify's lockdown, `GetMatchDetails` being dead, `GetGameItems` removed,
   the item-id location, STRATZ's real capabilities). Never assume an API.
6. **Hand-rolled, owned design.** No UI component libraries. The design system
   is the user's own, extracted into tokens and systematized — never replaced
   with a generic skin.
7. **Ship and finish; incremental, value-first.** Decompose big things; ship a
   useful slice before the hard infra. Fight the start-big-then-abandon trap.
8. **Modular monolith + necessary workers, ONE database.** Split a process only
   when a real constraint forces it (different runtime, singleton session,
   background vs request-path). Not microservices.

---

## 4. Architecture (current) & conventions

**Monorepo** — pnpm workspaces + Turborepo. Root: `dota-helper/`.

```
apps/
  web/      SvelteKit (Svelte 5, adapter-node) — the frontend + SSR
  api/      Hono (Node/TS) — the API; owns the Steam key, all data access
```

**Data flow (today):**
browser → SvelteKit **SSR load** (`+page.server.ts`) → **Hono API** → **Steam
Web API** (+ later: Postgres, STRATZ). The Hono API holds secrets server-side;
the browser never calls Steam or holds the key. No CORS (server-to-server).

**Backend is currently STATELESS** — it fetches Valve live and caches in memory.
There is **no database yet**. Adding one is Sub-project A (§9).

**Frontend:** SvelteKit, player-lookup at `/player/[id]` (shareable, SSR,
SEO-friendly). Last-viewed account remembered in localStorage. Hand-rolled
components, no UI library.

**Conventions:**
- **Code style:** clean, **NO comments**, follow the existing architecture/
  patterns. Match surrounding code.
- **Commits:** always via the `commit-push` skill. No AI-attribution trailers.
- **Permissions:** `bypassPermissions` mode is on for this project.
- **Icons:** Steam CDN — `cdn.cloudflare.steamstatic.com/apps/dota2/images/
  dota_react/{heroes/icons,items}/{name}.png`. Hero name = GetHeroes `name`
  minus `npc_dota_hero_`. Recipes → `items/recipe.png`.

---

## 5. Current state — what's built (as of 2026-07-19)

- **Monorepo** (pnpm + turborepo): `apps/web` + `apps/api`.
- **Valve-direct backend** (`apps/api`, Hono):
  - `/api/heroes` — `GetHeroes` + CDN icon URLs (127 heroes, current).
  - `/api/matches/:accountId` — `GetMatchHistory` → per-match
    `GetMatchHistoryBySequenceNum` (full detail), concurrency-pooled.
  - `/api/profile/:accountId` — `GetPlayerSummaries` (account_id → steamID64).
  - Steam key in gitignored `apps/api/.env` (**rotate it** — it was pasted in
    chat once).
- **Item id→name via first-party VPK extraction:** `tools/extract-items.py`
  (Python `vpk`) parses `scripts/npc/npc_ability_ids.txt` from the Dota VPK →
  committed `apps/api/src/data/items.json` (594 items). Regenerate per patch.
- **SvelteKit frontend** (`apps/web`): player-lookup, SSR dashboard =
  Profile + StatsGrid + MatchesTable + HeroesTable, with client-side column
  sorting (matches default № , heroes default Matches↓), mobile card-collapse.
- **Design system:** extracted to `src/lib/styles/tokens.css` (the navy
  palette, Space Grotesk, 1px tracking) + `src/app.css` (base, `.data-table`,
  `.btn`/`.input` controls, `._text-*` utilities, skeleton). Living styleguide
  at **`/design`**. Synced to **claude.ai/design** ("Dota Helper" project,
  styles/tokens/guidelines only — see `.design-sync/`).

---

## 6. How to run (dev)

```bash
cd dota-helper
cp apps/api/.env.example apps/api/.env   # add a Steam Web API key
pnpm install
pnpm dev        # api on :3001, SvelteKit on :5173
# open http://localhost:5173 → enter an account ID (e.g. 990567883)
# design system reference: http://localhost:5173/design
```
Stray server on a port? `lsof -ti:3001,5173 | xargs kill -9`.

---

## 7. Data sources & the dependency philosophy

| Source | Used for | Ownership | Notes |
|---|---|---|---|
| **Steam Web API** (Valve) | user's matches, heroes, profile | **ours (core)** | `GetMatchDetails` is DEAD (broken since patch 7.36, 2024) → route around it with `GetMatchHistoryBySequenceNum`. `GetGameItems` REMOVED (404). Flaky but no permission gate. |
| **VPK game files** | reference data (items, heroes, abilities, talents, enchantments) | **ours** | Read with Python `vpk` from `~/Library/Application Support/Steam/steamapps/common/dota 2 beta/game/dota/pak01_dir.vpk`. |
| **Steam CDN** | all images/icons | n/a (open) | `.../dota_react/{heroes,heroes/icons,abilities,items}/{name}.png`. |
| **STRATZ API** | **meta / benchmarks ONLY** | *contained dependency* | The one thing we can't do solo (aggregate millions of high-MMR replays). GraphQL. Swappable (OpenDota fallback). |
| **Own replay pipeline** (future) | deep per-match data | **ours** | Steam alt bot (GC salts) + clarity/manta parser. |

### VPK reference-data map (verified)
- `npc_ability_ids.txt` — all ability + item numeric ids (594 items). **This is
  where item ids live** (NOT `items.txt`, which lost its ID field; NOT
  `items_game.txt`, which is 50MB cosmetics).
- `items.txt` — item definitions (names, cost). `npc_abilities.txt` — ability
  defs. `scripts/npc/heroes/npc_dota_hero_*.txt` — per-hero abilities/talents/
  innate/stats. `neutral_items.txt` — the **Enchantment** system (5 tiers ×
  {trinkets, enhancements}). `resource/localization/dota_english.txt` (+
  `abilities_english`, `items_english`) — all names/descriptions/lore (has Valve
  formatting `%var%`/`<br>` to clean up).
- **Strategy:** grow `extract-items.py` into a full constants generator
  *incrementally, per feature* — don't build it all speculatively.

### STRATZ (verified 2026-07-19)
- Endpoint `https://api.stratz.com/graphql`. **Free.** Token via Steam login at
  `stratz.com/api`; `Authorization: Bearer <token>`; server-side use is normal.
  Default tier ~10k calls/day, 20/s — generous for a small app.
- **Meta data (the reason it's here):** `heroStats` query → per-minute aggregate
  stats (GPM/XPM/LH/networth) filterable by **rank bracket + role + patch**,
  win rates, item builds/timings, matchups, lane outcomes. Exactly "compare me
  vs Divine mid meta."
- STRATZ *also* has per-match minute-by-minute + IMP — but per §3 we parse our
  own replays; STRATZ is meta-only.
- **Caveats:** no formal written ToS (terms live in FAQ posts) — attribution/
  back-link required, higher tiers need referral-traffic quotas; confirm
  commercial use with them directly if it matters. Small self-funded company +
  downstream Valve dependency → moderate risk. **Mitigate: provider interface
  with OpenDota (`/benchmarks` endpoint) as hot-swap fallback.**

---

## 8. Design system & UI conventions

The **soul** is in specifics — preserve them:
- **Palette (tokens):** `--bg` `rgb(25,32,35)`, `--nav` `#16405a`, `--profile`
  `#15394f`, `--deep` `#0d1520`; text `--text` `#e0e5e8` / `--text-muted`
  `#899aa5` / `--text-strong` `#fff`; `--success` `#66bb6a`, `--danger`
  `#f14a4b`, `--gold` `#c9af1d`; `--line` `#fff` (table rules), `--line-soft`.
- **Type:** Space Grotesk, `--tracking` 1px. Sizes `--fs-sm`..`--fs-xl`.
- **Signature details:** dotted-white table rows with solid top/bottom edges;
  the **white drop-shadow outline on the player's own hero** in the draft;
  centered `main-content` headings; `hsl(200,20%,…)` skeleton shimmer; tables
  **collapse into `data-label` cards under 768px**.
- **Components (classes):** `.data-table` (+ `.sort-btn`, `.active`),
  `.btn`/`.btn--primary`/`.btn--ghost`, `.input`, `._text-*`,
  `.recently-played`/`.recent-matches-list` (stat panel), `.profile-info`.
- Reference: the `/design` route (living), plus `docs/` git history — the
  original hand-rolled `style.css` is recoverable at commit `3616e27`.
- **Rule:** never redesign the user's UI into a generic look. "Extract the
  design system" = preserve + systematize, not replace.

---

## 9. Roadmap — completing v1

**v1 = coaching-grade comparison:** your own deeply-parsed games measured
against STRATZ meta. This is **6 subsystems** — decomposed into 3 value-first
sub-projects, each with its own spec → plan → build:

### Sub-project A — Persistence + STRATZ meta + summary comparison
The achievable first slice that **proves the whole vision** without the replay
mountain.
- Add a **database** (recommended: **Supabase Postgres** — carries over from
  the Earworm stack decision; SQL suits stats, user likes SQL; **confirm in A's
  brainstorm**). Backend goes from stateless → persistent.
- Integrate **STRATZ** behind a **provider interface** (OpenDota fallback);
  fetch/cache meta baselines.
- Ship the first **"you vs meta"** view using the **summary metrics we already
  compute** (per-hero GPM/KDA/networth vs STRATZ meta averages). No replay data
  needed. **Shippable, genuinely useful.**

### Sub-project B — Own replay-parsing pipeline
The big infra piece (needs A's database first).
- **Replay salts** come from the **Game Coordinator**, not the Web API. Reach
  the GC with a **dedicated Steam alt account** your backend logs into
  (`steam-user`, `gamesPlayed(570)`). Use an **alt, Guard off (or TOTP via
  `steam-totp`)** because: (a) holding the GC session locks that account out of
  Dota — one game-session per account, don't use your main; (b) headless login
  can't type a 2FA code. Steam **OpenID login gives identity only — it does NOT
  yield salts**, so a bot is unavoidable for the salt.
- The bot is a **headless Node process** — it does NOT run the actual game (no
  GPU, ~tens of MB RAM); it speaks the Steam/GC protocol and dials *out* to
  Valve. Runs on your Mac locally now → a cheap always-on cloud box (Fly.io /
  small VPS) later.
- **Parser:** download the `.dem` (via salt) → parse with **clarity (Java)** or
  **manta (Go)** — a headless CPU process (seconds/replay), invoked by the
  worker. Update parser protobufs each patch. Store deep per-match data in the
  DB.

### Sub-project C — Deep comparison
The payoff. Compare per-minute / lane / timing / event data (from B) against
STRATZ meta dimensions → real mistake-finding & coaching. + the comparison UI.

### Other future items
- **Steam login** (OpenID) — as an **auth/UX** feature (log in as yourself, no
  typing account id). NOT a replay-data mechanism.
- **Hero pages** — name/abilities/talents/innate/enchantments + icons/
  descriptions from the VPK+CDN (grow the constants generator).
- **Charts** — hand-rolled (user's call), for GPM/XPM curves, trends, comparison.
- **Deploy** — SvelteKit → Cloudflare Pages / Node host; Hono api + worker →
  cheap box (Fly.io) or Cloudflare. Env/secrets. (Was a separate "Task 3" idea.)
- **Ops CLI** — manage the processes from the Mac console: **PM2**
  (`ecosystem.config.js`; `pm2 start/stop/restart/status/logs`) is the
  near-turnkey answer; optionally a thin custom `dota` CLI (cac/commander)
  wrapping PM2 locally + the cloud provider API remotely. Earns its keep once
  the worker exists (Sub-project B). Don't write a supervisor from scratch.
- **Public** — only realistic once comparison is compelling; the player-lookup
  shape is already public-friendly. Meta/all-in-one growth needs aggregate data
  scale (a service or huge infra) — a much later call.

---

## 10. Key decisions & rationale (the "why")

- **SvelteKit (not React/Next):** hand-rolling with no UI library + coming from
  vanilla HTML/CSS → Svelte's scoped-style model is the natural fit; SSR still
  gives SEO for public player/hero pages. (For Earworm we chose Vite-SPA because
  it was an authed dashboard where SSR bought nothing — different context.)
- **Hono backend, Valve-direct (not OpenDota):** own the core data. A browser
  app can't reach Steam directly (no CORS + broken endpoint), so a backend is
  required regardless — it holds the key and owns data.
- **Own replay parsing + STRATZ meta-only:** own everything you can; a service
  only for the irreplaceable aggregate. See §3.
- **Dedicated Steam alt bot for salts:** one-session rule + headless-login
  reasons; OpenID can't provide salts. See §9-B.
- **Modular monolith + workers, 1 DB (not microservices):** split by real
  constraint only. See §3.

---

## 11. Lessons / gotchas

- **Verify APIs empirically.** Every "it's fine" assumption this session that
  went unchecked was wrong. Test before designing.
- **Don't overwrite hand-rolled/creative work.** A generic re-skin "lost its
  soul"; the fix was extracting + systematizing the *user's* design.
- **box-sizing:** the global `* { box-sizing: border-box }` makes `padding` eat
  into fixed `width`/`height` — size icon boxes accordingly (draft 28×28, items
  38×28 = content + 2px pad).
- **Steam Web API `GetMatchDetails` and `GetGameItems` are gone** — routes in §7.
- **Rotate the Steam API key** in `apps/api/.env` (it was pasted in chat once).
- **claude.ai/design cards must inline styles** — a `<link>` to `/styles.css`
  doesn't resolve in the preview sandbox (see `.design-sync/NOTES.md`).

---

## 12. Where to resume

Next concrete step: **brainstorm Sub-project A** (database + STRATZ + first
"you vs meta" view). Confirm the DB choice (Supabase Postgres?), design the
schema (store user matches + cached meta), and the first comparison view. Follow
the spec → plan → build flow; specs live in `docs/superpowers/specs/`.
