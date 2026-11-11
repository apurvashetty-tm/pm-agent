"""Home render options: capture every option × state, same settings as d105/tools/capture-unlock.py
(fixed clock, animations frozen, review controls hidden, fonts ready, D-94 rasterisation flags, DPR 2).
  python3 tools/capture.py <run folder>
Writes shots/<option>_<state>_w<W>x<H>.png (+ _end for 360×640 scrolled to the end) and audit.json (measurements)."""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright
RUN = pathlib.Path(sys.argv[1]).resolve()
SRC = RUN / 'home-options.html'
OUT = RUN / 'shots'; OUT.mkdir(parents=True, exist_ok=True)
HIDE = '.review{display:none !important} *,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}'
STATES = ['setup-pick', 'setup-custom', 'setting', 'available', 'near-expiry', 'add-cap', 'stop-pending', 'ended', 'offline', 'ended-zero', 'setup-max', 'available-long']
SMALL = STATES   # fix pass (Codex "missed"): every state at 360 × 640 too, for the §8.14 audit
MEASURE = r'''() => {
  const r = (el) => el ? el.getBoundingClientRect() : null;
  const sc = document.querySelector('.scroll'), bar = document.querySelector('.footer');
  const band = document.querySelector('.band'), logo = document.querySelector('.logo'), title = document.querySelector('.band-title');
  const out = {};
  out.logoToTitle = Math.round(r(title).top - r(logo).bottom);
  out.titleLines = Math.round(r(title).height / parseFloat(getComputedStyle(title).lineHeight));
  out.bandBottom = Math.round(r(band).bottom);
  out.scrollOverflow = Math.round(sc.scrollHeight - sc.clientHeight);
  sc.scrollTop = sc.scrollHeight;
  const kids = [...sc.querySelectorAll('*')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const lastBottom = Math.max(...kids.map(e => r(e).bottom));
  out.lastContentBottom = Math.round(lastBottom); out.barTop = Math.round(r(bar).top);
  out.barCoversLast = lastBottom > r(bar).top + 0.5;
  sc.scrollTop = 0;
  const v = document.querySelector('.stat-value .tm-value-display'), slot = document.querySelector('.stat-value .slot');
  if (v && slot) { out.valueRight = Math.round(r(v).right); out.slotLeft = Math.round(r(slot).left); out.valueSlotGap = Math.round(r(slot).left - r(v).right); }
  const vals = [...document.querySelectorAll('.tm-value-display')].map(e => getComputedStyle(e)).map(c => `${c.fontSize}/${c.lineHeight} ${c.fontWeight} ${c.fontVariantNumeric}`);
  out.valueStyles = [...new Set(vals)];
  const btns = [...document.querySelectorAll('#phone button, #phone .tm-chip')].filter(b => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden');
  out.smallTargets = btns.filter(b => r(b).height < 47.5).map(b => b.textContent.trim() || b.getAttribute('aria-label'));
  const overflowX = [...document.querySelectorAll('#phone *')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0).map(e => e.className).slice(0, 5);
  out.overflowX = overflowX;
  const sh = document.querySelector('.tm-sheet');
  if (sh) { out.sheetTop = Math.round(r(sh).top); out.sheetHeightPct = Math.round(100 * r(sh).height / innerHeight); const a = document.querySelector('.tm-sheet__actions'); out.sheetActionsBottom = Math.round(r(a).bottom); }
  return out;
}'''
audit, errs = {}, {}
with sync_playwright() as p:
    FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
             "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    for opt in 'abc':
        for st in STATES:
            sizes = [(390, 844)] + ([(360, 640)] if st in SMALL else [])
            for (w, h) in sizes:
                pg = br.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
                pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
                e = []
                pg.on('console', lambda m: e.append(m.text) if m.type == 'error' else None)
                pg.on('pageerror', lambda x: e.append(str(x)))
                pg.goto(SRC.as_uri() + f'?capture&option={opt}&state={st}')
                pg.add_style_tag(content=HIDE)
                pg.evaluate('() => document.fonts && document.fonts.ready')
                pg.wait_for_timeout(350)
                name = f'{opt}_{st}_w{w}x{h}'
                if st != 'available-long':
                    pg.screenshot(path=str(OUT / f'{name}.png'))
                audit[name] = pg.evaluate(MEASURE)
                if (w, h) == (360, 640) and audit[name]['scrollOverflow'] > 0 and st != 'available-long':
                    pg.evaluate("() => { const s = document.querySelector('.scroll'); s.scrollTop = s.scrollHeight; }")
                    pg.wait_for_timeout(100)
                    pg.screenshot(path=str(OUT / f'{name}_end.png'))
                if e: errs[name] = e
                pg.close()
    br.close()
(RUN / 'audit.json').write_text(json.dumps(audit, indent=1))
print(json.dumps(errs) if errs else 'no console errors')
