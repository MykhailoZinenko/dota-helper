import os
import sys
import subprocess
import json

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
    recipe = next(r for r in records if r["key"] == "item_recipe_magic_wand")
    assert "ItemRequirements" in recipe["raw"]


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


def test_abilities_extractor_laguna():
    if skip:
        import pytest
        pytest.skip("VPK not present")
    records = _run("abilities.py")
    laguna = next(r for r in records if r["key"] == "lina_laguna_blade")
    assert laguna["name"] == "Laguna Blade"
    assert laguna["shard"] is not None
    assert laguna["hero"] == "lina"
    talent = next(r for r in records if r["key"] == "special_bonus_unique_lina_1")
    assert talent["is_talent"] is True
    assert talent["hero"] == "lina"
    assert len(records) > 1900
