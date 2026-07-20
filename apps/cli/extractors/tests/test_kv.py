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
