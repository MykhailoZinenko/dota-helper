import json
import os
import re
import sys

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
