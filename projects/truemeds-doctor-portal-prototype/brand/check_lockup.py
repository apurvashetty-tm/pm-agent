#!/usr/bin/env python3
"""Verify the Doctor app's "truemeds for doctors" lockup in this folder.
Checks: files match brand.lock.json (sha256); the SVG only uses the two brand logo colours plus the descriptor grey;
and the SVG embeds the canonical Truemeds logo (design-system/logo/truemeds-logo.svg) byte-for-byte.
Usage: python3 brand/check_lockup.py            (check)
       python3 brand/check_lockup.py --update   (re-lock after an APPROVED lockup change)
"""
import base64, hashlib, json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CANON = HERE.parents[2] / "design-system" / "logo" / "truemeds-logo.svg"
LOCK = HERE / "brand.lock.json"
SVG = HERE / "truemeds-for-doctors.svg"
LOCKED = [SVG, HERE / "truemeds-for-doctors.png"]
ALLOWED = {"#1B69DE", "#22B573", "#5B616E"}   # logo blue, logo green, descriptor grey

sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
if "--update" in sys.argv:
    LOCK.write_text(json.dumps({"sha256": {f.name: sha(f) for f in LOCKED}}, indent=2) + "\n"); print("re-locked"); sys.exit(0)

lock = json.loads(LOCK.read_text()); bad = []
for f in LOCKED:
    if lock["sha256"].get(f.name) != sha(f): bad.append(f"{f.name}: content changed (hash mismatch)")
extra = {c.upper() for c in re.findall(r'#[0-9A-Fa-f]{6}\b', SVG.read_text())} - ALLOWED
if extra: bad.append(f"{SVG.name}: non-brand colours {sorted(extra)}")
m = re.search(r'href="data:image/svg\+xml;base64,([^"]+)"', SVG.read_text())
if not m or base64.b64decode(m.group(1)) != CANON.read_bytes():
    bad.append(f"{SVG.name}: embedded logo is not byte-identical to design-system/logo/truemeds-logo.svg")
if bad: print("LOCKUP CHECK FAILED:\n  " + "\n  ".join(bad)); sys.exit(1)
print("lockup OK:", ", ".join(f.name for f in LOCKED))
