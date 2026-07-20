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
