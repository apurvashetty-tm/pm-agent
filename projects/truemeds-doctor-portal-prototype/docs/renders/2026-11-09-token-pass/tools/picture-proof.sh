#!/bin/bash
# D-99 token pass §5.1: re-capture every approved picture the D-94 way (same method as Run A0) and compare byte for byte.
# Run from the project folder:  bash docs/renders/2026-11-09-token-pass/tools/picture-proof.sh <scratch folder>
# Writes picture-proof.json + picture-proof-capture.log next to this script's parent folder.
set -u
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
OUT="${1:?scratch folder}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
rm -rf "$OUT"; mkdir -p "$OUT"
python3 docs/renders/2026-11-03-calling-round/capture-method-cap.py "$OUT" > "$HERE/picture-proof-capture.log" 2>&1
echo "capture exit $?"
python3 - "$OUT" "$HERE/picture-proof.json" <<'EOF'
import sys, json, pathlib, hashlib
from PIL import Image, ImageChops
out, rec = pathlib.Path(sys.argv[1]), {}
same = diff = missing = 0
for shot in sorted(out.rglob("*.png")):
    rel = shot.relative_to(out)
    ref = pathlib.Path("ui-screens") / rel
    if not ref.exists():
        missing += 1; rec[str(rel)] = "no approved picture"; continue
    a, b = Image.open(ref).convert("RGBA"), Image.open(shot).convert("RGBA")
    if a.size != b.size:
        diff += 1; rec[str(rel)] = f"size {a.size} vs {b.size}"; continue
    bbox = ImageChops.difference(a, b).getbbox()
    if bbox is None:
        same += 1; rec[str(rel)] = "identical"
    else:
        diff += 1; rec[str(rel)] = f"different in {bbox}"
summary = {"captured": same + diff + missing, "identical": same, "different": diff, "no_reference": missing}
json.dump({"summary": summary, "pictures": rec}, open(sys.argv[2], "w"), indent=1)
print(summary)
for k, v in rec.items():
    if v != "identical": print(k, v)
EOF
