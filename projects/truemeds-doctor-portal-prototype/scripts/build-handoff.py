#!/usr/bin/env python3
"""Web -> native token map for the hand-off kit (called by scripts/build-handoff.mjs; prints JSON).

Built from the SAME code that writes the CSS variables and design-system/native/tokens.ts
(design-system/scripts/build.py and build_native.py), never by matching values or guessing names:
  - every --tm-* variable truemeds.css declares, with the native path that holds the same token
  - the .tm-text-* classes -> tokens.text.*
  - aliases the components layer declares in :root (e.g. --tm-space-page -> --tm-space-lg)
Each native path is checked to exist in native/tokens.json; the script fails if one does not.

Usage: python3 scripts/build-handoff.py <design-system dir>
"""
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # design-system/ is read-only for this job: no __pycache__ there

DS = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(DS / "scripts"))
import build  # noqa: E402  (design-system/scripts/build.py: web names)
import build_native  # noqa: E402  (design-system/scripts/build_native.py: native names)

native_tokens = json.loads((DS / "native/tokens.json").read_text())


def get(path):
    node = native_tokens
    for p in path:
        if not isinstance(node, dict) or p not in node:
            return None
        node = node[p]
    return node


def native_path(path):
    """Mirror of build_native.semantic(): Default.tokens.json path -> native path list."""
    k = build_native.key
    if path[0] == "Colour":
        return ["color"] + [k(p) for p in path[1:]]
    if path[0] == "Space":
        return ["space", path[1]]
    if path[0] == "Radius":
        return ["radius", path[1]]
    if path[0] == "Font":
        if path[1] == "Family":
            return ["font", "family"]  # collapsed to one string by build_native.semantic()
        return ["font"] + [k(p) for p in path[1:]]
    if path[0] == "Overlay":
        return ["overlayOpacity", k(path[1])]
    return None


out = {"vars": {}, "textClasses": {}, "aliases": {}, "palette": {}}
problems = []


def add(web, npath, source, kind="semantic"):
    val = get(npath)
    if val is None:
        problems.append(f"{web} -> tokens.{'.'.join(npath)} missing in native/tokens.json")
        return
    out["vars"][web] = {"native": npath, "value": val, "source": source, "kind": kind}


# 1. Semantic tokens (Default.tokens.json), names exactly as build.sem_var() writes them
default = json.loads((DS / "tokens/Default.tokens.json").read_text())
for path, _tok in build.walk(default, []):
    np_ = native_path(path)
    if np_ is not None:
        add(build.sem_var(path), np_, "SALT semantic")

# 2. Truemeds layer (tokens/truemeds.json), as build.truemeds_overrides() / build_native.truemeds()
tm = json.loads((DS / "tokens/truemeds.json").read_text())
for name in tm["content"]:
    add(f"--tm-content-{name}", ["color", "content", build_native.key(name)], "Truemeds layer")
for name in tm["text"]:
    out["textClasses"][f"tm-text-{name}"] = ["text", build_native.key(name)]
# D-98 sizes (tokens/truemeds.json "size"), as build.truemeds_overrides() / build_native.truemeds()
for group, vals in tm.get("size", {}).items():
    if group.startswith("_"):
        continue
    for name in vals:
        if not name.startswith("_"):
            add(f"--tm-{group}-{name}", [build_native.key(group), build_native.key(name)], "Truemeds layer (D-98/D-99)")
# D-99 non-px scales (tokens/truemeds.json "scale"): duration, easing, layer, opacity, pressed, sheet
for group, vals in tm.get("scale", {}).items():
    if group.startswith("_"):
        continue
    for name in vals:
        if not name.startswith("_"):
            add(f"--tm-{group}-{name}", [build_native.key(group), build_native.key(name)], "Truemeds layer (D-99)")
for name in tm.get("shadow", {}):
    if not name.startswith("_"):
        add(f"--tm-shadow-{name}", ["shadow", build_native.key(name)], "Truemeds layer (D-99)")

# 3. Shadows and text styles (tokens/extras.json), as build.build_extras() / build_native.extras()
ex = json.loads((DS / "tokens/extras.json").read_text())
for name in ex["shadow"]:
    if not name.startswith("_"):
        add(f"--tm-shadow-{name}", ["shadow", build_native.key(name)], "SALT shadow page")
for name in ex["text"]:
    if not name.startswith("_"):
        out["textClasses"][f"tm-text-{name}"] = ["text", build_native.key(name)]
for cls, np_ in out["textClasses"].items():
    if get(np_) is None:
        problems.append(f".{cls} -> tokens.{'.'.join(np_)} missing")

# 4. Core palette (--tm-core-*): the raw palette; mapped so a stray use can be named, but flagged
core = json.loads((DS / "tokens/Core.tokens.json").read_text())
for path, _tok in build.walk(core, []):
    if path[0] == "Colour":
        shade = path[-1].split()[-1]
        family = build_native.key(path[-1].rsplit(" ", 1)[0])
        if get(["palette", family, shade]) is not None:
            out["palette"][build.core_var(path)] = {"native": ["palette", family, shade],
                                                    "value": get(["palette", family, shade])}

# 5. Aliases declared by the components layer in :root (--tm-x: var(--tm-y))
comp = (DS / "src/components.css").read_text()
root = re.search(r":root\s*\{(.*?)\}", comp, re.S)
for line_no, line in enumerate(comp.splitlines(), 1):
    m = re.match(r"\s*(--tm-[a-z0-9-]+)\s*:\s*var\((--tm-[a-z0-9-]+)\)\s*;", line)
    if m and root and m.group(0).strip() in root.group(1):
        out["aliases"][m.group(1)] = {"to": m.group(2), "file": "design-system/src/components.css", "line": line_no}

if problems:
    sys.stderr.write("\n".join(problems) + "\n")
    sys.exit(1)
print(json.dumps(out, indent=1, ensure_ascii=False))
