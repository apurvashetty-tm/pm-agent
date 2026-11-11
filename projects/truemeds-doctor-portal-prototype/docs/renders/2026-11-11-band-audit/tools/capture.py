"""Band audit: capture every in-scope state of every "logo + title + subtitle" screen at 390x844 and 360x640 and
measure its blue band. Same method as docs/renders/2026-11-11-home-v3/tools/capture.py (copied here as
capture-home-v3.py): installed Chrome, D-94 rasterisation flags, fixed clock 2026-11-11 15:00, DPR 2.

  python3 tools/capture.py <run folder> before   -> measure.json, shots/all/*, shots/<screen>_<size>.png
  python3 tools/capture.py <run folder> after    -> after-measure.json, shots/after/*  (after.css + agreed titles injected)

The approved pages are loaded read-only from ui-screens/ (?capture=<state>); nothing in them is changed.
"""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright

RUN = pathlib.Path(sys.argv[1]).resolve()
MODE = sys.argv[2] if len(sys.argv) > 2 else 'before'
PROJ = RUN.parents[2]
UI = PROJ / 'ui-screens'
V3 = PROJ / 'docs/renders/2026-11-11-home-v3/home-v3.html'
OUT = RUN / 'shots' / ('all' if MODE == 'before' else 'after')
OUT.mkdir(parents=True, exist_ok=True)

SCREENS = {
  'sign-in': ('sign-in/sign-in.html', 'capture', ['default', 'keyboard-open', 'empty-tap', 'too-short', 'wrong-first-digit',
              'pasted-cleaned', 'sending', 'not-registered', 'offline', 'couldnt-send', 'too-many-tries', 'inactive'],
              {'root': '#doctor-login-preview .login-phone', 'panel': '.login-fields', 'header': None}),
  'otp': ('otp/otp.html', 'capture', ['default', 'empty-tap', 'too-short', 'verifying', 'wrong-code', 'two-tries-left',
          'resend-available', 'new-code-sent', 'code-expired', 'couldnt-verify', 'too-many-resends', 'locked', 'resending',
          'resend-failed', 'offline', 'cooldown-reconciling', 'expired-and-resend-limited'],
          {'root': '.screen', 'panel': '.panel', 'header': None}),
  'faster-signin-offer': ('faster-signin-offer/faster-signin-offer.html', 'capture', ['fingerprint', 'face-id', 'enabling',
          'screen-lock', 'enable-failed', 'offline', 'unavailable'], {'root': '.screen', 'panel': '.panel', 'header': None}),
  'returning-unlock': ('returning-unlock/returning-unlock.html', 'capture', ['fingerprint', 'face', 'screen-lock', 'pending',
          'cancelled', 'platform-retry', 'unavailable'], {'root': '.screen', 'panel': '.panel', 'header': None}),
  'home': ('home/home.html', 'state', ['setup-wheel', 'setting', 'setup-failed', 'active', 'requesting', 'no-cases',
          'request-failed', 'offline', 'near-expiry', 'add-wheel', 'adding', 'add-failed', 'added', 'end-confirmation',
          'stop-pending', 'expired-pending', 'idle-expired', 'manually-ended', 'unknown-result'],
          {'root': '.phone', 'panel': '.panel', 'header': '.header-actions'}),
}
SIZES = [(390, 844), (360, 640)]

# Measures one band inside root `r` (an element). All numbers are CSS px, relative to the root's top-left.
MEASURE = r'''([rootSel, panelSel, headerSel]) => {
  const r = document.querySelector(rootSel) || document.body; const R = r.getBoundingClientRect();
  const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  const logo = r.querySelector('img[src*="truemeds-for-doctors"]');
  const h1 = [...r.querySelectorAll('h1')].find(vis);
  let sub = h1 && h1.nextElementSibling; if (!vis(sub)) sub = null;
  const panel = r.querySelector(panelSel);
  const L = logo.getBoundingClientRect(), T = h1.getBoundingClientRect(), P = panel.getBoundingClientRect();
  const cs = e => getComputedStyle(e);
  const lines = e => Math.round(e.getBoundingClientRect().height / parseFloat(cs(e).lineHeight));
  const textW = e => { const g = document.createRange(); g.selectNodeContents(e); return Math.round(g.getBoundingClientRect().width * 10) / 10; };
  const o = { w: Math.round(R.width), h: Math.round(window.innerHeight) };
  o.logo = { top: Math.round(L.top - R.top), left: Math.round(L.left - R.left), w: Math.round(L.width), h: Math.round(L.height) };
  if (headerSel) { const hs = [...r.querySelectorAll(headerSel + ' button')].filter(vis).map(b => b.getBoundingClientRect());
    o.headerIcons = { n: hs.length, size: hs.length ? Math.round(hs[0].width) : null, right: hs.length ? Math.round(R.right - hs[hs.length-1].right) : null,
      glyphRight: (() => { const g = [...r.querySelectorAll(headerSel + ' .tm-icon, ' + headerSel + ' svg')].filter(vis).pop(); return g ? Math.round(R.right - g.getBoundingClientRect().right) : null; })() };
  } else o.headerIcons = null;
  o.logoToTitle = Math.round(T.top - L.bottom);
  const tc = cs(h1);
  o.title = { text: h1.textContent.trim(), size: tc.fontSize, lh: tc.lineHeight, weight: tc.fontWeight, color: tc.color, lines: lines(h1),
              textW: textW(h1), boxW: Math.round(T.width), left: Math.round(T.left - R.left), wrap: tc.textWrap || tc.textWrapStyle || '' };
  if (sub) { const S = sub.getBoundingClientRect(), sc = cs(sub);
    o.titleToSub = Math.round(S.top - T.bottom);
    o.sub = { text: sub.textContent.trim().replace(/\s+/g, ' '), size: sc.fontSize, lh: sc.lineHeight, weight: sc.fontWeight, color: sc.color, lines: lines(sub), h: Math.round(S.height), textW: textW(sub), boxW: Math.round(S.width) };
    o.subToPanel = Math.round(P.top - S.bottom);
  } else { o.titleToSub = null; o.sub = null; o.subToPanel = Math.round(P.top - T.bottom); }
  const pc = cs(panel);
  o.panel = { top: Math.round(P.top - R.top), radius: pc.borderTopLeftRadius, padTop: pc.paddingTop, padX: pc.paddingLeft };
  const kids = [...panel.querySelectorAll('*')].filter(e => vis(e) && e.getBoundingClientRect().height > 0);
  o.panelToFirst = kids.length ? Math.round(Math.min(...kids.map(e => e.getBoundingClientRect().top)) - P.top) : null;
  o.bandPct = Math.round((P.top - R.top) / window.innerHeight * 1000) / 10;
  o.bandBg = cs(r).backgroundColor;
  return o; }'''

AFTER_CSS = RUN / 'after.css'
AFTER_TEXT = json.loads((RUN / 'after-titles.json').read_text()) if (RUN / 'after-titles.json').exists() else {}

def apply_after(pg, screen, state):
    if MODE != 'after': return
    pg.add_style_tag(path=str(AFTER_CSS))
    # after-titles.json: { screen: { "<current title text>": {"title": ..., "sub": ...} } } — keyed by today's title, so every state maps.
    pg.evaluate('''(map) => { const vis = e => e && e.getClientRects().length; const h = [...document.querySelectorAll('h1')].find(vis);
        if (!h) return; const t = map[h.textContent.trim()]; if (!t) return;
        if (t.title) h.textContent = t.title; if (t.sub && h.nextElementSibling) h.nextElementSibling.textContent = t.sub; }''', AFTER_TEXT.get(screen, {}))
    pg.wait_for_timeout(50)

FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
         "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
results = {}; errs = []
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    for (w, h) in SIZES:
        pg = br.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
        pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda x: errs.append(str(x)))
        for screen, (path, param, states, sel) in SCREENS.items():
            for st in states:
                url = (UI / path).as_uri() + (f'?capture={st}' if param == 'capture' else f'?capture&state={st}')
                pg.goto(url)
                pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
                pg.evaluate('() => document.fonts && document.fonts.ready'); pg.wait_for_timeout(150)
                apply_after(pg, screen, st)
                m = pg.evaluate(MEASURE, [sel['root'], sel['panel'], sel['header']])
                results.setdefault(screen, {}).setdefault(st, {})[f'{w}x{h}'] = m
                pg.screenshot(path=str(OUT / f'{screen}_{st}_w{w}x{h}.png'))
        pg.close()
    # Home v3 review picture: one page, frames measured in place (setup 390, available 390, setup 360, available 360).
    pg = br.new_page(viewport={'width': 1700, 'height': 920}, device_scale_factor=2)
    pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
    pg.goto(V3.as_uri()); pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
    pg.evaluate('() => document.fonts && document.fonts.ready'); pg.wait_for_timeout(400)
    for i, (st, size) in enumerate([('setup', '390x844'), ('available', '390x844'), ('setup', '360x640'), ('available', '360x640')]):
        pg.evaluate(f'''() => {{ document.querySelectorAll('.frame').forEach((f, j) => f.id = 'f' + j); }}''')
        if MODE == 'after':
            if i == 0: pg.add_style_tag(path=str(AFTER_CSS))
            pg.evaluate('''([id, map]) => { const f = document.getElementById(id); const h = f.querySelector('.band h1');
                const t = map[h.textContent.trim()]; if (!t) return;
                if (t.title) h.textContent = t.title; if (t.sub) f.querySelector('.band .sub').textContent = t.sub; }''', [f'f{i}', AFTER_TEXT.get('home-v3', {})])
        m = pg.evaluate(MEASURE.replace('window.innerHeight', 'R.height'), [f'#f{i}', '.panel', '.acts'])
        results.setdefault('home-v3', {}).setdefault(st, {})[size] = m
        pg.query_selector(f'#f{i}').screenshot(path=str(OUT / f'home-v3_{st}_w{size}.png'))
    br.close()

name = 'measure.json' if MODE == 'before' else 'after-measure.json'
(RUN / name).write_text(json.dumps(results, indent=1, ensure_ascii=False))
print(json.dumps(errs) if errs else 'no console errors')
