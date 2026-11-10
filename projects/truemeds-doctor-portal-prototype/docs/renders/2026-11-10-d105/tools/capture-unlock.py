"""D-105 render: the 7 returning-unlock states at 390 and 360 (DPR 2), same settings as capture-d93.py / capture-method-cap.py
(fixed clock, animations frozen, review controls hidden, fonts ready).
  python3 capture-unlock.py <source html> <output folder>
Run once on the old source (proof the method reproduces the committed pictures) and once on the edited source."""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright
SRC = pathlib.Path(sys.argv[1]).resolve()
OUT = pathlib.Path(sys.argv[2]).resolve(); OUT.mkdir(parents=True, exist_ok=True)
HIDE = '.review,.review-controls,#demo-bar{display:none !important} *,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}'
STATES = ['fingerprint', 'face', 'screen-lock', 'pending', 'cancelled', 'platform-retry', 'unavailable']
errs = {}
with sync_playwright() as p:
    # D-94 fixed rasterisation flags (capture-method-cap.py, tests/compare-step1.mjs): repeatable pixels on this Mac
    FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
             "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=FLAGS)
    for st in STATES:
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
            pg.screenshot(path=str(OUT / f'unlock_{st}_w{vw}.png')); pg.close()
            errs[f'unlock_{st}_w{vw}'] = e
    br.close()
print(json.dumps({k: v for k, v in errs.items() if v}) or 'no console errors')
