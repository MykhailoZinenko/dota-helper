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
