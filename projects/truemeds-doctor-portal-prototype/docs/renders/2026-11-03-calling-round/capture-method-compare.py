"""Scratch pixel compare: cmp.py NEWDIR REFDIR [--json out]. Compares every png under NEWDIR with the same relative path under REFDIR."""
import sys, pathlib, json
from PIL import Image, ImageChops
new, ref = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
res = {'same': [], 'differ': [], 'missing_ref': [], 'size_diff': [], 'spinner_only': []}
import json
def load_spin(d):
    f = d / 'spinners.json'
    return json.loads(f.read_text()) if f.exists() else {}
SN, SR = load_spin(new), load_spin(ref)
def in_spin(x, y, rects):
    return any(rx - 3 <= x <= rx + rw + 3 and ry - 3 <= y <= ry + rh + 3 for rx, ry, rw, rh in rects)
for f in sorted(new.rglob('*.png')):
    rel = f.relative_to(new); r = ref / rel
    if not r.exists(): res['missing_ref'].append(str(rel)); continue
    a, b = Image.open(f).convert('RGB'), Image.open(r).convert('RGB')
    if a.size != b.size: res['size_diff'].append(str(rel)); continue
    df = ImageChops.difference(a, b).convert('L')
    if df.point(lambda v: 255 if v > 3 else 0).getbbox() is None: res['same'].append(str(rel)); continue
    key = str(rel).replace('\\', '/')
    rects = [[x*2, y*2, w*2, h*2] for x, y, w, h in SN.get(key, [])] + [[x*2, y*2, w*2, h*2] for x, y, w, h in SR.get(key, [])]
    px = df.load(); W, H = df.size
    bad = [(x, y) for y in range(H) for x in range(W) if px[x, y] > 3 and not in_spin(x, y, rects)]
    (res['spinner_only'] if not bad else res['differ']).append(str(rel) if not bad else str(rel) + f' ({len(bad)} px outside spinners)')
print(f"same {len(res['same'])} · differ {len(res['differ'])} · size-diff {len(res['size_diff'])} · missing-ref {len(res['missing_ref'])}")
print('spinner-only (differs only inside spinner boxes or ≤3 levels):', len(res['spinner_only']))
for k in ('differ', 'size_diff', 'missing_ref'):
    for x in res[k]: print(f'  {k}: {x}')
if len(sys.argv) > 4 and sys.argv[3] == '--json': pathlib.Path(sys.argv[4]).write_text(json.dumps(res, indent=1))
