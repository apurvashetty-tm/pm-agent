"""D-94: compare two picture trees (same relative paths), e.g. old approved vs new render, or capture 1 vs capture 2.
Usage: python3 picdiff.py OLD_DIR NEW_DIR OUT_JSON [--limits PX,MAX] [--new-only]
(--new-only: compare only the pictures in NEW_DIR, e.g. OLD_DIR = ui-screens/, which also holds contact sheets.)
Per picture: size match, changed px (any channel), px over 8/255, max channel difference, shifted rows, colour band, verdict.
 - shifted row: a changed row of OLD that equals (within 8/255 on every pixel) a row of NEW 1-6 px above or below,
   while it does not match its own row — content that moved, not re-smoothed edges.
 - colour band: a run of >= 3 rows in which > 40 % of the pixels changed by more than 8/255 (a moved box or a fill change).
 - flat-area change: a pixel changed by > 2/255 where the two pictures do not BOTH have an edge within 1 px (a box, rule, fill or
   colour change, not smoothing).
 - moved region ("movedTiles"): a connected changed region whose difference mostly disappears when NEW is shifted by up to 4 px
   in x / y (content moved locally).
Verdict "same design" = same size, no shifted row, no colour band, 0 flat-area changes, 0 moved tiles, px over 8 <= PX and max <= MAX
(session-4 limits 3000 / 110). --selftest PNG: asserts that an added box, an added rule, a white fill change and a 2-px move are each DIFFERENT, all within the
numeric limits (exit 1 otherwise)."""
import sys, json, pathlib
import numpy as np
from PIL import Image

def load(p):
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.int16)

def compare(a, b, lim_px, lim_max):
    r = {'size': [int(a.shape[1]), int(a.shape[0])], 'newSize': [int(b.shape[1]), int(b.shape[0])]}
    if a.shape != b.shape:
        r.update(sameSize=False, verdict='DIFFERENT (size)'); return r
    d = np.abs(a - b).max(axis=2)
    changed = d > 0; over = d > 8
    r.update(sameSize=True, changedPx=int(changed.sum()), over8Px=int(over.sum()), maxChannel=int(d.max()))
    if r['changedPx']:
        ys, xs = np.nonzero(changed); r['box'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    # shifted rows
    shifted = []
    rows = np.nonzero(over.any(axis=1))[0]
    H = a.shape[0]
    for y in rows:
        if over[y].sum() < 8: continue                       # a few edge pixels are smoothing, not a moved row
        for k in (1, 2, 3, 4, 5, 6, -1, -2, -3, -4, -5, -6):
            yy = y + k
            if 0 <= yy < H and np.abs(a[y] - b[yy]).max() <= 8 and np.abs(a[y] - a[yy]).max() > 8:
                shifted.append(int(y)); break
    r['shiftedRows'] = len(shifted)
    if shifted: r['shiftedSample'] = shifted[:10]
    # colour band
    frac = over.mean(axis=1) > 0.40
    band, run, best = [], 0, 0
    for y, f in enumerate(frac):
        run = run + 1 if f else 0
        if run >= 3 and (not band or band[-1][1] < y - 1): band.append([y - 2, y])
        elif run >= 3: band[-1][1] = y
    r['colourBands'] = band
    # edge-only (Codex session 6, blockers 1 and 2): smoothing changes pixels only where BOTH pictures already have an edge
    # (within 1 px). Any pixel changed by more than 2/255 with no edge nearby on either side is new content, a box, a rule or a fill
    # / colour change, whatever its size. Must be 0.
    def edges(X):
        X = X.sum(axis=2); e = np.zeros(X.shape, bool)
        c = X[1:-1, 1:-1]
        e[1:-1, 1:-1] = (np.abs(c - X[:-2, 1:-1]) >= 3) | (np.abs(c - X[2:, 1:-1]) >= 3) | (np.abs(c - X[1:-1, :-2]) >= 3) | (np.abs(c - X[1:-1, 2:]) >= 3)
        g = e.copy()
        g[1:] |= e[:-1]; g[:-1] |= e[1:]; g[:, 1:] |= e[:, :-1]; g[:, :-1] |= e[:, 1:]
        return g
    fl = (d > 2) & ~(edges(a) & edges(b))
    r['flatChangedPx'] = int(fl.sum())
    if r['flatChangedPx']:
        ys, xs = np.nonzero(fl); r['flatBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    # local move: changed pixels are grouped into regions (8-px cells, 8-connected). For each region with >= 8 changed px, try
    # shifting NEW by up to 4 px in x and y, scoring only that region's changed pixels (grown by 2 px). If a shift removes most of
    # the difference (best < 30 % of the unshifted error), the content there moved. Smoothing never lines up with a shifted copy.
    moved = []
    Hh, Ww = d.shape; C = 8
    g = over.copy()
    for _ in range(2):
        h = g.copy(); h[1:] |= g[:-1]; h[:-1] |= g[1:]; h[:, 1:] |= g[:, :-1]; h[:, :-1] |= g[:, 1:]; g = h
    cy, cx = (Hh + C - 1) // C, (Ww + C - 1) // C
    cells = np.zeros((cy, cx), bool)
    ys, xs = np.nonzero(over); cells[ys // C, xs // C] = True
    seen = np.zeros_like(cells)
    for sy, sx in zip(*np.nonzero(cells)):
        if seen[sy, sx]: continue
        stack = [(sy, sx)]; seen[sy, sx] = True; comp = []
        while stack:
            u, v = stack.pop(); comp.append((u, v))
            for du in (-1, 0, 1):
                for dv in (-1, 0, 1):
                    p2, q2 = u + du, v + dv
                    if 0 <= p2 < cy and 0 <= q2 < cx and cells[p2, q2] and not seen[p2, q2]: seen[p2, q2] = True; stack.append((p2, q2))
        us = [c[0] for c in comp]; vs = [c[1] for c in comp]
        y0, y1 = max(min(us) * C - 2, 4), min((max(us) + 1) * C + 2, Hh - 4)
        x0, x1 = max(min(vs) * C - 2, 4), min((max(vs) + 1) * C + 2, Ww - 4)
        if y1 <= y0 or x1 <= x0: continue
        M = g[y0:y1, x0:x1]; A = a[y0:y1, x0:x1]
        e0 = ((np.abs(A - b[y0:y1, x0:x1]).max(axis=2) > 8) & M).sum()
        if e0 < 8: continue
        best = e0
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                if dy == 0 and dx == 0: continue
                e = ((np.abs(A - b[y0 + dy:y1 + dy, x0 + dx:x1 + dx]).max(axis=2) > 8) & M).sum()
                if e < best: best = e
        if best < 0.3 * e0: moved.append([int(x0), int(y0), int(x1), int(y1)])
    r['movedTiles'] = len(moved)
    if moved: r['movedSample'] = moved[:10]
    ok = not shifted and not band and not fl.any() and not moved and r['over8Px'] <= lim_px and r['maxChannel'] <= lim_max
    r['verdict'] = 'identical' if r['changedPx'] == 0 else ('same design' if ok else 'DIFFERENT')
    return r

def selftest(path):
    # Box, rule and fill stay inside the numeric limits (<= 3000 px over 8, max <= 110); each case must be caught by the named check,
    # not only by the limits (a moved text block has a high max by nature, so it must also show a moved region or shifted rows).
    a = load(path); fails = []
    def case(name, b, want, by=None):
        v = compare(a, b, 3000, 110); ok = v['verdict'] == want and (by is None or v.get(by, 0) > 0)
        if by: name += f' [caught by {by}]'
        print(f"{'PASS' if ok else 'FAIL'} {name}: {v['verdict']} (over8 {v.get('over8Px')}, max {v.get('maxChannel')}, flat {v.get('flatChangedPx')}, moved {v.get('movedTiles')})")
        if not ok: fails.append(name)
    white = np.argwhere(a.sum(axis=2) >= 760)                        # a white area for the fixtures
    y, x = white[len(white) // 2]
    case('same picture', a.copy(), 'identical')
    b = a.copy(); b[y:y + 6, x:x + 6] = np.clip(b[y:y + 6, x:x + 6] - 60, 0, 255); case('added small grey box (6x6, -60)', b, 'DIFFERENT', 'flatChangedPx')
    b = a.copy(); b[y, max(0, x - 10):x + 10] = np.clip(b[y, max(0, x - 10):x + 10] - 40, 0, 255); case('added 20-px grey rule on white', b, 'DIFFERENT', 'flatChangedPx')
    b = a.copy(); m = a.sum(axis=2) >= 762; b[m] = np.minimum(b[m], 250); case('white -> RGB(250,250,250) fill', b, 'DIFFERENT', 'flatChangedPx')
    # a text block moved 2 px: the 300x40 window with the most edges, its content shifted 2 px right inside the window
    E = (np.abs(np.diff(a.sum(axis=2), axis=1)) > 60).astype(np.int32); cs = E.cumsum(0).cumsum(1)
    bestv, ty, tx = -1, 4, 4
    for yy in range(4, a.shape[0] - 48, 8):
        for xx in range(4, a.shape[1] - 308, 8):
            v = cs[yy + 40, xx + 300] - cs[yy, xx + 300] - cs[yy + 40, xx] + cs[yy, xx]
            if v > bestv: bestv, ty, tx = v, yy, xx
    b = a.copy(); b[ty:ty + 40, tx + 2:tx + 300] = a[ty:ty + 40, tx:tx + 298]
    v = compare(a, b, 3000, 110); ok = v['verdict'] == 'DIFFERENT' and (v['movedTiles'] > 0 or v['shiftedRows'] > 0)
    print(f"{'PASS' if ok else 'FAIL'} text block moved 2 px [caught by movedTiles / shiftedRows]: {v['verdict']} (over8 {v['over8Px']}, max {v['maxChannel']}, moved {v['movedTiles']}, shifted rows {v['shiftedRows']})")
    if not ok: fails.append('text block moved 2 px')
    if fails: print('SELFTEST FAILED:', ', '.join(fails)); sys.exit(1)
    print('selftest: all cases behave as expected')

def main():
    if sys.argv[1] == '--selftest': selftest(sys.argv[2]); return
    old, new, outp = map(pathlib.Path, sys.argv[1:4])
    lim_px, lim_max = 3000, 110
    if '--limits' in sys.argv:
        lim_px, lim_max = map(int, sys.argv[sys.argv.index('--limits') + 1].split(','))
    res = {}
    olds = sorted(old.rglob('*.png'))
    if '--new-only' in sys.argv:
        olds = [old / g.relative_to(new) for g in sorted(new.rglob('*.png'))]
    for f in olds:
        rel = f.relative_to(old).as_posix()
        g = new / rel
        if not f.exists(): res[rel] = {'verdict': 'NEW (not in old)'}; continue
        if not g.exists(): res[rel] = {'verdict': 'MISSING in new'}; continue
        res[rel] = compare(load(f), load(g), lim_px, lim_max)
    for g in sorted(new.rglob('*.png')):
        rel = g.relative_to(new).as_posix()
        if rel not in res: res[rel] = {'verdict': 'NEW (not in old)'}
    outp.write_text(json.dumps(res, indent=1))
    tally = {}
    for v in res.values(): tally[v['verdict']] = tally.get(v['verdict'], 0) + 1
    print(json.dumps(tally))

if __name__ == '__main__':
    main()
