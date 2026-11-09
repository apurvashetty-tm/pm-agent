"""D-93 (revised, session 6a) render: offer_unavailable at 390 and 360 (DPR 2), same settings as capture-method-cap.py
(fixed clock, animations frozen, review controls hidden, fonts ready). Writes into this folder only, never ui-screens/. D-94 fixed capture flags (same as capture-method-cap.py).
With --src FILE (a file in ui-screens/faster-signin-offer/) and an out-folder name, renders that source instead (regression check).
Also renders the six approved offer states from the edited source, to prove they did not change."""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[5]
SRC = ROOT / 'ui-screens/faster-signin-offer/faster-signin-offer.html'
OUTNAME = None
if '--src' in sys.argv:
    i = sys.argv.index('--src'); SRC = SRC.parent / sys.argv[i + 1]; OUTNAME = sys.argv[i + 2]; del sys.argv[i:i + 3]
FLAGS = ['--font-render-hinting=none', '--disable-gpu', '--disable-lcd-text', '--force-color-profile=srgb',
         '--disable-font-subpixel-positioning', '--disable-partial-raster', '--disable-skia-runtime-opts',
         '--hide-scrollbars']
HIDE = '.review,.review-controls,#demo-bar{display:none !important} *,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}'
states = sys.argv[1:] or ['unavailable']
out = HERE / (OUTNAME or ('regress' if states != ['unavailable'] else '.'))
out.mkdir(parents=True, exist_ok=True)
errs = {}
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=[] if os.environ.get('D94_OLD_FLAGS') else FLAGS)
    for st in states:
        for vw in (390, 360):
            pg = br.new_page(viewport={'width': vw, 'height': 844}, device_scale_factor=2)
            pg.clock.set_fixed_time(datetime.datetime(2026, 10, 28, 15, 0))
            e = []
            pg.on('console', lambda m: e.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda x: e.append(str(x)))
            pg.goto(SRC.as_uri() + f'?capture={st}')
            pg.add_style_tag(content=HIDE)
            pg.evaluate('() => document.fonts && document.fonts.ready')
            pg.wait_for_timeout(350)
            pg.evaluate('() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))')
            pg.screenshot(path=str(out / f'offer_{st}_w{vw}.png')); pg.close()
            errs[f'offer_{st}_w{vw}'] = e
    br.close()
print(json.dumps(errs))
