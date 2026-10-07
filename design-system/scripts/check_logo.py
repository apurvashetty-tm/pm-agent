#!/usr/bin/env python3
"""Verify the locked Truemeds logo files in design-system/logo/.
Fails if a locked file's hash changed, a locked file is missing, a colour other than the brand logo colours
is used, or the "for doctors" lockup no longer embeds the canonical Truemeds logo byte-for-byte.
Usage: python3 design-system/scripts/check_logo.py            (check)
       python3 design-system/scripts/check_logo.py --update   (re-lock after an APPROVED logo change)
"""
import base64, hashlib, json, re, sys
from pathlib import Path

LOGO_DIR = Path(__file__).resolve().parent.parent / "logo"
LOCK = LOGO_DIR / "logo.lock.json"
ALLOWED = {"#1B69DE", "#22B573"}   # logo blue, logo green (NOT the UI token --tm-content-brand)
# Extra colours permitted per file. The "for doctors" descriptor is one neutral grey; the symbol and wordmark
# inside it are the canonical logo (embedded, checked below), so they keep the two brand colours.
EXTRA = {"truemeds-for-doctors.svg": {"#5B616E"}}
LOCKED_PNG = {"truemeds-for-doctors.png"}          # transparent PNG export of the lockup (preview PNG is not locked)
LOCKUP, CANONICAL = "truemeds-for-doctors.svg", "truemeds-logo.svg"

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def colours(p): return {c.upper() for c in re.findall(r'#[0-9A-Fa-f]{6}\b', p.read_text())}

svgs = sorted(LOGO_DIR.glob("*.svg"))
locked = svgs + [LOGO_DIR / n for n in sorted(LOCKED_PNG) if (LOGO_DIR / n).exists()]
if "--update" in sys.argv:
    LOCK.write_text(json.dumps({"allowed_colours": sorted(ALLOWED),
                                "extra_colours": {k: sorted(v) for k, v in EXTRA.items()},
                                "sha256": {f.name: sha(f) for f in locked}}, indent=2) + "\n")
    print("re-locked", [f.name for f in locked]); sys.exit(0)

lock = json.loads(LOCK.read_text())
bad = []
for f in locked:
    if lock["sha256"].get(f.name) != sha(f): bad.append(f"{f.name}: content changed (hash mismatch)")
for f in svgs:
    extra = colours(f) - ALLOWED - EXTRA.get(f.name, set())
    if extra: bad.append(f"{f.name}: non-brand colours {sorted(extra)}")
for name in lock["sha256"]:
    if not (LOGO_DIR / name).exists(): bad.append(f"{name}: missing")
lock_svg = LOGO_DIR / LOCKUP
if lock_svg.exists():
    m = re.search(r'href="data:image/svg\+xml;base64,([^"]+)"', lock_svg.read_text())
    if not m or base64.b64decode(m.group(1)) != (LOGO_DIR / CANONICAL).read_bytes():
        bad.append(f"{LOCKUP}: embedded logo is not byte-identical to {CANONICAL}")
if bad:
    print("LOGO LOCK FAILED:\n  " + "\n  ".join(bad)); sys.exit(1)
print("logo lock OK:", ", ".join(f.name for f in locked), "| colours", sorted(ALLOWED), "+ descriptor grey on", LOCKUP)
