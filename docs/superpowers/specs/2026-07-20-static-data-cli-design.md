# Sub-project S — Static-Data Extraction + `dota` CLI

Design spec. Date: 2026-07-20. Status: approved for planning.

Relates to ROADMAP §7 (VPK reference-data map), §9 ("grow the constants
generator incrementally"; "Ops CLI"). This slice was deliberately re-prioritized
ahead of Sub-project A (STRATZ comparison) — see §1.

---

## 1. Goal & scope

Build a **comprehensive constants generator** that extracts *all* reference data
from the Dota 2 VPK into committed JSON, driven by a new first-party **`dota`
CLI** whose flagship command re-extracts on demand (per patch).

Two deliverables:
1. **The extractors** — Python (`vpk`), one per data domain, maximal-fidelity.
2. **The `dota` CLI** — TypeScript (cac), orchestrates the extractors and renders
   pretty terminal output.

**Explicitly out of scope this slice:** any UI/tooltips, hero pages, API
endpoints for the new data, STRATZ, database, and the actual `prod` push
implementation (only its seam is built — see §8). This slice *owns the data* and
builds the tool that produces it.

### Why this ordering (fork from the roadmap)
The roadmap's next step was Sub-project A. We chose static-data enrichment first
because it is **owned, stable, low-risk** (no flaky Valve endpoint, no STRATZ
dependency), self-contained, and it stands up the CLI that later hosts Ops
commands. The roadmap's "incremental, per-feature, don't build speculatively"
note (§7) is knowingly relaxed here: the user wants the full extraction now, and
static reference data is cheap to own in full.

---

## 2. Empirical findings (verified against the live VPK, 2026-07-20)

Confirmed by opening `pak01_dir.vpk` with Python `vpk`:

- **Item defs** — `scripts/npc/items.txt` (~666 KB, root `"DOTAAbilities"`). Each
  `item_*` block: `ItemCost`, `AbilityCooldown`, `AbilityManaCost`,
  `ItemShopTags`, `AbilityBehavior`, `ItemQuality`, and an `AbilitySpecial` block
  holding numeric values.
- **Names / descriptions / lore** for items *and* spells live in
  `resource/localization/abilities_english.txt`, keyed
  `DOTA_Tooltip_ability_<name>`, `..._Description`, `..._Lore`, `..._NoteN`, plus
  per-variable labels.
- **Formatting to preserve:** descriptions contain `<h1>`, `<br>`, and `%var%`
  placeholders (e.g. `Teleport up to %blink_range% units`) resolved from the
  `AbilitySpecial` block. A simpler clean `_npedesc` one-liner also exists in
  `dota_english.txt`.
- **Neutral items** — `scripts/npc/neutral_items.txt` (~6 KB): the current
  **trinkets + enhancements** crafting system. 5 tiers, each with
  `trinket_options`, `enhancement_options`, `craft_cost`, `xp_bonus`, an `items{}`
  (trinkets) block, and an `enhancements{}` block grouped by
  global/strength/agility/intelligence/universal.
- **Heroes** — `scripts/npc/heroes/npc_dota_hero_*.txt` + `hero_lore_english.txt`.
- **Item build trees** — `ItemRequirements` inside each item block (e.g.
  `item_hand_of_midas`). This is the recipe/components graph.
- **Aghanim's upgrades** — per-ability `..._scepter_description` /
  `..._shard_description` keys in `abilities_english.txt` (verified: Lina has
  `..._shard_description`).
- **Facets** — localization confirmed: `DOTA_Tooltip_Facet_<hero>_<name>` (+
  `_Description`) in `abilities_english.txt`. Facet *definitions* live in the hero
  KV; exact key/casing resolved at implementation time.
- **Localization files present:** `dota_english.txt`, `abilities_english.txt`,
  `items_english.txt` (mostly cosmetics), `hero_lore_english.txt`.

The KeyValues `.txt` format is **not JSON**: nested unquoted braces, `//`
comments, `#base` includes, and legal **duplicate keys**. The extractor needs a
robust KV parser (§6).

---

## 3. Monorepo placement

New workspace package **`apps/cli`** (workspace already globs `apps/*`).

```
apps/cli/
  package.json            @dota-helper/cli; bin { dota: ./dist/index.js }; dev via tsx; type: module
  tsconfig.json
  src/
    index.ts              cac entry — registers command groups
    commands/
      data.ts             `dota data extract …`
      doctor.ts           `dota doctor`
    lib/
      python.ts           venv bootstrap + child_process runner (reads NDJSON progress)
      render.ts           pretty output: picocolors + cli-table3 + yocto-spinner
      sinks.ts            target/sink abstraction (writeData) — see §8
      config.ts           DOTA_PATH + targets config
  extractors/
    _common.py            vpk open, KeyValues parser, localization index, NDJSON emit helpers
    items.py  neutral.py  abilities.py  heroes.py
    requirements.txt      vpk (pinned)
  .venv/                  gitignored — CLI bootstraps it
```

- The existing `apps/api/tools/extract-items.py` is **superseded** by
  `extractors/items.py` and removed.
- Output JSON is written to **`apps/api/src/data/`** (where the API already
  reads) — one file per domain. The API's read path does not change this slice.

Stack matches `apps/api`: ESM, `tsx` for dev, TypeScript, `@dota-helper/*` name.

---

## 4. The extractors (Python — proven `vpk`)

Each extractor is a **dumb data producer**: open the VPK, parse KV +
localization, write `apps/api/src/data/<domain>.json`, emit NDJSON progress lines
to stdout for the CLI to render. Shared `_common.py` holds the VPK opener, the KV
parser, and the localization index.

**Fidelity rule — no hand-picked allowlist.** The extractor dumps the *entire
parsed KV block* per entity (every field, generically KV→JSON), then enriches it
with all matching localization strings and icon URLs. We do **not** maintain a
curated list of "fields we keep" — that quietly drops data (an earlier draft of
this table cut item build trees, Aghanim's upgrades, facets, cast ranges,
aliases). Dumping the whole block guarantees nothing gameplay-relevant is lost.

Tooltip `%var%` substitution is **stored, not pre-rendered** — the raw
description (with `%var%` and tags intact) plus the `AbilitySpecial` value map are
both kept, so the future UI substitutes at render time. Lossless now, flexible
later.

Per domain, each record is `{ ...full KV block, <localization>, icon }`:

| Domain → file | Everything in its KV block, plus… |
|---|---|
| **items** → `items.json` | id + key; full item block (cost, cooldown, mana, behavior, quality, shop tags, `AbilitySpecial`, **`ItemRequirements` build tree**, stock/shop flags, aliases, all other fields); localization: display name, description (raw), lore, notes, **scepter/shard**; icon URL; neutral tier if any |
| **neutral-items** → `neutral-items.json` | full tier structure: 5 tiers → trinkets + enhancements grouped by attribute; craft cost, start time, xp bonus, options counts |
| **abilities** → `abilities.json` | key + owning hero; full ability block (behavior, damage type, cast range/point/duration, cooldown, mana, `AbilitySpecial`, all fields); localization: display name, description (raw), lore, notes, **scepter/shard**; icon URL |
| **heroes** → `heroes.json` | id + key; full hero block (primary attr, roles + role levels, all base stats, attack/vision/movement, **facets**, ability keys, talents 10/15/20/25, innate, all fields); localization: display name, lore, **facet strings**; icon URL |

Icon URLs follow the existing CDN convention (ROADMAP §4). `items.json` remains a
superset of the current shape so nothing downstream breaks.

### Deliberately excluded (so "everything" is honest)
"Everything" means **all gameplay / reference data**. These non-reference blobs
are out — call them out rather than silently skip:
- **Cosmetics** — `items_game.txt` (~50 MB of sets/couriers/wards; ROADMAP §7
  already flags it) and cosmetic-only entries in `items_english.txt`.
- **Patch notes**, **novels / lore books**, **bot AI scripts**, **chat wheel /
  emoticons**, and other `vdata/` mini-game data (Aghanim's Labyrinth, etc.).

If any of these turns out to be wanted later, it's an additive extractor behind
the same CLI — not a redesign.

---

## 5. The `dota` CLI (TypeScript / cac)

Pretty by default: **picocolors** (color), **cli-table3** (summary tables),
**yocto-spinner** (per-domain spinner). Command groups leave room to grow
(`dota ops …`, `dota dev …` later).

### `dota data extract [domains...] [--target <name>] [--dry-run]`
- Default runs **all** domains; or name them: `dota data extract items heroes`.
- Runs the Python extractors (concurrently where safe), live spinner per domain.
- Prints the detected game **patch/version**.
- Ends with a summary table: `domain │ records │ Δ vs committed │ status`.
- `--target` selects the sink (default `local`; see §8).
- `--dry-run` extracts in memory, shows the Δ table, writes nothing.

### `dota doctor`
Verify Steam/VPK path, `python3`, the venv, and `vpk` install. Pretty pass/fail
panel with fix hints. Reports whether the venv needs bootstrapping.

`DOTA_PATH` env overrides the Steam path (as today); else the known macOS
default.

---

## 6. Reproducibility

`lib/python.ts` **bootstraps the venv automatically**: if `apps/cli/.venv` is
missing, create it (`python3 -m venv`) and `pip install -r
extractors/requirements.txt` (vpk pinned), with pretty status — so
`dota data extract` "just works" on a fresh clone. `doctor` reports this state
explicitly.

---

## 7. Testing

- **KeyValues parser** — the one piece with real logic. Vitest unit tests over
  small fixture strings: comments, nested braces, duplicate keys, `#base`.
- **Extractors** — integration-verified against ground truth via `--dry-run`
  (e.g. `item_blink` cost = 2250; hero count = 127 — assert current counts). No
  test hits the network.
- **Sink abstraction** — unit test that `local` writes the expected file; `prod`
  is stubbed/unimplemented (§8).

---

## 8. Extension seam — `--target` / sinks (designed now, `prod` built later)

Two transport models get data to a deployed server:

1. **Git-as-transport (fits today).** Extraction writes committed JSON →
   `commit-push` → server redeploys with the JSON baked into its bundle.
   Versioned, reviewable, atomic with the code that reads it, no auth surface —
   the right model for *static per-patch reference data*. There is no running
   server yet, so this is the only live model.
2. **Direct push `--target prod` (future).** CLI uploads JSON straight to the
   live server (authenticated admin endpoint, object storage, or DB rows).
   Decouples data updates from code deploys. Earns its keep once data is dynamic
   or DB-backed (after Sub-project A's Postgres).

**This slice builds the seam, not the prod push.** `lib/sinks.ts` defines
`writeData(domain, json, target)` behind a `Sink` interface. Ships **one** sink,
`local` (writes the committed JSON files; the default). `prod` is a documented,
unimplemented target: `config.ts` reserves its endpoint + auth-token shape, and a
future sink slots in behind the same interface without touching the extractors or
command code. The ergonomics (`--target`, default `local`) exist from day one;
turning on `prod` is a contained follow-up.

---

## 9. Conventions (from ROADMAP §4)

- Clean code, **no comments**, match surrounding patterns.
- Commit via the `commit-push` skill; no AI-attribution trailers.
- `bypassPermissions` mode is on.
- Regenerate extracted data per patch; commit the JSON.

---

## 10. Success criteria

- `dota data extract` on a fresh clone bootstraps the venv and writes four
  committed JSON files under `apps/api/src/data/`.
- Each domain captures the fields in §4 at full fidelity (raw + structured).
- `--dry-run` and `doctor` work with pretty output.
- KV parser unit tests and extractor ground-truth checks pass.
- The `--target`/sink seam is in place with `local` implemented and `prod`
  reserved.
