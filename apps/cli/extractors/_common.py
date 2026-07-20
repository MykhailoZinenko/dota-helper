import json
import os
import re
import sys

import vpk

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


CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react"
DEFAULT_DOTA = os.path.expanduser(
    "~/Library/Application Support/Steam/steamapps/common/dota 2 beta"
)


def dota_path():
    return os.environ.get("DOTA_PATH", DEFAULT_DOTA)


def open_vpk():
    return vpk.open(os.path.join(dota_path(), "game", "dota", "pak01_dir.vpk"))


def read_kv(pak, path):
    text = pak.get_file(path).read().decode("utf-8", "ignore").lstrip("﻿")
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
