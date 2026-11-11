"""Home v3: capture home-v3.html (4 frames) the same way as home-render/tools/capture.py
(installed Chrome, D-94 rasterisation flags, fixed clock, DPR 2) and measure every vertical gap.
  python3 tools/capture.py <run folder> <out name, e.g. home-v3-r1>
Writes <out>.png (whole sheet), shots/<out>_<frame>.png and <out>-measure.json."""
import sys, os, pathlib, datetime, json
from playwright.sync_api import sync_playwright
RUN = pathlib.Path(sys.argv[1]).resolve(); NAME = sys.argv[2]
SRC = RUN / 'home-v3.html'
SHOTS = RUN / 'shots'; SHOTS.mkdir(exist_ok=True)
MEASURE = r'''() => [...document.querySelectorAll('.frame')].map((f, i) => {
  const R = (s) => { const e = f.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  const g = (a, b, A, B) => (a && b) ? Math.round(b[B || 'top'] - a[A || 'bottom']) : null;
  const top = f.getBoundingClientRect().top;
  const cs = (s) => { const e = f.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return `${c.fontSize}/${c.lineHeight} ${c.fontWeight} ${c.color}`; };
  const o = { frame: i, w: Math.round(f.getBoundingClientRect().width), h: Math.round(f.getBoundingClientRect().height) };
  o.logoTop = Math.round(R('.logo').top - top);
  o.logoToTitle = g(R('.logo'), R('.band h1'));
  o.titleToSub = g(R('.band h1'), R('.sub'));
  o.subToPanel = g(R('.sub'), R('.panel'));
  o.panelToFirst = g(R('.panel'), R('.scroll > *'), 'top');
  const labels = [...f.querySelectorAll('.lbl')].map(e => e.getBoundingClientRect());
  const groups = [...f.querySelectorAll('.group')].map(e => e.getBoundingClientRect());
  o.labelToControl = [...f.querySelectorAll('.lbl')].map(l => Math.round(l.nextElementSibling.getBoundingClientRect().top - l.getBoundingClientRect().bottom));
  o.betweenGroups = groups.length > 1 ? Math.round(groups[1].top - groups[0].bottom) : null;
  const chips = [...f.querySelectorAll('.tm-chip')].map(e => e.getBoundingClientRect());
  if (chips.length > 3) { o.chipRowGap = Math.round(chips[3].top - chips[0].bottom); o.chipColGap = Math.round(chips[1].left - chips[0].right); o.chipH = Math.round(chips[0].height); }
  const rows = [...f.querySelectorAll('.srow')].map(e => e.getBoundingClientRect());
  if (rows.length) { o.rowH = rows.map(r => Math.round(r.height)); const c = R('.card'); o.cardToRow = Math.round(rows[0].top - c.top); }
  const sc = f.querySelector('.scroll'); const kids = [...sc.querySelectorAll('*')].filter(e => e.getClientRects().length);
  o.lastContentBottom = Math.round(Math.max(...kids.map(e => e.getBoundingClientRect().bottom)) - top);
  o.scrollOverflow = Math.round(sc.scrollHeight - sc.clientHeight);
  o.barTop = Math.round(R('.footer').top - top);
  o.contentToBar = Math.round(R('.footer').top - Math.max(...kids.map(e => e.getBoundingClientRect().bottom)));
  const btns = [...f.querySelectorAll('button, .tm-chip, .srow')].filter(b => b.getClientRects().length);
  o.smallTargets = btns.filter(b => b.getBoundingClientRect().height < 47.5 && b.classList.contains('srow') === false).map(b => (b.textContent.trim() || b.className));
  o.type = { title: cs('.band h1'), sub: cs('.sub'), lbl: cs('.lbl'), rowLabel: cs('.srow .k'), value: cs('.v'), until: cs('.until') };
  const add = f.querySelector('.srow .tm-btn--secondary');
  if (add) { const a = add.getBoundingClientRect(), v = R('.srow .v'), k = R('.srow .k'); o.addBtn = { h: Math.round(a.height), centreY: Math.round((a.top + a.bottom) / 2 - top), valueCentreY: Math.round((v.top + v.bottom) / 2 - top), labelCentreY: Math.round((k.top + k.bottom) / 2 - top) }; }
  return o; })'''
with sync_playwright() as p:
    FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
             "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    pg = br.new_page(viewport={'width': 1700, 'height': 920}, device_scale_factor=2)
    pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda x: errs.append(str(x)))
    pg.goto(SRC.as_uri())
    pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
    pg.evaluate('() => document.fonts && document.fonts.ready')
    pg.wait_for_timeout(400)
    pg.evaluate("() => { const e = document.querySelector('.at-end .scroll'); if (e) e.scrollTop = e.scrollHeight; }")
    pg.screenshot(path=str(RUN / f'{NAME}.png'), full_page=True)
    for i, el in enumerate(pg.query_selector_all('.frame')):
        tag = ['setup_w390x844', 'available_w390x844', 'setup_w360x640', 'available_w360x640', 'setup_w360x640_end'][i]
        el.screenshot(path=str(SHOTS / f'{NAME}_{tag}.png'))
    m = pg.evaluate(MEASURE)
    (RUN / f'{NAME}-measure.json').write_text(json.dumps(m, indent=1))
    br.close()
print(json.dumps(errs) if errs else 'no console errors')
