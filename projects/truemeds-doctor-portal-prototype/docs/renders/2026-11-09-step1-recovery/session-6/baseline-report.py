"""D-94 step 3: write baseline-check.md and worst-10.png from baseline-check.json (old ui-screens/ vs session-6/new/).
Run from the project folder after picdiff.py:  python3 docs/renders/2026-11-09-step1-recovery/session-6/baseline-report.py"""
import json, pathlib
from PIL import Image, ImageDraw
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
res = json.loads((HERE / 'baseline-check.json').read_text())
rep = json.loads((HERE / 'repeat-check.json').read_text())

rows = [(k, v) for k, v in res.items() if 'over8Px' in v]
new_only = [k for k, v in res.items() if v['verdict'].startswith('NEW')]
bad = [(k, v) for k, v in res.items() if v['verdict'] not in ('identical', 'same design') and not v['verdict'].startswith('NEW')]
tally = {}
for v in res.values(): tally[v['verdict']] = tally.get(v['verdict'], 0) + 1
rtally = {}
for v in rep.values(): rtally[v['verdict']] = rtally.get(v['verdict'], 0) + 1
worst = sorted(rows, key=lambda kv: (-kv[1]['over8Px'], -kv[1]['maxChannel']))[:10]

L = ['# D-94 baseline check — old approved pictures vs new renders (session 6, 2026-11-09)', '',
     'Old = `ui-screens/` (128 old-Mac pictures + 20 D-92 new-Mac). New = `session-6/new/`, rendered from the approved sources with the D-94 capture',
     '(`capture-method-cap.py`: fixed flags `--font-render-hinting=none --disable-gpu --disable-lcd-text --force-color-profile=srgb',
     '--disable-font-subpixel-positioning --disable-partial-raster --disable-skia-runtime-opts --hide-scrollbars`, DPR 2 from the page, fixed clock,',
     'animations frozen, fonts loaded + two frames). Measured by `picdiff.py` (per picture: changed px, px over 8/255, max channel, shifted rows,',
     'colour bands, changed pixels away from edges, locally moved regions). **Same design** = same size, 0 shifted rows, 0 colour bands,',
     '**0 flat-area changes** (no pixel changed by more than 2/255 unless BOTH pictures have an edge within 1 px), **0 moved regions** (no 2-D shift of up to 4 px explains a changed region),',
     '≤ 3,000 px over 8/255 and max ≤ 110 (session-4 limits). `picdiff.py --selftest <png>` asserts (exit 1 otherwise) that an added 6×6 grey box,', 'an added 20-px grey rule, a white → RGB(250,250,250) fill and a text block moved 2 px are each DIFFERENT, caught by the named check', '(box, rule, fill: inside the numeric limits); run on 7 pictures, all pass (Codex session 6, blockers 1–2, should-fix 2).', '',
     '## Repeatable capture (step 1)', '',
     f'All {len(rep)} pictures captured twice with the D-94 settings (`session-6/new/` vs a second run; `offer_unavailable` with `d93/capture-d93.py`, same settings, three runs): **{json.dumps(rtally)}** (`repeat-check.json`). '
     'The compare (`tests/compare-step1.mjs`) uses the same flags and captures each picture once (retry loop removed).', '',
     'Two things had to change to get there:',
     '- **Flags.** `--force-device-scale-factor=2` (an example flag in the brief) re-scales text on top of the page DPR and moved every glyph:',
     '  ~23,000–48,000 px over 8/255 with shifted rows on every picture. It is not used. `--disable-gpu` is the flag that matters: GPU raster',
     '  gave come-and-go noise between captures (seen in sessions 3–5), and software raster is also much closer to the old-Mac pictures',
     '  (sign-in 1,660 → 65 px).',
     '- **One source race (`ui-screens/case/case.html`, `a-confirm-busy`).** The secondary row (greyed Callback) was hidden or shown depending',
     '  on when a ResizeObserver in the old `app.js` fired (about 1 capture in 4 showed it). The approved picture has it hidden; the recipe',
     '  now hides it explicitly, as `a-confirm-failed` already did. No approved picture changes (same pixels as the approved look; 0 / 10 probes showed the row).', '',
     '## Old vs new (step 3)', '',
     f'Pictures compared: {len(rows)} · result: **{json.dumps(tally)}** (`baseline-check.json`).', '']
if new_only:
    L += [f'New picture with no old one (approved D-93, joins `ui-screens/` at step 5): {", ".join("`" + k + "`" for k in new_only)}.', '']
if bad:
    L += ['### Not same design — NOT to be replaced', '', '| Picture | px over 8 | max | shifted rows | colour bands |', '|---|---|---|---|---|']
    L += [f"| `{k}` | {v.get('over8Px', '—')} | {v.get('maxChannel', '—')} | {v.get('shiftedRows', '—')} | {v.get('colourBands', '—')} |" for k, v in bad]
    L += ['']
else:
    L += ['**Every picture is the same design** (no shifted row, no colour band, no flat-area change, no moved region, inside the limits). None is held back.', '']
mx = max(rows, key=lambda kv: kv[1]['over8Px']); mc = max(rows, key=lambda kv: kv[1]['maxChannel'])
L += [f"Largest: `{mx[0]}` {mx[1]['over8Px']} px over 8 · highest channel difference: `{mc[0]}` {mc[1]['maxChannel']}.", '',
      '### Worst 10 (by px over 8/255) — contact sheet `worst-10.png` (old | new | changed pixels)', '',
      '| Picture | changed px | px over 8 | max | shifted rows | colour bands | flat-area px | moved regions | verdict |', '|---|---|---|---|---|---|---|---|---|']
L += [f"| `{k}` | {v['changedPx']} | {v['over8Px']} | {v['maxChannel']} | {v['shiftedRows']} | {len(v['colourBands'])} | {v['flatChangedPx']} | {v['movedTiles']} | {v['verdict']} |" for k, v in worst]
L += ['', '### All pictures', '', '| Picture | changed px | px over 8 | max | shifted rows | colour bands | flat-area px | moved regions | verdict |', '|---|---|---|---|---|---|---|---|---|']
L += [f"| `{k}` | {v.get('changedPx', '—')} | {v.get('over8Px', '—')} | {v.get('maxChannel', '—')} | {v.get('shiftedRows', '—')} | {len(v.get('colourBands', []))} | {v.get('flatChangedPx', '—')} | {v.get('movedTiles', '—')} | {v['verdict']} |" for k, v in sorted(res.items())]
(HERE / 'baseline-check.md').write_text('\n'.join(L) + '\n')

# worst-10 sheet: each row old | new | heatmap at half size
tiles = []
for k, v in worst:
    a = Image.open(ROOT / 'ui-screens' / k).convert('RGB'); b = Image.open(HERE / 'new' / k).convert('RGB')
    d = np.abs(np.asarray(a, dtype=np.int16) - np.asarray(b, dtype=np.int16)).max(axis=2) > 8
    hm = a.copy().point(lambda x: 200 + x * 55 // 255); hm.paste((220, 30, 30), mask=Image.fromarray((d * 255).astype('uint8')))
    w, h = a.size; t = Image.new('RGB', (w * 3 + 40, h + 50), 'white'); t.paste(a, (0, 50)); t.paste(b, (w + 20, 50)); t.paste(hm, (2 * w + 40, 50))
    ImageDraw.Draw(t).text((10, 15), f"{k}  — {v['over8Px']} px over 8, max {v['maxChannel']}, shifted {v['shiftedRows']}, bands {len(v['colourBands'])}", fill='black')
    tiles.append(t.resize((t.width // 3, t.height // 3)))
W = max(t.width for t in tiles); cols = 2; rowsn = (len(tiles) + 1) // 2; H = max(t.height for t in tiles)
sheet = Image.new('RGB', (W * cols + 20, H * rowsn), 'white')
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * (W + 20), (i // cols) * H))
sheet.save(HERE / 'worst-10.png')
print('wrote baseline-check.md, worst-10.png;', json.dumps(tally))
