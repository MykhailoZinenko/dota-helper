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
