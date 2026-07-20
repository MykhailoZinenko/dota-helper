# Static-Data Extraction + `dota` CLI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-party `dota` CLI (TypeScript/cac) that orchestrates Python (`vpk`) extractors to pull *all* gameplay/reference data from the Dota 2 VPK into committed JSON.

**Architecture:** Python extractors are dumb data producers — they parse the VPK's KeyValues files, dump each entity's **full parsed block** enriched with localization + icon URLs as a JSON array to **stdout**, and stream NDJSON progress to **stderr**. The TypeScript CLI owns orchestration and all presentation: it bootstraps a Python venv, spawns the extractors, renders pretty output (spinner + summary table), and routes the data through a **sink** (`local` writes committed JSON; `prod` reserved).

**Tech Stack:** TypeScript + ESM + tsx + cac + picocolors + cli-table3 + yocto-spinner + Vitest (CLI); Python 3 + `vpk` + pytest (extractors); pnpm workspace + Turborepo.

## Global Constraints

- **No code comments.** Match surrounding patterns (ROADMAP §4).
- **No AI-attribution trailers** in commits. Commit via conventional-commit messages.
- Package name `@dota-helper/cli`; ESM (`"type": "module"`); Node ≥ 20.
- Extractors write JSON to **`apps/api/src/data/`** (where the API already reads). One file per domain: `items.json`, `neutral-items.json`, `abilities.json`, `heroes.json`.
- **Fidelity rule:** dump the entire parsed KV block per entity, then enrich — never maintain a hand-picked field allowlist.
- Transport: Python → **stdout = JSON data array**, **stderr = NDJSON progress/meta events**. Never mix.
- Icon CDN base: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react` (ROADMAP §4).
- Default Steam path: `~/Library/Application Support/Steam/steamapps/common/dota 2 beta`; override with env `DOTA_PATH`. VPK at `<DOTA_PATH>/game/dota/pak01_dir.vpk`.
- `bypassPermissions` mode is on for this project.

---

## File Structure

```
apps/cli/
  package.json
  tsconfig.json
  vitest.config.ts
  .gitignore                      # .venv, dist
  src/
    index.ts                      # cac entry: registers `data`, `doctor`
    lib/
      config.ts                   # paths (dota, vpk, dataDir, cliRoot), targets
      python.ts                   # venv bootstrap + runExtractor (spawn, split streams)
      sinks.ts                    # Sink interface, localSink, dryRunSink, prodSink, getSink, diffRecords
      render.ts                   # summaryTable, spinner helpers (pure formatters unit-tested)
    commands/
      data.ts                     # `dota data extract [domains...] --target --dry-run`
      doctor.ts                   # `dota doctor`
    lib/__tests__/
      sinks.test.ts
      python.test.ts
      render.test.ts
  extractors/
    requirements.txt              # vpk==1.2.16
    _common.py                    # parse_kv, open_vpk, read_kv, load_loc, emit_*, icon_url, dump
    items.py
    neutral.py
    abilities.py
    heroes.py
    tests/
      test_kv.py                  # KeyValues parser unit tests
      test_extractors.py          # ground-truth checks against the real VPK (skip if absent)
```

Files removed: `apps/api/tools/extract-items.py` (superseded by `extractors/items.py`).

---

## Task 1: Scaffold the `@dota-helper/cli` package

**Files:**
- Create: `apps/cli/package.json`
- Create: `apps/cli/tsconfig.json`
- Create: `apps/cli/vitest.config.ts`
- Create: `apps/cli/.gitignore`
- Create: `apps/cli/src/index.ts`

**Interfaces:**
- Produces: a runnable CLI entry (`tsx src/index.ts`) exposing `--version`/`--help` and a stub `data`/`doctor` group registered in later tasks. Root binary name: `dota`.

- [ ] **Step 1: Create `apps/cli/package.json`**

```json
{
  "name": "@dota-helper/cli",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "bin": { "dota": "./src/index.ts" },
  "scripts": {
    "dota": "tsx src/index.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "cac": "^6.7.14",
    "cli-table3": "^0.6.5",
    "picocolors": "^1.1.1",
    "yocto-spinner": "^0.2.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `apps/cli/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `apps/cli/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 4: Create `apps/cli/.gitignore`**

```
.venv
dist
node_modules
```

- [ ] **Step 5: Create `apps/cli/src/index.ts`**

```ts
import { cac } from "cac";

const cli = cac("dota");

cli.help();
cli.version("1.0.0");

cli.parse();
```

- [ ] **Step 6: Install and verify the CLI runs**

Run: `pnpm install && pnpm --filter @dota-helper/cli dota --help`
Expected: cac help output listing `dota` usage, `--help`, `--version`. No error.

- [ ] **Step 7: Commit**

```bash
git add apps/cli/package.json apps/cli/tsconfig.json apps/cli/vitest.config.ts apps/cli/.gitignore apps/cli/src/index.ts pnpm-lock.yaml
git commit -m "feat(cli): scaffold @dota-helper/cli package"
```

---

## Task 2: KeyValues parser (`_common.py`) — TDD

**Files:**
- Create: `apps/cli/extractors/_common.py`
- Create: `apps/cli/extractors/tests/test_kv.py`
- Create: `apps/cli/extractors/requirements.txt`

**Interfaces:**
- Produces: `parse_kv(text: str) -> dict`. Nested `{}` become nested dicts; duplicate keys collapse to a list; `//` line comments, `/* */` block comments, and quoted/bare tokens are handled; `#base "file"` lines survive as a `#base` key (string or list).

- [ ] **Step 1: Create `apps/cli/extractors/requirements.txt`**

```
vpk==1.2.16
```

- [ ] **Step 2: Write the failing tests `apps/cli/extractors/tests/test_kv.py`**

```python
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _common import parse_kv


def test_flat_pairs():
    kv = parse_kv('"root" { "a" "1" "b" "two" }')
    assert kv["root"] == {"a": "1", "b": "two"}


def test_nested_block():
    kv = parse_kv('"root" { "child" { "x" "9" } }')
    assert kv["root"]["child"]["x"] == "9"


def test_line_and_block_comments_ignored():
    kv = parse_kv('"root" {\n // a comment\n "a" "1" /* inline */ "b" "2"\n }')
    assert kv["root"] == {"a": "1", "b": "2"}


def test_duplicate_keys_become_list():
    kv = parse_kv('"root" { "k" "1" "k" "2" }')
    assert kv["root"]["k"] == ["1", "2"]


def test_base_include_preserved():
    kv = parse_kv('#base "other.txt"\n"root" { "a" "1" }')
    assert kv["#base"] == "other.txt"
    assert kv["root"]["a"] == "1"
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd apps/cli/extractors && python3 -m pytest tests/test_kv.py -q`
Expected: FAIL — `ModuleNotFoundError: No module named '_common'` (or import error).

- [ ] **Step 4: Implement `parse_kv` in `apps/cli/extractors/_common.py`**

```python
import json
import os
import re
import sys

_TOKEN_RE = re.compile(
    r'\s+|//[^\n]*|/\*.*?\*/|"((?:[^"\\]|\\.)*)"|(\{)|(\})|([^\s{}"]+)',
    re.DOTALL,
)


def _tokenize(text):
    for m in _TOKEN_RE.finditer(text):
        quoted, lbrace, rbrace, bare = m.group(1), m.group(2), m.group(3), m.group(4)
        if quoted is not None:
            yield (quoted.replace('\\"', '"'), "str")
        elif lbrace:
            yield ("{", "lbrace")
        elif rbrace:
            yield ("}", "rbrace")
        elif bare is not None:
            yield (bare, "str")


def _assign(obj, key, value):
    if key in obj:
        if isinstance(obj[key], list):
            obj[key].append(value)
        else:
            obj[key] = [obj[key], value]
    else:
        obj[key] = value


def parse_kv(text):
    tokens = list(_tokenize(text))
    pos = 0

    def parse_object(top):
        nonlocal pos
        obj = {}
        while pos < len(tokens):
            tok, kind = tokens[pos]
            if kind == "rbrace":
                pos += 1
                return obj
            key = tok
            pos += 1
            if pos >= len(tokens):
                break
            vtok, vkind = tokens[pos]
            if vkind == "lbrace":
                pos += 1
                _assign(obj, key, parse_object(False))
            else:
                _assign(obj, key, vtok)
                pos += 1
        return obj

    return parse_object(True)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd apps/cli/extractors && python3 -m pytest tests/test_kv.py -q`
Expected: PASS (5 passed).

- [ ] **Step 6: Commit**

```bash
git add apps/cli/extractors/_common.py apps/cli/extractors/tests/test_kv.py apps/cli/extractors/requirements.txt
git commit -m "feat(cli): KeyValues parser for VPK extraction"
```

---

## Task 3: VPK + localization helpers + emit protocol (`_common.py`)

**Files:**
- Modify: `apps/cli/extractors/_common.py`
- Create: `apps/cli/extractors/tests/test_extractors.py`

**Interfaces:**
- Produces:
  - `open_vpk() -> vpk.VPKFile` — opens the pak from `DOTA_PATH` (env or default).
  - `read_kv(pak, path) -> dict` — read + `parse_kv` a VPK file (utf-8, ignore errors).
  - `load_loc(pak, *files) -> dict` — merged `lang.Tokens` maps from localization files; keys lowercased for lookup.
  - `loc(tokens, *keys) -> str | None` — first present key (case-insensitive).
  - `icon_url(kind, name) -> str` — `kind` in `{"heroes","heroes/icons","abilities","items"}`.
  - `emit_progress(done, total, label)`, `emit_meta(**kw)` — write NDJSON to **stderr**.
  - `dump(records)` — `json.dump` list to **stdout**.

- [ ] **Step 1: Write the failing ground-truth test `apps/cli/extractors/tests/test_extractors.py`**

```python
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import _common

VPK = os.path.join(_common.dota_path(), "game", "dota", "pak01_dir.vpk")
skip = not os.path.exists(VPK)


def test_read_items_kv():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    pak = _common.open_vpk()
    data = _common.read_kv(pak, "scripts/npc/items.txt")
    assert data["DOTAAbilities"]["item_blink"]["ItemCost"] == "2250"


def test_load_localization():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    pak = _common.open_vpk()
    tokens = _common.load_loc(pak, "resource/localization/abilities_english.txt")
    assert _common.loc(tokens, "DOTA_Tooltip_ability_item_blink") == "Blink Dagger"
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/cli/extractors && python3 -m pytest tests/test_extractors.py -q`
Expected: FAIL — `AttributeError: module '_common' has no attribute 'dota_path'`.

- [ ] **Step 3: Append helpers to `apps/cli/extractors/_common.py`**

```python
import vpk

CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react"
DEFAULT_DOTA = os.path.expanduser(
    "~/Library/Application Support/Steam/steamapps/common/dota 2 beta"
)


def dota_path():
    return os.environ.get("DOTA_PATH", DEFAULT_DOTA)


def open_vpk():
    return vpk.open(os.path.join(dota_path(), "game", "dota", "pak01_dir.vpk"))


def read_kv(pak, path):
    text = pak.get_file(path).read().decode("utf-8", "ignore")
    return parse_kv(text)


def load_loc(pak, *files):
    tokens = {}
    for path in files:
        kv = read_kv(pak, path)
        table = kv.get("lang", {}).get("Tokens", {})
        for key, value in table.items():
            if isinstance(value, str):
                tokens[key.lower()] = value
    return tokens


def loc(tokens, *keys):
    for key in keys:
        value = tokens.get(key.lower())
        if value is not None:
            return value
    return None


def icon_url(kind, name):
    return f"{CDN}/{kind}/{name}.png"


def emit_progress(done, total, label):
    print(json.dumps({"event": "progress", "done": done, "total": total, "label": label}), file=sys.stderr, flush=True)


def emit_meta(**kw):
    print(json.dumps({"event": "meta", **kw}), file=sys.stderr, flush=True)


def dump(records):
    json.dump(records, sys.stdout)
    sys.stdout.flush()
```

- [ ] **Step 4: Run to verify it passes (with venv holding vpk)**

Run:
```bash
cd apps/cli/extractors && python3 -m venv /tmp/kvenv && /tmp/kvenv/bin/pip install -q -r requirements.txt pytest && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py -q
```
Expected: PASS (2 passed) if the VPK is present; SKIPPED otherwise.

- [ ] **Step 5: Commit**

```bash
git add apps/cli/extractors/_common.py apps/cli/extractors/tests/test_extractors.py
git commit -m "feat(cli): VPK reader, localization loader, emit protocol"
```

---

## Task 4: `items.py` extractor

**Files:**
- Create: `apps/cli/extractors/items.py`
- Modify: `apps/cli/extractors/tests/test_extractors.py`

**Interfaces:**
- Consumes: `_common` (`open_vpk`, `read_kv`, `load_loc`, `loc`, `icon_url`, `emit_progress`, `emit_meta`, `dump`).
- Produces: running `python items.py` prints a JSON array of item records to stdout. Each record: `{ "id": int|None, "key": str, "name": str|None, "cost": int|None, "description_raw": str|None, "lore": str|None, "scepter": str|None, "shard": str|None, "icon": str, ...full KV block flattened under "raw" }`.

- [ ] **Step 1: Add a ground-truth test to `apps/cli/extractors/tests/test_extractors.py`**

```python
import subprocess
import json


def _run(script):
    here = os.path.join(os.path.dirname(__file__), "..")
    out = subprocess.run(
        [sys.executable, os.path.join(here, script)],
        capture_output=True, text=True,
    )
    assert out.returncode == 0, out.stderr
    return json.loads(out.stdout)


def test_items_extractor_blink():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    records = _run("items.py")
    blink = next(r for r in records if r["key"] == "item_blink")
    assert blink["cost"] == 2250
    assert blink["name"] == "Blink Dagger"
    midas = next(r for r in records if r["key"] == "item_hand_of_midas")
    assert "ItemRequirements" in midas["raw"]
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_items_extractor_blink -q`
Expected: FAIL — `FileNotFoundError` / no `items.py`.

- [ ] **Step 3: Implement `apps/cli/extractors/items.py`**

```python
import _common


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def build(pak, loc_tokens, ids):
    defs = _common.read_kv(pak, "scripts/npc/items.txt")["DOTAAbilities"]
    keys = [k for k in defs if k.startswith("item_") and isinstance(defs[k], dict)]
    records = []
    for i, key in enumerate(keys):
        block = defs[key]
        slug = key[len("item_"):]
        icon_slug = "recipe" if slug.startswith("recipe") else slug
        records.append({
            "id": ids.get(key),
            "key": key,
            "name": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}"),
            "cost": _int(block.get("ItemCost")),
            "description_raw": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Description"),
            "lore": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Lore"),
            "scepter": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_scepter_description"),
            "shard": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_shard_description"),
            "icon": _common.icon_url("items", icon_slug),
            "raw": block,
        })
        _common.emit_progress(i + 1, len(keys), key)
    return records


def item_ids(pak):
    raw = pak.get_file("scripts/npc/npc_ability_ids.txt").read().decode("utf-8", "ignore")
    import re
    return {name: int(num) for name, num in re.findall(r'"(item_[A-Za-z0-9_]+)"\s+"(\d+)"', raw)}


def main():
    pak = _common.open_vpk()
    loc_tokens = _common.load_loc(pak, "resource/localization/abilities_english.txt")
    ids = item_ids(pak)
    records = build(pak, loc_tokens, ids)
    _common.emit_meta(domain="items", records=len(records))
    _common.dump(records)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_items_extractor_blink -q`
Expected: PASS (skips if VPK absent).

- [ ] **Step 5: Commit**

```bash
git add apps/cli/extractors/items.py apps/cli/extractors/tests/test_extractors.py
git commit -m "feat(cli): items extractor (full block + localization + build tree)"
```

---

## Task 5: `neutral.py` extractor

**Files:**
- Create: `apps/cli/extractors/neutral.py`
- Modify: `apps/cli/extractors/tests/test_extractors.py`

**Interfaces:**
- Produces: `python neutral.py` prints a JSON array of tier records: `{ "tier": int, "start_time": str, "craft_cost": int|None, "xp_bonus": int|None, "trinkets": [str], "enhancements": { attr: [str] }, "raw": <tier block> }`.

- [ ] **Step 1: Add ground-truth test to `tests/test_extractors.py`**

```python
def test_neutral_extractor_tiers():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    records = _run("neutral.py")
    tiers = sorted(r["tier"] for r in records)
    assert tiers == [1, 2, 3, 4, 5]
    t1 = next(r for r in records if r["tier"] == 1)
    assert len(t1["trinkets"]) > 0
    assert "strength" in t1["enhancements"]
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_neutral_extractor_tiers -q`
Expected: FAIL — no `neutral.py`.

- [ ] **Step 3: Implement `apps/cli/extractors/neutral.py`**

```python
import _common


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def build(pak):
    root = _common.read_kv(pak, "scripts/npc/neutral_items.txt")["neutral_items"]
    tiers_block = root.get("neutral_tiers", {})
    records = []
    keys = [k for k in tiers_block if k.isdigit()]
    for i, key in enumerate(sorted(keys, key=int)):
        block = tiers_block[key]
        enhancements = {
            attr: list(group.keys())
            for attr, group in block.get("enhancements", {}).items()
            if isinstance(group, dict)
        }
        records.append({
            "tier": int(key),
            "start_time": block.get("start_time"),
            "craft_cost": _int(block.get("craft_cost")),
            "xp_bonus": _int(block.get("xp_bonus")),
            "trinkets": list(block.get("items", {}).keys()),
            "enhancements": enhancements,
            "raw": block,
        })
        _common.emit_progress(i + 1, len(keys), f"tier {key}")
    return records


def main():
    pak = _common.open_vpk()
    records = build(pak)
    _common.emit_meta(domain="neutral-items", records=len(records))
    _common.dump(records)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_neutral_extractor_tiers -q`
Expected: PASS (skips if VPK absent).

- [ ] **Step 5: Commit**

```bash
git add apps/cli/extractors/neutral.py apps/cli/extractors/tests/test_extractors.py
git commit -m "feat(cli): neutral items extractor (trinkets + enhancements)"
```

---

## Task 6: `abilities.py` extractor

**Files:**
- Create: `apps/cli/extractors/abilities.py`
- Modify: `apps/cli/extractors/tests/test_extractors.py`

**Interfaces:**
- Produces: `python abilities.py` prints a JSON array of ability records: `{ "id": int|None, "key": str, "name": str|None, "description_raw": str|None, "lore": str|None, "scepter": str|None, "shard": str|None, "icon": str, "raw": <ability block> }`. Reads ability defs from `scripts/npc/npc_abilities.txt` (root `DOTAAbilities`).

- [ ] **Step 1: Add ground-truth test to `tests/test_extractors.py`**

```python
def test_abilities_extractor_laguna():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    records = _run("abilities.py")
    laguna = next(r for r in records if r["key"] == "lina_laguna_blade")
    assert laguna["name"] == "Laguna Blade"
    assert laguna["shard"] is not None
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_abilities_extractor_laguna -q`
Expected: FAIL — no `abilities.py`.

- [ ] **Step 3: Implement `apps/cli/extractors/abilities.py`**

```python
import re
import _common


def ability_ids(pak):
    raw = pak.get_file("scripts/npc/npc_ability_ids.txt").read().decode("utf-8", "ignore")
    ids = {}
    for name, num in re.findall(r'"([A-Za-z0-9_]+)"\s+"(\d+)"', raw):
        if not name.startswith("item_"):
            ids[name] = int(num)
    return ids


def build(pak, loc_tokens, ids):
    defs = _common.read_kv(pak, "scripts/npc/npc_abilities.txt")["DOTAAbilities"]
    keys = [k for k in defs if isinstance(defs[k], dict) and not k.startswith("item_")]
    records = []
    for i, key in enumerate(keys):
        block = defs[key]
        records.append({
            "id": ids.get(key),
            "key": key,
            "name": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}"),
            "description_raw": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Description"),
            "lore": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Lore"),
            "scepter": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_scepter_description"),
            "shard": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_shard_description"),
            "icon": _common.icon_url("abilities", key),
            "raw": block,
        })
        _common.emit_progress(i + 1, len(keys), key)
    return records


def main():
    pak = _common.open_vpk()
    loc_tokens = _common.load_loc(pak, "resource/localization/abilities_english.txt")
    ids = ability_ids(pak)
    records = build(pak, loc_tokens, ids)
    _common.emit_meta(domain="abilities", records=len(records))
    _common.dump(records)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_abilities_extractor_laguna -q`
Expected: PASS (skips if VPK absent).

- [ ] **Step 5: Commit**

```bash
git add apps/cli/extractors/abilities.py apps/cli/extractors/tests/test_extractors.py
git commit -m "feat(cli): abilities extractor (full block + Aghs upgrades)"
```

---

## Task 7: `heroes.py` extractor (talents, innate, facets)

**Files:**
- Create: `apps/cli/extractors/heroes.py`
- Modify: `apps/cli/extractors/tests/test_extractors.py`

**Interfaces:**
- Produces: `python heroes.py` prints a JSON array of hero records: `{ "id": int|None, "key": str, "name": str|None, "primary_attr": str|None, "roles": [str], "lore": str|None, "abilities": [str], "talents": [str], "facets": [{ "key": str, "name": str|None, "description": str|None }], "icon": str, "icon_small": str, "raw": <hero block> }`. Hero defs from `scripts/npc/heroes/npc_dota_hero_*.txt`; hero list index from `scripts/npc/npc_heroes.txt` (root `DOTAHeroes`).

- [ ] **Step 1: Add ground-truth test to `tests/test_extractors.py`**

```python
def test_heroes_extractor_count_and_lina():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    records = _run("heroes.py")
    assert len(records) >= 120
    lina = next(r for r in records if r["key"] == "npc_dota_hero_lina")
    assert lina["name"] == "Lina"
    assert lina["primary_attr"] in ("DOTA_ATTRIBUTE_INTELLECT", "int", "DOTA_ATTRIBUTE_UNIVERSAL")
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_heroes_extractor_count_and_lina -q`
Expected: FAIL — no `heroes.py`.

- [ ] **Step 3: Implement `apps/cli/extractors/heroes.py`**

```python
import re
import _common


def _as_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _roles(block):
    raw = block.get("Role")
    if not isinstance(raw, str):
        return []
    return [r for r in raw.split(",") if r]


def _abilities(block):
    keys = sorted(
        (k for k in block if re.fullmatch(r"Ability\d+", k)),
        key=lambda k: int(k[len("Ability"):]),
    )
    values = [block[k] for k in keys if isinstance(block[k], str) and block[k] != "generic_hidden"]
    return values


def _talents(block):
    keys = sorted(
        (k for k in block if re.fullmatch(r"Ability(1[0-9]|2[0-9])", k)),
        key=lambda k: int(k[len("Ability"):]),
    )
    return [block[k] for k in keys if isinstance(block[k], str)]


def _facets(block, loc_tokens, hero_short):
    facets = block.get("Facets")
    if not isinstance(facets, dict):
        return []
    out = []
    for key in facets:
        out.append({
            "key": key,
            "name": _common.loc(loc_tokens, f"DOTA_Tooltip_Facet_{hero_short}_{key}", f"DOTA_Tooltip_facet_{key}"),
            "description": _common.loc(loc_tokens, f"DOTA_Tooltip_Facet_{hero_short}_{key}_Description"),
        })
    return out


def build(pak, hero_loc, facet_loc):
    index = _common.read_kv(pak, "scripts/npc/npc_heroes.txt")["DOTAHeroes"]
    keys = [k for k in index if k.startswith("npc_dota_hero_") and isinstance(index[k], dict)]
    records = []
    for i, key in enumerate(keys):
        short = key[len("npc_dota_hero_"):]
        path = f"scripts/npc/heroes/{key}.txt"
        try:
            block = _common.read_kv(pak, path)[key]
        except Exception:
            block = index[key]
        records.append({
            "id": _int(block.get("HeroID")),
            "key": key,
            "name": _common.loc(hero_loc, key),
            "primary_attr": block.get("AttributePrimary"),
            "roles": _roles(block),
            "lore": _common.loc(hero_loc, f"{key}_bio", f"{key}_hype"),
            "abilities": _abilities(block),
            "talents": _talents(block),
            "facets": _facets(block, facet_loc, short),
            "icon": _common.icon_url("heroes", short),
            "icon_small": _common.icon_url("heroes/icons", short),
            "raw": block,
        })
        _common.emit_progress(i + 1, len(keys), key)
    return records


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def main():
    pak = _common.open_vpk()
    hero_loc = _common.load_loc(pak, "resource/localization/dota_english.txt", "resource/localization/hero_lore_english.txt")
    facet_loc = _common.load_loc(pak, "resource/localization/abilities_english.txt")
    records = build(pak, hero_loc, facet_loc)
    _common.emit_meta(domain="heroes", records=len(records))
    _common.dump(records)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/cli/extractors && /tmp/kvenv/bin/python -m pytest tests/test_extractors.py::test_heroes_extractor_count_and_lina -q`
Expected: PASS (skips if VPK absent). If `AttributePrimary`/`Facets` casing differs, adjust the assertion after inspecting one parsed block — the `raw` dump still carries every field.

- [ ] **Step 5: Commit**

```bash
git add apps/cli/extractors/heroes.py apps/cli/extractors/tests/test_extractors.py
git commit -m "feat(cli): heroes extractor (stats, talents, innate, facets)"
```

---

## Task 8: Python runner + venv bootstrap (`lib/python.ts`)

**Files:**
- Create: `apps/cli/src/lib/config.ts`
- Create: `apps/cli/src/lib/python.ts`
- Create: `apps/cli/src/lib/__tests__/python.test.ts`

**Interfaces:**
- Consumes: `config.ts` paths.
- Produces:
  - `config`: `{ cliRoot, extractorsDir, venvPython, dataDir, dotaPath, vpkPath }` (absolute paths).
  - `ensureVenv(): Promise<void>` — create `.venv` + `pip install -r requirements.txt` if `venvPython` is missing.
  - `runExtractor(domain: string, onProgress?: (e: ProgressEvent) => void): Promise<{ records: unknown[]; meta: Record<string, unknown> }>` — spawn `<venvPython> extractors/<domain>.py`, parse stdout JSON, parse stderr NDJSON events.
  - `type ProgressEvent = { event: "progress"; done: number; total: number; label: string }`.

- [ ] **Step 1: Create `apps/cli/src/lib/config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = resolve(here, "..", "..");

const dotaPath =
  process.env.DOTA_PATH ??
  join(homedir(), "Library", "Application Support", "Steam", "steamapps", "common", "dota 2 beta");

export const config = {
  cliRoot,
  extractorsDir: join(cliRoot, "extractors"),
  venvPython: join(cliRoot, ".venv", "bin", "python"),
  dataDir: resolve(cliRoot, "..", "api", "src", "data"),
  dotaPath,
  vpkPath: join(dotaPath, "game", "dota", "pak01_dir.vpk"),
};

export const DOMAINS = ["items", "neutral-items", "abilities", "heroes"] as const;
export type Domain = (typeof DOMAINS)[number];

export const SCRIPT_BY_DOMAIN: Record<Domain, string> = {
  items: "items.py",
  "neutral-items": "neutral.py",
  abilities: "abilities.py",
  heroes: "heroes.py",
};
```

- [ ] **Step 2: Write the failing test `apps/cli/src/lib/__tests__/python.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runScript } from "../python.js";

describe("runScript", () => {
  it("splits stdout JSON from stderr progress events", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dota-"));
    const script = join(dir, "fake.py");
    writeFileSync(
      script,
      [
        "import sys, json",
        'print(json.dumps({"event":"progress","done":1,"total":2,"label":"a"}), file=sys.stderr)',
        'print(json.dumps({"event":"meta","domain":"x","records":1}), file=sys.stderr)',
        'json.dump([{"k":1}], sys.stdout)',
      ].join("\n"),
    );
    const events: unknown[] = [];
    const result = await runScript("python3", script, {}, (e) => events.push(e));
    expect(result.records).toEqual([{ k: 1 }]);
    expect(result.meta).toMatchObject({ domain: "x", records: 1 });
    expect(events).toContainEqual({ event: "progress", done: 1, total: 2, label: "a" });
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm --filter @dota-helper/cli test`
Expected: FAIL — cannot import `runScript` from `../python.js`.

- [ ] **Step 4: Implement `apps/cli/src/lib/python.ts`**

```ts
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config, SCRIPT_BY_DOMAIN, type Domain } from "./config.js";

export type ProgressEvent = { event: "progress"; done: number; total: number; label: string };
type Event = ProgressEvent | { event: "meta"; [k: string]: unknown };

export function runScript(
  python: string,
  scriptPath: string,
  env: Record<string, string>,
  onProgress?: (e: ProgressEvent) => void,
): Promise<{ records: unknown[]; meta: Record<string, unknown> }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(python, [scriptPath], {
      env: { ...process.env, ...env },
    });
    let stdout = "";
    let stderrBuffer = "";
    let meta: Record<string, unknown> = {};

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk;
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let event: Event;
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.event === "progress") onProgress?.(event);
        else if (event.event === "meta") meta = event;
      }
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`extractor exited ${code}: ${stderrBuffer}`));
        return;
      }
      try {
        resolvePromise({ records: JSON.parse(stdout), meta });
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function ensureVenv(): Promise<void> {
  if (existsSync(config.venvPython)) return Promise.resolve();
  return new Promise((resolvePromise, reject) => {
    const venvDir = join(config.cliRoot, ".venv");
    const create = spawn("python3", ["-m", "venv", venvDir], { stdio: "inherit" });
    create.on("error", reject);
    create.on("close", (code) => {
      if (code !== 0) return reject(new Error("venv creation failed"));
      const pip = spawn(
        config.venvPython.replace(/python$/, "pip"),
        ["install", "-q", "-r", join(config.extractorsDir, "requirements.txt")],
        { stdio: "inherit" },
      );
      pip.on("error", reject);
      pip.on("close", (c) => (c === 0 ? resolvePromise() : reject(new Error("pip install failed"))));
    });
  });
}

export async function runExtractor(
  domain: Domain,
  onProgress?: (e: ProgressEvent) => void,
): Promise<{ records: unknown[]; meta: Record<string, unknown> }> {
  await ensureVenv();
  const scriptPath = join(config.extractorsDir, SCRIPT_BY_DOMAIN[domain]);
  return runScript(config.venvPython, scriptPath, { DOTA_PATH: config.dotaPath }, onProgress);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter @dota-helper/cli test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/cli/src/lib/config.ts apps/cli/src/lib/python.ts apps/cli/src/lib/__tests__/python.test.ts
git commit -m "feat(cli): python runner + venv bootstrap + stream protocol"
```

---

## Task 9: Sinks + Δ diff (`lib/sinks.ts`)

**Files:**
- Create: `apps/cli/src/lib/sinks.ts`
- Create: `apps/cli/src/lib/__tests__/sinks.test.ts`

**Interfaces:**
- Consumes: `config.dataDir`.
- Produces:
  - `type WriteResult = { path: string | null; delta: number; previous: number }`.
  - `interface Sink { write(domain: string, records: unknown[]): Promise<WriteResult>; }`
  - `diffRecords(previous: unknown[] | null, next: unknown[]): number` — `next.length - (previous?.length ?? 0)`.
  - `localSink(dataDir: string): Sink` — writes `<dataDir>/<domain>.json` (pretty, 2-space), returns delta vs prior file.
  - `dryRunSink(dataDir: string): Sink` — computes delta, writes nothing (`path: null`).
  - `prodSink(): Sink` — `write` rejects with `Error("prod target not implemented")`.
  - `getSink(target: string, opts: { dryRun: boolean }): Sink` — `local` → local/dryRun; `prod` → prodSink; else throws `Error("unknown target: <t>")`.

- [ ] **Step 1: Write the failing test `apps/cli/src/lib/__tests__/sinks.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { diffRecords, localSink, dryRunSink, prodSink, getSink } from "../sinks.js";

describe("sinks", () => {
  it("diffRecords compares lengths", () => {
    expect(diffRecords(null, [1, 2])).toBe(2);
    expect(diffRecords([1], [1, 2, 3])).toBe(2);
  });

  it("localSink writes pretty JSON and reports delta", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sink-"));
    writeFileSync(join(dir, "items.json"), JSON.stringify([{ a: 1 }]));
    const result = await localSink(dir).write("items", [{ a: 1 }, { b: 2 }]);
    expect(result.path).toBe(join(dir, "items.json"));
    expect(result.delta).toBe(1);
    expect(JSON.parse(readFileSync(join(dir, "items.json"), "utf8"))).toHaveLength(2);
  });

  it("dryRunSink writes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sink-"));
    const result = await dryRunSink(dir).write("items", [{ a: 1 }]);
    expect(result.path).toBeNull();
    expect(result.delta).toBe(1);
  });

  it("prodSink is unimplemented", async () => {
    await expect(prodSink().write("items", [])).rejects.toThrow("not implemented");
  });

  it("getSink routes targets", () => {
    expect(() => getSink("bogus", { dryRun: false })).toThrow("unknown target");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @dota-helper/cli test`
Expected: FAIL — cannot import from `../sinks.js`.

- [ ] **Step 3: Implement `apps/cli/src/lib/sinks.ts`**

```ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

export type WriteResult = { path: string | null; delta: number; previous: number };

export interface Sink {
  write(domain: string, records: unknown[]): Promise<WriteResult>;
}

export function diffRecords(previous: unknown[] | null, next: unknown[]): number {
  return next.length - (previous?.length ?? 0);
}

function readPrevious(file: string): unknown[] | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function localSink(dataDir: string): Sink {
  return {
    async write(domain, records) {
      const file = join(dataDir, `${domain}.json`);
      const previous = readPrevious(file);
      writeFileSync(file, JSON.stringify(records, null, 2));
      return { path: file, delta: diffRecords(previous, records), previous: previous?.length ?? 0 };
    },
  };
}

export function dryRunSink(dataDir: string): Sink {
  return {
    async write(domain, records) {
      const file = join(dataDir, `${domain}.json`);
      const previous = readPrevious(file);
      return { path: null, delta: diffRecords(previous, records), previous: previous?.length ?? 0 };
    },
  };
}

export function prodSink(): Sink {
  return {
    async write() {
      throw new Error("prod target not implemented");
    },
  };
}

export function getSink(target: string, opts: { dryRun: boolean }): Sink {
  if (target === "local") {
    return opts.dryRun ? dryRunSink(config.dataDir) : localSink(config.dataDir);
  }
  if (target === "prod") return prodSink();
  throw new Error(`unknown target: ${target}`);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @dota-helper/cli test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cli/src/lib/sinks.ts apps/cli/src/lib/__tests__/sinks.test.ts
git commit -m "feat(cli): sink abstraction (local/dry-run, prod reserved) + delta"
```

---

## Task 10: Render helpers (`lib/render.ts`)

**Files:**
- Create: `apps/cli/src/lib/render.ts`
- Create: `apps/cli/src/lib/__tests__/render.test.ts`

**Interfaces:**
- Produces:
  - `type SummaryRow = { domain: string; records: number; delta: number; status: string }`.
  - `formatDelta(delta: number): string` — `"+3"`, `"-2"`, or `"0"` (colored via picocolors).
  - `summaryTable(rows: SummaryRow[]): string` — a cli-table3 render.
  - `createSpinner(text: string)` — thin wrapper over yocto-spinner returning `{ start, succeed(text), fail(text) }`.

- [ ] **Step 1: Write the failing test `apps/cli/src/lib/__tests__/render.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatDelta, summaryTable } from "../render.js";

function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("render", () => {
  it("formatDelta signs the number", () => {
    expect(strip(formatDelta(3))).toBe("+3");
    expect(strip(formatDelta(-2))).toBe("-2");
    expect(strip(formatDelta(0))).toBe("0");
  });

  it("summaryTable includes domain rows", () => {
    const out = strip(summaryTable([{ domain: "items", records: 594, delta: 0, status: "ok" }]));
    expect(out).toContain("items");
    expect(out).toContain("594");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @dota-helper/cli test`
Expected: FAIL — cannot import from `../render.js`.

- [ ] **Step 3: Implement `apps/cli/src/lib/render.ts`**

```ts
import Table from "cli-table3";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export type SummaryRow = { domain: string; records: number; delta: number; status: string };

export function formatDelta(delta: number): string {
  if (delta > 0) return pc.green(`+${delta}`);
  if (delta < 0) return pc.red(`${delta}`);
  return pc.dim("0");
}

export function summaryTable(rows: SummaryRow[]): string {
  const table = new Table({ head: ["domain", "records", "Δ", "status"] });
  for (const row of rows) {
    table.push([row.domain, String(row.records), formatDelta(row.delta), row.status]);
  }
  return table.toString();
}

export function createSpinner(text: string) {
  const spinner = yoctoSpinner({ text });
  return {
    start: () => spinner.start(),
    succeed: (msg: string) => spinner.success(msg),
    fail: (msg: string) => spinner.error(msg),
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @dota-helper/cli test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cli/src/lib/render.ts apps/cli/src/lib/__tests__/render.test.ts
git commit -m "feat(cli): pretty render helpers (table, delta, spinner)"
```

---

## Task 11: `data extract` command

**Files:**
- Create: `apps/cli/src/commands/data.ts`
- Modify: `apps/cli/src/index.ts`

**Interfaces:**
- Consumes: `runExtractor` (python.ts), `getSink` (sinks.ts), `summaryTable`/`createSpinner` (render.ts), `DOMAINS`/`Domain` (config.ts).
- Produces: `registerDataCommand(cli: CAC): void` registering `data <action> [...domains]` with `--target <name>` (default `local`) and `--dry-run`. Only `action = "extract"` is supported; anything else errors. (cac matches a command by `argv[0]` only, so the group must be a single-token name `data` with `action` as a positional — not a two-word `"data extract"` name, which never matches.)

- [ ] **Step 1: Implement `apps/cli/src/commands/data.ts`**

```ts
import type { CAC } from "cac";
import pc from "picocolors";
import { DOMAINS, type Domain } from "../lib/config.js";
import { runExtractor } from "../lib/python.js";
import { getSink } from "../lib/sinks.js";
import { createSpinner, summaryTable, type SummaryRow } from "../lib/render.js";

export function registerDataCommand(cli: CAC): void {
  cli
    .command("data <action> [...domains]", "Static data ops (action: extract)")
    .option("--target <name>", "Where to write the data", { default: "local" })
    .option("--dry-run", "Extract without writing")
    .action(async (action: string, domains: string[], options: { target: string; dryRun?: boolean }) => {
      if (action !== "extract") {
        console.error(pc.red(`unknown action: ${action} (expected "extract")`));
        process.exitCode = 1;
        return;
      }
      const selected: Domain[] = domains.length
        ? (domains as Domain[])
        : [...DOMAINS];
      const invalid = selected.filter((d) => !DOMAINS.includes(d));
      if (invalid.length) {
        console.error(pc.red(`unknown domain(s): ${invalid.join(", ")}`));
        process.exitCode = 1;
        return;
      }

      const sink = getSink(options.target, { dryRun: Boolean(options.dryRun) });
      const rows: SummaryRow[] = [];

      for (const domain of selected) {
        const spinner = createSpinner(`extracting ${domain}`);
        spinner.start();
        try {
          const { records } = await runExtractor(domain, (e) => {
            spinner.start();
          });
          const result = await sink.write(domain, records);
          spinner.succeed(`${domain} (${records.length})`);
          rows.push({
            domain,
            records: records.length,
            delta: result.delta,
            status: options.dryRun ? "dry-run" : "written",
          });
        } catch (err) {
          spinner.fail(`${domain}: ${(err as Error).message}`);
          rows.push({ domain, records: 0, delta: 0, status: pc.red("failed") });
        }
      }

      console.log("\n" + summaryTable(rows));
    });
}
```

- [ ] **Step 2: Register the command in `apps/cli/src/index.ts`**

```ts
import { cac } from "cac";
import { registerDataCommand } from "./commands/data.js";

const cli = cac("dota");

registerDataCommand(cli);

cli.help();
cli.version("1.0.0");

cli.parse();
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @dota-helper/cli typecheck`
Expected: no type errors.

- [ ] **Step 4: End-to-end dry run against the real VPK**

Run: `pnpm --filter @dota-helper/cli dota data extract --dry-run`
Expected: a spinner per domain, then a summary table with `items`, `neutral-items`, `abilities`, `heroes` and their record counts; status `dry-run`. (If the VPK is absent, extractors fail gracefully with per-row `failed`.)

- [ ] **Step 5: Commit**

```bash
git add apps/cli/src/commands/data.ts apps/cli/src/index.ts
git commit -m "feat(cli): dota data extract command"
```

---

## Task 12: `doctor` command

**Files:**
- Create: `apps/cli/src/commands/doctor.ts`
- Modify: `apps/cli/src/index.ts`

**Interfaces:**
- Consumes: `config` (paths), node `fs`/`child_process`.
- Produces: `registerDoctorCommand(cli: CAC): void` registering `doctor`, printing pass/fail checks for: Steam/VPK path, `python3` availability, venv presence, `vpk` importability.

- [ ] **Step 1: Implement `apps/cli/src/commands/doctor.ts`**

```ts
import type { CAC } from "cac";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { config } from "../lib/config.js";

type Check = { label: string; ok: boolean; hint?: string };

function checks(): Check[] {
  const python3 = spawnSync("python3", ["--version"]);
  const venvOk = existsSync(config.venvPython);
  const vpkImport = venvOk
    ? spawnSync(config.venvPython, ["-c", "import vpk"]).status === 0
    : false;
  return [
    { label: `Dota install: ${config.dotaPath}`, ok: existsSync(config.dotaPath), hint: "set DOTA_PATH" },
    { label: `VPK archive: ${config.vpkPath}`, ok: existsSync(config.vpkPath), hint: "install Dota 2 / verify files" },
    { label: "python3 available", ok: python3.status === 0, hint: "install Python 3" },
    { label: "venv present (.venv)", ok: venvOk, hint: "run `dota data extract` to bootstrap" },
    { label: "vpk module installed", ok: vpkImport, hint: "run `dota data extract` to bootstrap" },
  ];
}

export function registerDoctorCommand(cli: CAC): void {
  cli.command("doctor", "Verify the extraction toolchain").action(() => {
    let allOk = true;
    for (const check of checks()) {
      const mark = check.ok ? pc.green("✓") : pc.red("✗");
      const hint = check.ok ? "" : pc.dim(`  → ${check.hint}`);
      if (!check.ok) allOk = false;
      console.log(`${mark} ${check.label}${hint}`);
    }
    if (!allOk) process.exitCode = 1;
  });
}
```

- [ ] **Step 2: Register in `apps/cli/src/index.ts`**

```ts
import { cac } from "cac";
import { registerDataCommand } from "./commands/data.js";
import { registerDoctorCommand } from "./commands/doctor.js";

const cli = cac("dota");

registerDataCommand(cli);
registerDoctorCommand(cli);

cli.help();
cli.version("1.0.0");

cli.parse();
```

- [ ] **Step 3: Typecheck + run**

Run: `pnpm --filter @dota-helper/cli typecheck && pnpm --filter @dota-helper/cli dota doctor`
Expected: a checklist with ✓/✗ per row; exit 0 when all pass.

- [ ] **Step 4: Commit**

```bash
git add apps/cli/src/commands/doctor.ts apps/cli/src/index.ts
git commit -m "feat(cli): dota doctor toolchain check"
```

---

## Task 13: Generate committed data, remove old tool, update docs

**Files:**
- Delete: `apps/api/tools/extract-items.py`
- Create/Modify: `apps/api/src/data/items.json`, `apps/api/src/data/neutral-items.json`, `apps/api/src/data/abilities.json`, `apps/api/src/data/heroes.json`
- Modify: `docs/ROADMAP.md` (§5 current state, §12 resume pointer)

**Interfaces:**
- Consumes: the finished CLI.

- [ ] **Step 1: Run the real extraction (writes committed JSON)**

Run: `pnpm --filter @dota-helper/cli dota data extract`
Expected: four files written under `apps/api/src/data/`; summary table shows non-zero record counts and status `written`.

- [ ] **Step 2: Sanity-check outputs**

Run: `node -e "for (const d of ['items','neutral-items','abilities','heroes']) { const a=require('./apps/api/src/data/'+d+'.json'); console.log(d, a.length); }"`
Expected: `items` ~600+, `neutral-items` 5, `abilities` 900+, `heroes` 120+.

- [ ] **Step 3: Remove the superseded tool**

Run: `git rm apps/api/tools/extract-items.py`
Expected: file staged for deletion. (The API still reads `items.json`, whose shape is a superset — verify the api typechecks: `pnpm --filter @dota-helper/api typecheck`.)

- [ ] **Step 4: Verify api still typechecks against the new items.json shape**

Run: `pnpm --filter @dota-helper/api typecheck`
Expected: no errors. If `getItems()` in `apps/api/src/steam.ts` iterates the old `{id: name}` object shape, update it to read the new array shape (`items.json` is now `Array<{id,key,name,icon,...}>`) — map to the existing `Item` interface (`{ id, name, icon }`) using `key` for `name` slug and the record's `icon`.

- [ ] **Step 5: Update `docs/ROADMAP.md`**

In §5, replace the item-extraction bullet to note the new CLI + four data files. In §12, change the resume pointer to: "Static-data CLI shipped (Sub-project S). Next: wire item/hero tooltips in the UI, or resume Sub-project A (STRATZ)." Keep edits terse, match the doc's voice.

- [ ] **Step 6: Full test sweep**

Run: `pnpm --filter @dota-helper/cli test && cd apps/cli/extractors && python3 -m pytest tests/test_kv.py -q`
Expected: Vitest green; pytest KV tests green.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/data docs/ROADMAP.md apps/api/src/steam.ts
git rm --cached apps/api/tools/extract-items.py 2>/dev/null || true
git commit -m "feat(cli): generate full static data set; retire extract-items.py"
```

---

## Self-Review Notes

- **Spec coverage:** §3 placement → Task 1, 13. §4 extractors/fidelity → Tasks 2–7. §5 CLI commands → Tasks 11, 12. §6 venv bootstrap → Task 8. §7 testing (pytest KV + ground-truth, Vitest lib) → Tasks 2–10. §8 sink seam (`local`/`prod`) → Task 9, 11. Deliberate exclusions honored (no cosmetics/patchnotes extractor).
- **Known implementation risks flagged inline:** hero KV key casing (`AttributePrimary`, `Facets`, `Ability10+` talents) may differ per patch — Task 7 Step 4 says adjust the assertion after inspecting one parsed block; the `raw` dump guarantees no data loss regardless. `getItems()` shape migration is handled in Task 13 Step 4.
- **Dependency versions** are floors; `pnpm install` may resolve newer patches.
