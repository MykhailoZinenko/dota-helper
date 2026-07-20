import re
import _common


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _roles(block):
    raw = block.get("Role")
    if not isinstance(raw, str):
        return []
    return [r for r in raw.split(",") if r]


def _ability_refs(block):
    keys = sorted(
        (k for k in block if re.fullmatch(r"Ability\d+", k)),
        key=lambda k: int(k[len("Ability"):]),
    )
    return [block[k] for k in keys if isinstance(block[k], str) and block[k] != "generic_hidden"]


def _facets(block, ab_loc):
    facets = block.get("Facets")
    if not isinstance(facets, dict):
        return []
    out = []
    for key in facets:
        if not isinstance(facets[key], dict):
            continue
        out.append({
            "key": key,
            "name": _common.loc(ab_loc, f"DOTA_Tooltip_facet_{key}"),
            "description": _common.loc(ab_loc, f"DOTA_Tooltip_facet_{key}_Description"),
            "raw": facets[key],
        })
    return out


def build(pak, ab_loc, lore_loc):
    index = _common.read_kv(pak, "scripts/npc/npc_heroes.txt")["DOTAHeroes"]
    keys = [
        k for k in index
        if k.startswith("npc_dota_hero_") and k != "npc_dota_hero_base" and isinstance(index[k], dict)
    ]
    records = []
    for i, key in enumerate(keys):
        block = index[key]
        short = key[len("npc_dota_hero_"):]
        refs = _ability_refs(block)
        records.append({
            "id": _int(block.get("HeroID")),
            "key": key,
            "name": _common.loc(ab_loc, f"{key}:n"),
            "primary_attr": block.get("AttributePrimary"),
            "roles": _roles(block),
            "lore": _common.loc(lore_loc, f"{key}_bio"),
            "abilities": [a for a in refs if not a.startswith("special_bonus")],
            "talents": [a for a in refs if a.startswith("special_bonus")],
            "facets": _facets(block, ab_loc),
            "icon": _common.icon_url("heroes", short),
            "icon_small": _common.icon_url("heroes/icons", short),
            "raw": block,
        })
        _common.emit_progress(i + 1, len(keys), key)
    return records


def main():
    pak = _common.open_vpk()
    ab_loc = _common.load_loc(pak, "resource/localization/abilities_english.txt")
    lore_loc = _common.load_loc(pak, "resource/localization/hero_lore_english.txt")
    records = build(pak, ab_loc, lore_loc)
    _common.emit_meta(domain="heroes", records=len(records))
    _common.dump(records)


if __name__ == "__main__":
    main()
