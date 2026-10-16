#!/usr/bin/env python3
"""Build the React Native copy of the design system from the same SALT sources as truemeds.css.

Inputs (same as scripts/build.py; never hand-edit outputs):
  tokens/Core.tokens.json, tokens/Default.tokens.json, tokens/extras.json
  icons/icons.js               (built by scripts/build-icons.mjs)
Outputs (in native/):
  tokens.json                  every value resolved: hex colours, plain numbers
  tokens.ts                    same, as a typed `as const` object for React Native
  icons.ts                     every bundled icon as an SVG string (Tabler + [PROPOSED] glyphs)

Run: python3 scripts/build_native.py   (also run automatically by scripts/build.py; no dependencies)
"""
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "native"
WEIGHTS = {"Regular": "400", "Medium": "500", "Semibold": "600", "Bold": "700", "Extrabold": "800"}


def walk(node, path):
    if isinstance(node, dict) and "$value" in node:
        yield path, node
        return
    if isinstance(node, dict):
        for k, v in node.items():
            if not k.startswith("$"):
                yield from walk(v, path + [k])


def key(s):
    """'Grey 0' -> 'grey0', 'Brand' -> 'brand', '2xs' -> '2xs', 'LineHeight' -> 'lineHeight'."""
    parts = re.split(r"[^A-Za-z0-9]+", s.strip())
    parts = [p for p in parts if p]
    if not parts:
        return s
    first = parts[0][0].lower() + parts[0][1:]
    return first + "".join(p[0].upper() + p[1:] for p in parts[1:])


def colour(v):
    if isinstance(v, str):
        return v
    a = v.get("alpha", 1)
    if a < 1:
        r, g, b = (round(c * 255) for c in v["components"])
        return f"rgba({r}, {g}, {b}, {a:g})"
    return v["hex"].upper()


def put(tree, path, value):
    node = tree
    for p in path[:-1]:
        node = node.setdefault(key(p), {})
    node[key(path[-1])] = value


def core():
    data = json.loads((ROOT / "tokens/Core.tokens.json").read_text())
    palette = {}
    for path, tok in walk(data, []):
        if path[0] == "Colour":
            # Colour/Blue/Blue 500 -> palette.blue[500] ; Colour/Neutrals/Grey 0 -> palette.grey[0]
            shade = path[-1].split()[-1]
            family = key(path[-1].rsplit(" ", 1)[0])
            palette.setdefault(family, {})[shade] = colour(tok["$value"])
    return palette


def semantic():
    data = json.loads((ROOT / "tokens/Default.tokens.json").read_text())
    flat = {tuple(p): t for p, t in walk(data, [])}

    def resolve(path, seen=()):
        tok = flat[path]
        v = tok["$value"]
        if isinstance(v, str) and v.startswith("{"):
            ref = tuple(v.strip("{}").split("."))
            if ref in seen:
                raise ValueError(f"alias loop at {path}")
            return resolve(ref, seen + (path,))
        if tok["$type"] == "color":
            return colour(v)
        if path[:2] == ("Font", "Weight"):
            return WEIGHTS[v]
        if path[0] == "Overlay":
            return v / 100  # opacity 0–1
        return v

    out = {"color": {}, "space": {}, "radius": {}, "font": {}, "overlayOpacity": {}}
    for path in flat:
        val = resolve(path)
        if path[0] == "Colour":
            put(out["color"], list(path[1:]), val)
        elif path[0] == "Space":
            out["space"][path[1]] = val
        elif path[0] == "Radius":
            out["radius"][path[1]] = val
        elif path[0] == "Font":
            put(out["font"], list(path[1:]), val)
        elif path[0] == "Overlay":
            out["overlayOpacity"][key(path[1])] = val
    # Family is a single string in RN; the font file must be bundled under this name (see native/README.md).
    fam = out["font"].get("family")
    if isinstance(fam, dict):
        out["font"]["family"] = next(iter(fam.values()))
    return out


SHADOW_RE = re.compile(r"(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(-?\d+)px\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)")


def extras(family):
    ex = json.loads((ROOT / "tokens/extras.json").read_text())
    shadows = {}
    for k, v in ex["shadow"].items():
        if k.startswith("_"):
            continue
        m = SHADOW_RE.match(v)
        x, y, blur, _spread, r, g, b, a = m.groups()
        shadows[key(k)] = {
            # React Native 0.76+ (New Architecture) understands CSS box-shadow directly:
            "boxShadow": v,
            # Older React Native: iOS shadow props + an approximate Android elevation.
            "ios": {
                "shadowColor": f"rgb({r}, {g}, {b})",
                "shadowOffset": {"width": int(x), "height": int(y)},
                "shadowOpacity": float(a),
                "shadowRadius": int(blur) / 2,
            },
            "android": {"elevation": max(1, round(int(blur) / 4))},
        }
    text = {}
    for k, v in ex["text"].items():
        if k.startswith("_"):
            continue
        size, lh, weight = v
        text[key(k)] = {"fontFamily": family, "fontSize": size, "lineHeight": lh, "fontWeight": str(weight)}
    return shadows, text


def icons():
    js = (ROOT / "icons/icons.js").read_text()
    m = re.search(r"var P = (\{.*?\});\n", js, re.S)
    paths = json.loads(m.group(1))
    head = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">')
    return {name: head + body + "</svg>" for name, body in sorted(paths.items())}


def truemeds(sem, palette):
    """Apply tokens/truemeds.json last, same values as truemeds.css."""
    tm = json.loads((ROOT / "tokens/truemeds.json").read_text())
    for name, ref in tm["content"].items():
        family, shade = ref.split(":", 1)[1].rsplit("-", 1)
        sem["color"].setdefault("content", {})[key(name)] = palette[family][shade]
    return {key(k): v for k, v in tm["text"].items()}


def main():
    sem = semantic()
    palette = core()
    tm_text = truemeds(sem, palette)
    shadows, text = extras(sem["font"]["family"])
    family = sem["font"]["family"]
    for k, (size, lh, weight) in tm_text.items():
        text[k] = {"fontFamily": family, "fontSize": size, "lineHeight": lh, "fontWeight": str(weight)}
    tokens = {
        "_about": "GENERATED by design-system/scripts/build_native.py from the SALT export. Do not edit. "
                  f"Built {date.today().isoformat()}. Units are density-independent points (no px).",
        "color": sem["color"],
        "space": sem["space"],
        "radius": sem["radius"],
        "font": sem["font"],
        "text": text,
        "shadow": shadows,
        "overlayOpacity": sem["overlayOpacity"],
        "palette": palette,  # raw palette: do NOT use directly in screens; use `color`
    }
    OUT.mkdir(exist_ok=True)
    body = json.dumps(tokens, indent=2, ensure_ascii=False)
    (OUT / "tokens.json").write_text(body + "\n")
    (OUT / "tokens.ts").write_text(
        "// GENERATED by design-system/scripts/build_native.py — do not edit. Source: SALT token export.\n"
        "// Use `tokens.color.*`, `tokens.space.*` etc. in screens; `tokens.palette` is the raw palette.\n"
        f"export const tokens = {body} as const;\n\nexport type Tokens = typeof tokens;\nexport default tokens;\n"
    )
    ic = icons()
    (OUT / "icons.ts").write_text(
        "// GENERATED by design-system/scripts/build_native.py from icons/icons.js — do not edit.\n"
        "// Tabler outline icons (SALT's set) plus Truemeds [PROPOSED] glyphs, as SVG strings.\n"
        "// Render with react-native-svg:  <SvgXml xml={icons['phone']} width={24} height={24} color={tokens.color.content.primary} />\n"
        f"export const icons = {json.dumps(ic, indent=2)} as const;\n\n"
        "export type IconName = keyof typeof icons;\nexport default icons;\n"
    )
    n_col = sum(1 for _ in re.finditer(r'"#|"rgba', json.dumps(sem["color"])))
    print(f"native/ written: {n_col} semantic colours, {len(sem['space'])} space, {len(sem['radius'])} radius, "
          f"{len(text)} text styles, {len(shadows)} shadows, {len(ic)} icons")


if __name__ == "__main__":
    main()
