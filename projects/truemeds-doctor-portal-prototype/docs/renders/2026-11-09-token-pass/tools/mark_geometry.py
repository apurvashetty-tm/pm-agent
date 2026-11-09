#!/usr/bin/env python3
"""D-99 token pass §2: add same-line raw-ok markers to the brief's allowed geometry lines (100% fills, @media width).
Run from the project folder. Each target line must contain 100% or 768px and no marker yet."""
G = "   /* raw-ok: 100% fill (geometry) */"
M = "   /* raw-ok: @media width (CSS cannot read tokens there) */"
TODO = {
    "../../design-system/src/components.css": {49: G, 68: G, 210: G, 309: G, 372: G, 374: G, 381: M, 393: G, 407: G, 495: G},
    "app/screens/faster-signin-offer.css": {3: G},
    "app/screens/otp.css": {3: G},
    "app/screens/returning-unlock.css": {3: G},
    "app/screens/sign-in.css": {3: G},
}
for path, lines in TODO.items():
    text = open(path, encoding="utf-8").read().split("\n")
    for n, marker in lines.items():
        line = text[n - 1]
        assert "raw-ok" not in line and ("100%" in line or "768px" in line), (path, n, line)
        text[n - 1] = line.rstrip() + marker
        print(path.split("/")[-1], n, text[n - 1][:120])
    open(path, "w", encoding="utf-8").write("\n".join(text))
