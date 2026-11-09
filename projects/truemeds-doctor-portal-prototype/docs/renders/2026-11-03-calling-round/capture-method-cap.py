"""Scratch capture (outside repo). Usage: cap.py OUTDIR [states-filter-regex]
Renders every EXPECTED state at 390 and 360 (DPR 2) into OUTDIR/<folder>/<file>.png, mirroring ui-screens/."""
import sys, json, pathlib, re, importlib.util
from playwright.sync_api import sync_playwright
import os
ROOT = pathlib.Path(os.environ.get('TMROOT') or pathlib.Path(__file__).resolve().parents[3])   # the project folder (no user path)
GUARD = ROOT / 'ui-screens/feedback/check-locked-specs.py'
spec = importlib.util.spec_from_file_location('guard', GUARD); guard = importlib.util.module_from_spec(spec); spec.loader.exec_module(guard)
out = pathlib.Path(sys.argv[1]); flt = re.compile(sys.argv[2]) if len(sys.argv) > 2 else None
HIDE = '.review,.review-controls,#demo-bar{display:none !important}' + (' *,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}' if os.environ.get('FREEZE','1')=='1' else '')
import datetime
FOLDER = {'sign-in': ('sign-in', 'sign-in_'), 'otp': ('otp', 'otp_'), 'offer': ('faster-signin-offer', 'offer_'), 'unlock': ('returning-unlock', 'unlock_'), 'home': ('home', 'home_')}
jobs = []
for ph in ['A', 'B', 'C', 'D']:
    for sub, state in guard.EXPECTED[ph]:
        if sub == 'case':
            folder, stem = (('prescribe', '') if state.startswith('d-') else ('case', ''))
            stem = state
        else:
            folder, pre = FOLDER[sub]; stem = pre + state
        if flt and not flt.search(f'{sub}/{state}'): continue
        jobs.append((sub, state, folder, stem))
log = {'count': 0, 'errors': {}}
SPIN = {}
# D-94: repeatable capture. Fixed rasterisation flags (no GPU, no LCD / sub-pixel text, no hinting, sRGB); DPR 2 comes from the page
# (device_scale_factor) — never --force-device-scale-factor, which re-scales text and moves every glyph (session 6 flag test);
# fonts loaded and two frames painted before the shot. The same page captured twice gives identical pixels.
FLAGS = ['--font-render-hinting=none', '--disable-gpu', '--disable-lcd-text', '--force-color-profile=srgb',
         '--disable-font-subpixel-positioning', '--disable-partial-raster', '--disable-skia-runtime-opts',
         '--hide-scrollbars']
if os.environ.get('D94_FLAGS') is not None: FLAGS = [f for f in os.environ['D94_FLAGS'].split(',') if f]   # flag experiments (session 6)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=FLAGS)   # installed Chrome on this Mac, else Playwright's
    for sub, state, folder, stem in jobs:
        for vw in (390, 360):
            (out / folder).mkdir(parents=True, exist_ok=True)
            pg = br.new_page(viewport={'width': vw, 'height': 844}, device_scale_factor=2)
            if os.environ.get('CLOCK','1')=='1': pg.clock.set_fixed_time(datetime.datetime(2026, 10, 28, 15, 0))
            errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append('page error: ' + str(e)))
            pg.goto(guard.std_url(sub, state, vw))
            pg.add_style_tag(content=HIDE)
            pg.evaluate('() => document.fonts && document.fonts.ready')
            if sub == 'case':
                pg.wait_for_function("() => document.body.dataset.ready === '1'", timeout=15000)
            pg.wait_for_timeout(350)
            pg.evaluate('() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))')
            rects = pg.evaluate("() => [...document.querySelectorAll('.tm-spinner')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })")
            SPIN[f'{folder}/{stem}_w{vw}.png'] = rects
            fn = out / folder / f'{stem}_w{vw}.png'
            pg.screenshot(path=str(fn)); pg.close()
            log['count'] += 1
            log['errors'][f'{folder}/{stem}_w{vw}'] = errs
    br.close()
(out / 'capture-log.json').write_text(json.dumps(log, indent=1, ensure_ascii=False))
(out / 'spinners.json').write_text(json.dumps(SPIN, indent=1))
print('rendered', log['count'], 'pictures; page errors:', sum(len(v) for v in log['errors'].values()))
