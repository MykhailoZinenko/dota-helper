import os
import re
import json
import vpk

DEFAULT_DOTA = os.path.expanduser(
    "~/Library/Application Support/Steam/steamapps/common/dota 2 beta"
)
DOTA_PATH = os.environ.get("DOTA_PATH", DEFAULT_DOTA)
VPK_PATH = os.path.join(DOTA_PATH, "game", "dota", "pak01_dir.vpk")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "items.json")

pak = vpk.open(VPK_PATH)
raw = pak.get_file("scripts/npc/npc_ability_ids.txt").read().decode("utf-8", "ignore")

pairs = re.findall(r'"(item_[A-Za-z0-9_]+)"\s+"(\d+)"', raw)
items = {int(item_id): name[len("item_"):] for name, item_id in pairs}

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump({str(k): items[k] for k in sorted(items)}, f, indent=2)

print(f"wrote {len(items)} items to {os.path.normpath(OUT_PATH)}")
