"""Screens audit: capture every in-scope state of the entry + Home screens at 390x844 and 360x640 and measure every
element BELOW the band (panel, bar, sheet, below-panel lines). Method from the band audit
(docs/renders/2026-11-11-band-audit/tools/capture.py): installed Chrome, D-94 rasterisation flags, fixed clock
2026-11-11 15:00, DPR 2, approved pages loaded read-only (?capture=).

  python3 tools/capture.py <run folder> before   -> measure.json, shots/all/*.png
  python3 tools/capture.py <run folder> after    -> after-measure.json, shots/after/*.png
        (band-audit after.css + after-titles.json, then this run's after.css + after-copy.json injected)

Home: the approved Home page gives every state (notices, bar, sheets, Profile); home-v3.html gives the agreed v3 body
(setup + available). Nothing in ui-screens/ or the Home v3 folder is changed.
"""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright

RUN = pathlib.Path(sys.argv[1]).resolve()
MODE = sys.argv[2] if len(sys.argv) > 2 else 'before'
ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 else None
PROJ = RUN.parents[2]
UI = PROJ / 'ui-screens'
BAND = PROJ / 'docs/renders/2026-11-11-band-audit'
V3 = PROJ / 'docs/renders/2026-11-11-home-v3/home-v3.html'
OUT = RUN / 'shots' / ('all' if MODE == 'before' else 'after')
OUT.mkdir(parents=True, exist_ok=True)

SCREENS = {
  'sign-in': ('sign-in/sign-in.html', 'capture', ['default', 'keyboard-open', 'empty-tap', 'too-short', 'wrong-first-digit',
              'pasted-cleaned', 'sending', 'not-registered', 'offline', 'couldnt-send', 'too-many-tries', 'inactive'],
              {'root': '#doctor-login-preview .login-phone', 'panel': '.login-fields'}),
  'otp': ('otp/otp.html', 'capture', ['default', 'empty-tap', 'too-short', 'verifying', 'wrong-code', 'two-tries-left',
          'resend-available', 'new-code-sent', 'code-expired', 'couldnt-verify', 'too-many-resends', 'locked', 'resending',
          'resend-failed', 'offline', 'cooldown-reconciling', 'expired-and-resend-limited'],
          {'root': '.screen', 'panel': '.panel'}),
  'faster-signin-offer': ('faster-signin-offer/faster-signin-offer.html', 'capture', ['fingerprint', 'face-id', 'enabling',
          'screen-lock', 'enable-failed', 'offline', 'unavailable'], {'root': '.screen', 'panel': '.panel'}),
  'returning-unlock': ('returning-unlock/returning-unlock.html', 'capture', ['fingerprint', 'face', 'screen-lock', 'pending',
          'cancelled', 'platform-retry', 'unavailable'], {'root': '.screen', 'panel': '.panel'}),
  'home': ('home/home.html', 'state', ['setup-wheel', 'setting', 'setup-failed', 'active', 'requesting', 'no-cases',
          'request-failed', 'offline', 'near-expiry', 'add-wheel', 'adding', 'add-failed', 'added', 'end-confirmation',
          'stop-pending', 'expired-pending', 'idle-expired', 'manually-ended', 'unknown-result', 'profile', 'logout-confirm'],
          {'root': '.phone', 'panel': '.panel'}),
}
SIZES = [(390, 844), (360, 640)]

# Every element below the band: atoms (controls, notices, boxes) are recorded whole; text blocks are elements with their
# own text; containers (card, action bar, sheet) are recorded as boxes and also walked into.
MEASURE = r'''([rootSel, panelSel]) => {
  const r = document.querySelector(rootSel) || document.body; const R = r.getBoundingClientRect();
  const H = Math.min(window.innerHeight, R.height || window.innerHeight);
  const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).opacity !== '0';
  const panel = r.querySelector(panelSel); const P = panel ? panel.getBoundingClientRect() : R;
  const ATOM = 'button, a, input:not(.tm-otp-slots__input), select, [role=button], [role=spinbutton], [role=switch], .tm-chip, .tm-notice, .login-notice, .tm-field__control, .tm-otp-slots, .tm-status-line, .hero-ic, .prompt-icon, .tm-toggle, .tm-value-display, .columns, .wheel, .tm-icon, .tm-spinner, .wband, .wheel-band';
  const CONT = '.tm-card, .tm-actionbar, .tm-sheet, [role=dialog], .tm-status-card, .profile-card, .tm-toast, .home-toast';
  const SKIP = '.login-keyboard, .kbd, .review-controls, .review, script, style, .tm-overlay-scrim';
  const cs = e => getComputedStyle(e);
  const rel = b => ({ x: Math.round((b.left - R.left) * 10) / 10, y: Math.round((b.top - R.top) * 10) / 10, w: Math.round(b.width * 10) / 10, h: Math.round(b.height * 10) / 10 });
  const ownText = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const region = e => e.closest('.overlay, .tm-sheet, [role=dialog]') ? 'sheet' : e.closest('.tm-actionbar') ? 'bar' : (panel && panel.contains(e)) ? 'panel' : 'other';
  const out = []; const boxes = [];
  const cls = e => (typeof e.className === 'string' ? e.className : (e.getAttribute('class') || '')).trim().split(/\s+/).filter(Boolean).slice(0, 4).join('.');
  const rec = (e, kind) => {
    const b = e.getBoundingClientRect(); if (b.height < 1 || b.width < 1) return;
    if (b.bottom <= P.top - 1 && region(e) !== 'sheet') return;          // band: measured by the band audit
    const c = cs(e); const after = getComputedStyle(e, '::after');
    const o = { kind, tag: e.tagName.toLowerCase(), cls: cls(e), region: region(e), text: (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90), ...rel(b),
      font: `${c.fontSize}/${c.lineHeight} ${c.fontWeight}`, color: c.color, align: c.textAlign,
      right: Math.round((R.right - b.right) * 10) / 10 };
    if (e.matches('button, a, input, select, [role=button], [role=spinbutton], [role=switch], .tm-chip')) {
      o.interactive = true; o.disabled = !!(e.disabled || e.getAttribute('aria-disabled') === 'true');
      const ah = after.content && after.content !== 'none' && after.position === 'absolute' ? parseFloat(after.height) : 0;
      o.target = { w: Math.round(b.width), h: Math.round(Math.max(b.height, ah || 0)) };
      if (e.matches('.tm-btn')) o.btn = (e.className.match(/tm-btn--(primary|secondary|quiet|destructive|lg|block|icon|sm)/g) || []).join(' ');
    }
    if (e.matches('.tm-notice, .login-notice')) { o.notice = (e.className.match(/tm-notice--(\w+)/) || [, 'plain'])[1];
      o.pad = `${c.paddingTop} ${c.paddingLeft}`; o.radius = c.borderTopLeftRadius; const t = e.querySelector('span:not(.tm-icon)') || e; const tc = cs(t); o.font = `${tc.fontSize}/${tc.lineHeight} ${tc.fontWeight}`; o.align = tc.textAlign; }
    out.push(o);
  };
  const walk = e => {
    for (const k of e.children) {
      if (k.matches(SKIP) || !vis(k)) continue;
      if (k.matches(CONT)) { const b = k.getBoundingClientRect(); const c = cs(k);
        boxes.push({ cls: cls(k), region: region(k), ...rel(b), pad: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`, radius: c.borderTopLeftRadius, bg: c.backgroundColor }); walk(k); continue; }
      if (k.matches(ATOM)) { rec(k, 'atom'); continue; }
      if (ownText(k)) { rec(k, 'text'); continue; }
      walk(k);
    }
  };
  walk(r);
  // overlays may live outside the root
  document.querySelectorAll('.overlay, .tm-overlay').forEach(ov => { if (!r.contains(ov) && vis(ov)) walk(ov); });
  out.sort((a, b) => a.y - b.y || a.x - b.x);
  // gap above each block: nearest block above in the same region that overlaps horizontally (icons inside a row skipped)
  for (const o of out) {
    let best = null, any = null;
    for (const p of out) { if (p === o || p.region !== o.region) continue; if (p.y + p.h > o.y + 0.5) continue;
      if (!any || p.y + p.h > any.y + any.h) any = p;
      if (p.x + p.w <= o.x || o.x + o.w <= p.x) continue; if (!best || p.y + p.h > best.y + best.h) best = p; }
    if (!best || (any && (any.y + any.h) - (best.y + best.h) > 20)) best = any;   // nearest block above in any column if the same column has nothing close
    o.gapAbove = best ? Math.round((o.y - (best.y + best.h)) * 10) / 10 : null; o.above = best ? (best.text || best.cls).slice(0, 40) : (o.region === 'panel' ? 'panel top' : null);
    if (!best && o.region === 'panel') o.gapAbove = Math.round((o.y - (P.top - R.top)) * 10) / 10;
  }
  const bar = r.querySelector('.tm-actionbar'); const B = bar && vis(bar) ? bar.getBoundingClientRect() : null;
  const scrollers = [...r.querySelectorAll('*')].filter(e => vis(e) && e.scrollHeight > e.clientHeight + 1 && /(auto|scroll)/.test(cs(e).overflowY));
  const panelBlocks = out.filter(o => o.region === 'panel');
  const lastBottom = panelBlocks.length ? Math.max(...panelBlocks.map(o => o.y + o.h)) : null;
  return { w: Math.round(R.width), h: Math.round(H), panelTop: Math.round(P.top - R.top), barTop: B ? Math.round(B.top - R.top) : null,
    barH: B ? Math.round(B.height) : null, lastPanelBottom: lastBottom !== null ? Math.round(lastBottom) : null,
    contentToBar: (B && lastBottom !== null) ? Math.round(B.top - R.top - lastBottom) : null,
    scroll: scrollers.map(e => ({ cls: cls(e), overflow: e.scrollHeight - e.clientHeight })),
    boxes, blocks: out };
}'''

def inject_after(pg, screen):
    if MODE != 'after': return
    pg.add_style_tag(path=str(BAND / 'after.css'))
    band_titles = json.loads((BAND / 'after-titles.json').read_text())
    pg.evaluate('''(map) => { const vis = e => e && e.getClientRects().length;
        for (const h of [...document.querySelectorAll('h1')].filter(vis)) { const t = map[h.textContent.trim()]; if (!t) continue;
        if (t.title) h.textContent = t.title; if (t.sub && h.nextElementSibling) h.nextElementSibling.textContent = t.sub; } }''', band_titles.get(screen, {}))
    if (RUN / 'after.css').exists(): pg.add_style_tag(path=str(RUN / 'after.css'))
    copy = json.loads((RUN / 'after-copy.json').read_text()) if (RUN / 'after-copy.json').exists() else {}
    # after-copy.json: { screen: [[css selector, "old text or *", "new text"], ...] } — replaces text in visible matches.
    pg.evaluate('''(rules) => { for (const [sel, old, neu] of rules) document.querySelectorAll(sel).forEach(e => {
        if (!e.getClientRects().length) return; const t = e.textContent.replace(/\\s+/g, ' ').trim();
        if (old === '*' || t === old) { if (neu.startsWith('<')) e.innerHTML = neu; else e.textContent = neu; } }); }''', copy.get(screen, []) + copy.get('*', []))
    # after.js: one function per screen, (screen) => {...}, for the agreed DOM moves (e.g. a sheet notice into the actions).
    if (RUN / 'after.js').exists(): pg.evaluate((RUN / 'after.js').read_text(), screen)
    pg.wait_for_timeout(60)

FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
         "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
name = 'measure.json' if MODE == 'before' else 'after-measure.json'
results = json.loads((RUN / name).read_text()) if ONLY and (RUN / name).exists() else {}
errs = []
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    for (w, h) in SIZES:
        pg = br.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
        pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda x: errs.append(str(x)))
        for screen, (path, param, states, sel) in SCREENS.items():
            if ONLY and screen not in ONLY: continue
            for st in states:
                url = (UI / path).as_uri() + (f'?capture={st}' if param == 'capture' else f'?capture&state={st}')
                pg.goto(url)
                pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
                pg.evaluate('() => document.fonts && document.fonts.ready'); pg.wait_for_timeout(150)
                inject_after(pg, screen)
                root = sel['root'] if not st.startswith(('profile', 'logout')) else '.phone'
                m = pg.evaluate(MEASURE, [root, sel['panel'] if not st.startswith(('profile', 'logout')) else '.profile-body'])
                results.setdefault(screen, {}).setdefault(st, {})[f'{w}x{h}'] = m
                pg.screenshot(path=str(OUT / f'{screen}_{st}_w{w}x{h}.png'))
        pg.close()
    if not ONLY or 'home-v3' in ONLY:
        # Home v3: the agreed body, one frame per state and size, measured in place.
        pg = br.new_page(viewport={'width': 1700, 'height': 920}, device_scale_factor=2)
        pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
        pg.goto(V3.as_uri()); pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
        pg.evaluate('() => document.fonts && document.fonts.ready'); pg.wait_for_timeout(400)
        pg.evaluate("() => document.querySelectorAll('.frame').forEach((f, j) => f.id = 'f' + j)")
        if MODE == 'after':
            inject_after(pg, 'home-v3')
        for i, (st, size) in enumerate([('setup', '390x844'), ('available', '390x844'), ('setup', '360x640'), ('available', '360x640')]):
            m = pg.evaluate(MEASURE, [f'#f{i}', '.panel'])
            results.setdefault('home-v3', {}).setdefault(st, {})[size] = m
            pg.query_selector(f'#f{i}').screenshot(path=str(OUT / f'home-v3_{st}_w{size}.png'))
        br.close()

(RUN / name).write_text(json.dumps(results, indent=1, ensure_ascii=False))
print(json.dumps(errs[:10]) if errs else 'no console errors')
