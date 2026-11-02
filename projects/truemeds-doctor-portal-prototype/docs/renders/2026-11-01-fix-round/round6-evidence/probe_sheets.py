"""Round 6 probe: every open sheet state. Bar covered, sheet buttons visible/tappable, sticky actions when tall.
Usage: probe_sheets.py OUT.json [--vw 390,360] [--h 844,640]"""
import sys, json, pathlib, argparse
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from playwright.sync_api import sync_playwright
import capture as C

JS = r"""() => {
  const vh = innerHeight, vw = innerWidth;
  const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.closest('[hidden]'); };
  const sheets = [...document.querySelectorAll('.tm-sheet')].filter(vis);
  const bars = [...document.querySelectorAll('.tm-actionbar, #case-actionbar')].filter(vis);
  const out = { sheets: [], bars: bars.map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; }), problems: [] };
  const hitIn = (el, x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === el || el.contains(e)); };
  // 1. bar covered by the sheet / scrim
  for (const bar of bars) {
    const r = bar.getBoundingClientRect();
    if (!sheets.length) break;
    const pts = [[r.left + 4, r.top + 4], [r.left + r.width / 2, r.top + r.height / 2], [r.right - 4, r.bottom - 4], [r.left + 20, r.top + 2]];
    for (const [x, y] of pts) {
      const e = document.elementFromPoint(Math.min(Math.max(x, 0), vw - 1), Math.min(Math.max(y, 0), vh - 1));
      if (!e) continue;
      if (bar.contains(e)) { out.problems.push('bar-on-top at ' + Math.round(x) + ',' + Math.round(y) + ' ' + e.tagName + '.' + (e.className || '').toString().slice(0, 40)); break; }
    }
  }
  for (const s of sheets) {
    const r = s.getBoundingClientRect();
    const rec = { id: s.id || (s.querySelector('h2') || {}).textContent || '?', top: Math.round(r.top), bottom: Math.round(r.bottom),
      scrollable: s.scrollHeight > s.clientHeight + 1, scrollTop: s.scrollTop, actions: 0 };
    const title = s.querySelector('.tm-sheet__title, h2');
    if (title && vis(title)) { const tr = title.getBoundingClientRect(); rec.titleVisible = tr.top >= 0 && tr.bottom <= vh && hitIn(s, tr.left + 4, tr.top + tr.height / 2); }
    const btns = [...s.querySelectorAll('.tm-sheet__actions button')].filter(vis);
    rec.actions = btns.length;
    const check = (label) => {
      for (const b of btns) {
        const br = b.getBoundingClientRect(); const sr = s.getBoundingClientRect();
        const inView = br.top >= Math.max(0, sr.top) - 0.5 && br.bottom <= Math.min(vh, sr.bottom) + 0.5;
        const cx = br.left + br.width / 2, cy = br.top + br.height / 2;
        const tap = cy >= 0 && cy <= vh && hitIn(b, cx, cy);
        if (!inView || !tap) out.problems.push(label + ': button "' + b.textContent.trim().slice(0, 30) + '" ' + (inView ? '' : 'off-sheet ') + (tap ? '' : 'not-tappable'));
      }
    };
    check('rest');
    if (rec.scrollable) {
      s.scrollTop = s.scrollHeight; rec.scrolledTop = s.scrollTop;
      check('scrolled-bottom');
      const act = s.querySelector(':scope > .tm-sheet__actions');
      if (act) { const ar = act.getBoundingClientRect(), sr = s.getBoundingClientRect(); rec.actionsStuckBottomGap = Math.round((sr.bottom - ar.bottom) * 10) / 10;
        rec.shadowWhenStuck = getComputedStyle(act).boxShadow !== 'none'; }
      s.scrollTop = 0;
      const ch = s.querySelector('.tm-sheet__body, .tm-sheet__subtitle, .tm-sheet__label');
      if (ch) { const cr = ch.getBoundingClientRect(); rec.contentFirstTop = Math.round(cr.top); }
    }
    s.scrollTop = 0;
    out.sheets.push(rec);
  }
  return out;
}"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--vw', default='390,360')
    ap.add_argument('--h', default='844,640')
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    combos = [(int(w), int(h)) for w in a.vw.split(',') for h in a.h.split(',')]
    # pair width with height: 390x844 and 360x640 (the two sheet sizes), plus any extra combo asked for
    only = set(x for x in a.only.split(',') if x)
    res = {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        for sub, st in C.all_states():
            if only and f'{sub}/{st}' not in only and st not in only: continue
            for vw, h in combos:
                pg = br.new_page(viewport={'width': vw, 'height': h}, device_scale_factor=2)
                pg.clock.set_fixed_time(C.FIXED)
                errs = []
                pg.on('pageerror', lambda e, er=errs: er.append(str(e)))
                url = C.guard.std_url(sub, st, vw)
                if h != 844: url = url.replace('&capture=1', '')
                pg.goto(url); pg.add_style_tag(content=C.HIDE)
                pg.evaluate('() => document.fonts && document.fonts.ready')
                pg.wait_for_timeout(2000 if (sub == 'case' or st.startswith('d-')) else 700)
                pg.evaluate(C.FREEZE)
                r = pg.evaluate(JS)
                if r['sheets'] or r['problems'] or errs:
                    res[f'{sub}/{st}@{vw}x{h}'] = {**r, 'errors': errs}
                pg.close()
        br.close()
    pathlib.Path(a.out).write_text(json.dumps(res, indent=1))
    n_prob = sum(len(v['problems']) for v in res.values())
    n_err = sum(len(v['errors']) for v in res.values())
    print(f'sheet states probed: {len(res)}; problems: {n_prob}; page errors: {n_err}')
    for k, v in res.items():
        if v['problems'] or v['errors']:
            print(' ', k, v['problems'][:4], v['errors'][:2])

if __name__ == '__main__':
    main()
