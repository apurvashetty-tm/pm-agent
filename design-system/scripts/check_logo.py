#!/usr/bin/env python3
"""Verify the locked Truemeds logo files in design-system/logo/.
Fails if a file's hash changed or if it uses any colour other than the two brand logo colours.
Usage: python3 design-system/scripts/check_logo.py            (check)
       python3 design-system/scripts/check_logo.py --update   (re-lock after an APPROVED logo change)
"""
import hashlib, json, re, sys
from pathlib import Path

LOGO_DIR = Path(__file__).resolve().parent.parent / "logo"
LOCK = LOGO_DIR / "logo.lock.json"
ALLOWED = {"#1B69DE", "#22B573"}   # logo blue, logo green (NOT the UI token --tm-content-brand)

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def colours(p):
    return {c.upper() for c in re.findall(r'#[0-9A-Fa-f]{6}\b', p.read_text())}

files = sorted(LOGO_DIR.glob("*.svg"))
if "--update" in sys.argv:
    LOCK.write_text(json.dumps({"allowed_colours": sorted(ALLOWED), "sha256": {f.name: sha(f) for f in files}}, indent=2) + "\n")
    print("re-locked", [f.name for f in files]); sys.exit(0)

lock = json.loads(LOCK.read_text())
bad = []
for f in files:
    if lock["sha256"].get(f.name) != sha(f): bad.append(f"{f.name}: content changed (hash mismatch)")
    extra = colours(f) - ALLOWED
    if extra: bad.append(f"{f.name}: non-brand colours {sorted(extra)}")
for name in lock["sha256"]:
    if not (LOGO_DIR / name).exists(): bad.append(f"{name}: missing")
if bad:
    print("LOGO LOCK FAILED:\n  " + "\n  ".join(bad)); sys.exit(1)
print("logo lock OK:", ", ".join(f.name for f in files), "| colours", sorted(ALLOWED))
