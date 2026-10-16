"""Contact sheets for one round, grouped by journey (checklist 7b.1). Usage: contact.py --round N [--phase D]"""
import argparse, base64, pathlib, sys
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(__file__).resolve().parent
GROUPS = {
    'A': [('sign-in', ['sign-in_']), ('otp', ['otp_'])],
    'B': [('offer', ['offer_']), ('unlock', ['unlock_'])],
    'C': [('home', ['home_'])],
    'D': [('case-page', ['a-']), ('call', ['b-']), ('sheets', ['c-']), ('prescribe', ['d-']), ('endings', ['e-']),
          ('new-states', ['a-loading', 'a-load', 'a-offline', 'a-confirm', 'a-release-failed', 'c-callback-failed', 'd-rx-failed', 'a-no-medicines', 'a-long']),
          ('stress', ['s-'])],
}

def tiles(phase, rnd, prefixes, width):
    d = OUT / phase / f'round-{rnd}'
    files = sorted(p for p in d.glob('*_w390.png'))
    keep = []
    for f in files:
        name = f.name.replace('_w390.png', '')
        if any(name.startswith(x) for x in prefixes): keep.append(f)
    return keep

def sheet(phase, rnd, title, files, path):
    cards = []
    for f in files:
        b = base64.b64encode(f.read_bytes()).decode()
        label = f.name.replace('.png', '')
        cards.append(f'<figure><img src="data:image/png;base64,{b}"><figcaption>{label}</figcaption></figure>')
    html = ('<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;font:600 14px/20px -apple-system,system-ui,sans-serif;background:#f3f4f6;color:#111827}'
            'h1{font-size:20px;line-height:28px;margin:0 0 16px}.grid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}'
            'figure{margin:0;width:195px}img{width:195px;display:block;border:1px solid #d1d5db;background:#fff}figcaption{margin-top:6px;font-size:12px;line-height:16px;word-break:break-all}</style>'
            f'<h1>{title}</h1><div class="grid">' + ''.join(cards) + '</div>')
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1100, 'height': 800})
        pg.set_content(html); pg.wait_for_timeout(200)
        pg.screenshot(path=str(path), full_page=True); b.close()

STATUS = 'Reviewed — yet to be approved by Apurva'

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--round', type=int, required=True); ap.add_argument('--phase', default=''); ap.add_argument('--final', action='store_true')
    a = ap.parse_args()
    phases = [a.phase] if a.phase else ['A', 'B', 'C', 'D']
    for ph in phases:
        for group, prefixes in GROUPS[ph]:
            pre = []
            for x in prefixes: pre.append(x)
            files = tiles(ph, a.round, pre, 195)
            if not files: continue
            # sheets are grouped by journey; each sheet holds at most 24 tiles so it reads at phone size
            for i in range(0, len(files), 24):
                chunk = files[i:i+24]
                suffix = '' if len(files) <= 24 else f'-{i//24+1}'
                folder = OUT / ph / ('final' if a.final else f'round-{a.round}')
                folder.mkdir(parents=True, exist_ok=True)
                path = folder / f'contact-{group}{suffix}.png'
                title = f'Phase {ph} · {group.replace("-", " ")} · 390 wide · ' + (STATUS if a.final else f'round {a.round}')
                sheet(ph, a.round, title, chunk, path)
                print(path)

if __name__ == '__main__':
    main()
