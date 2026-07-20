import re
import _common


def ability_ids(pak):
    raw = pak.get_file("scripts/npc/npc_ability_ids.txt").read().decode("utf-8", "ignore")
    return {name: int(num) for name, num in re.findall(r'"([A-Za-z0-9_]+)"\s+"(\d+)"', raw) if not name.startswith("item_")}


def hero_files(pak):
    return sorted(p for p in pak if p.startswith("scripts/npc/heroes/npc_dota_hero_") and p.endswith(".txt"))


def _record(key, block, hero, loc_tokens, ids):
    return {
        "id": ids.get(key),
        "key": key,
        "hero": hero,
        "is_talent": key.startswith("special_bonus"),
        "name": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}"),
        "description_raw": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Description"),
        "lore": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_Lore"),
        "scepter": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_scepter_description"),
        "shard": _common.loc(loc_tokens, f"DOTA_Tooltip_ability_{key}_shard_description"),
        "icon": _common.icon_url("abilities", key),
        "raw": block,
    }


def build(pak, loc_tokens, ids):
    records = []
    generic = _common.read_kv(pak, "scripts/npc/npc_abilities.txt")["DOTAAbilities"]
    for key in generic:
        if key == "Version" or not isinstance(generic[key], dict):
            continue
        records.append(_record(key, generic[key], None, loc_tokens, ids))
    files = hero_files(pak)
    for i, path in enumerate(files):
        hero = path[len("scripts/npc/heroes/npc_dota_hero_"):-len(".txt")]
        block = _common.read_kv(pak, path)["DOTAAbilities"]
        for key in block:
            if key == "Version" or not isinstance(block[key], dict):
                continue
            records.append(_record(key, block[key], hero, loc_tokens, ids))
        _common.emit_progress(i + 1, len(files), hero)
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
