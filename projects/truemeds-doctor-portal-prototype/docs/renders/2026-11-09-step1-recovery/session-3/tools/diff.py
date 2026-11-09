"""Session 3 evidence (copied from session 2): approved | built | diff heatmap per state, plus a numbers table and a contact sheet.
Usage: python3 diff.py <builtDir> <outDir> [width]   — not the step 1 compare harness (that is session 4); a quick fidelity check."""
import sys, json, pathlib
from PIL import Image, ImageChops, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[5]
built = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2]); w = sys.argv[3] if len(sys.argv) > 3 else '390'
out.mkdir(parents=True, exist_ok=True)
rows = []
for b in sorted(built.glob(f'*_w{w}.png')):
    stem = b.name; folder = {'sign-in': 'sign-in', 'otp': 'otp', 'offer': 'faster-signin-offer', 'unlock': 'returning-unlock'}[stem.split('_')[0]]
    a = ROOT / 'ui-screens' / folder / stem
    if not a.exists(): continue
    A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
    if A.size != B.size: B = B.resize(A.size)
    d = ImageChops.difference(A, B).convert('L')
    px = sum(1 for v in d.getdata() if v > 24)
    bbox = d.point(lambda v: 255 if v > 24 else 0).getbbox()
    heat = Image.new('RGB', A.size, (255, 255, 255)); heat.paste((220, 30, 30), mask=d.point(lambda v: 255 if v > 24 else 0))
    pair = Image.new('RGB', (A.width * 3 + 40, A.height + 60), (255, 255, 255))
    for i, im in enumerate([A, B, heat]): pair.paste(im, (i * (A.width + 20), 60))
    dr = ImageDraw.Draw(pair); dr.text((10, 10), f'{stem}   approved | built | diff (>24)   {px} px   bbox {bbox}', fill=(0, 0, 0))
    pair.save(out / stem.replace('.png', '_pair.png'))
    rows.append({'state': stem, 'diff_px': px, 'pct': round(100 * px / (A.width * A.height), 3), 'bbox': bbox})
(out / f'diff-{w}.json').write_text(json.dumps(rows, indent=1))
for r in rows: print(f"{r['state']:<45} {r['diff_px']:>8} px  {r['pct']:>7}%  {r['bbox']}")
