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
