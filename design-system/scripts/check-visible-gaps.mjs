#!/usr/bin/env node
// Visible-gap checker (D-108, RULES §8.3). Measures vertical gaps between VISIBLE edges, never layout boxes:
//   text   — the ink of each line from Range client rects, trimmed to cap height (top) and the font's descender line
//            (bottom), not the line box;
//   shapes — filled / bordered / shadowed elements: their painted border box (children are part of the shape);
//   images — <img>, <svg> (union of its drawn shapes), <canvas>, <video>: their painted bounds.
// Tap areas (a transparent ::after hit area) and reserved empty lines produce no edge. Units that overlap vertically form
// one row; each gap between consecutive rows must be 8, 16 or 32 (± tolerance), or a listed component anatomy value.
//
// CLI:  node design-system/scripts/check-visible-gaps.mjs --config <config.json> [--out <dir>]
//       writes <out>/visible-gaps.json and one picture per page and size (<page>_<w>x<h>.png) with the gaps drawn;
//       exit 1 if any gap fails. Config: see README note at the bottom of this file.
// API:  launchBrowser(), measurePage(page, options), checkVisibleGaps(config) — tests in scripts/tests/.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DS = resolve(HERE, '..');

// The project's capture settings (band / screens audits, D-94): installed Chrome, rasterisation flags, DPR 2, fixed clock.
export const CAPTURE = {
  chrome: process.env.CHROMIUM || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  flags: ['--font-render-hinting=none', '--disable-gpu', '--disable-lcd-text', '--force-color-profile=srgb',
    '--disable-font-subpixel-positioning', '--disable-partial-raster', '--disable-skia-runtime-opts', '--hide-scrollbars'],
  dpr: 2,
  clock: new Date('2026-11-11T15:00:00'),
};

// Playwright is not a design-system dependency: use the first install found (env, cwd, a project's tests/ folder).
async function loadPlaywright() {
  const dirs = [process.env.TM_PLAYWRIGHT, process.cwd(), join(process.cwd(), 'tests'), HERE, DS];
  const projects = resolve(DS, '..', 'projects');
  if (existsSync(projects)) for (const p of readdirSync(projects)) dirs.push(join(projects, p, 'tests'));
  for (const d of dirs.filter(Boolean)) {
    try { return await import(pathToFileURL(createRequire(join(d, 'noop.js')).resolve('playwright')).href); } catch { /* next */ }
  }
  throw new Error('Playwright not found: install it in the project tests/ folder or set TM_PLAYWRIGHT to a folder that has it');
}

export async function launchBrowser() {
  const pw = await loadPlaywright();
  const chromium = pw.chromium || pw.default?.chromium;
  const opts = { args: CAPTURE.flags };
  if (existsSync(CAPTURE.chrome)) opts.executablePath = CAPTURE.chrome;
  return chromium.launch(opts);
}

// Runs inside the page. Returns rows (relative to the root's top-left) and gaps per region, plus page-space boxes to draw.
const MEASURE = (o) => {
  const root = document.querySelector(o.root);
  if (!root) throw new Error(`root not found: ${o.root}`);
  const R = root.getBoundingClientRect();
  const regionDefs = (o.regions && o.regions.length) ? o.regions : [{ name: 'root', selector: null, edgeTop: false }];
  const regionEls = regionDefs.map(d => d.selector ? root.querySelector(d.selector) : root);
  const cs = e => getComputedStyle(e);
  const alpha = c => { if (!c || c === 'transparent') return 0; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const ctx = document.createElement('canvas').getContext('2d');
  const metricsCache = new Map();
  const metrics = (el) => {
    const c = cs(el); const font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;
    if (!metricsCache.has(font)) {
      ctx.font = font; const cap = ctx.measureText('H'); const desc = ctx.measureText('gjpqy');
      metricsCache.set(font, { asc: cap.fontBoundingBoxAscent, fdesc: cap.fontBoundingBoxDescent,
        cap: cap.actualBoundingBoxAscent, desc: desc.actualBoundingBoxDescent });
    }
    return metricsCache.get(font);
  };
  const matches = (e, list) => (list || []).some(s => { try { return e.matches(s); } catch { return false; } });
  const effBg = (e) => { for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const b = cs(p).backgroundColor; if (alpha(b) > 0) return b; } return 'rgb(255, 255, 255)'; };
  const painted = (e) => {
    const c = cs(e);
    if (alpha(c.backgroundColor) > 0 && c.backgroundColor !== effBg(e.parentElement)) return true;
    if (c.backgroundImage && c.backgroundImage !== 'none') return true;
    if (c.boxShadow && c.boxShadow !== 'none') return true;
    return ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(c[`border${s}Width`]) > 0 && !/none|hidden/.test(c[`border${s}Style`]) && alpha(c[`border${s}Color`]) > 0);
  };
  const shown = (e) => { const c = cs(e); return c.display !== 'none' && c.visibility !== 'hidden' && c.visibility !== 'collapse' && parseFloat(c.opacity) > 0; };
  const opaqueChain = (e) => { for (let p = e; p && p !== document.documentElement; p = p.parentElement) if (parseFloat(cs(p).opacity) === 0) return false; return true; };
  // Clip a rect by every ancestor that hides overflow (overflow hidden / clip: sr-only text, masked parts). Scroll areas
  // (auto / scroll) do not clip: content below the fold is still on the screen once scrolled.
  const clip = (r, e) => {
    let { left, top, right, bottom } = r;
    for (let p = e.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const c = cs(p); if (!/hidden|clip/.test(c.overflowX + c.overflowY)) continue;
      const b = p.getBoundingClientRect();
      left = Math.max(left, b.left); right = Math.min(right, b.right); top = Math.max(top, b.top); bottom = Math.min(bottom, b.bottom);
    }
    return (right - left > 1 && bottom - top > 1) ? { left, top, right, bottom } : null;
  };
  const union = (rs) => rs.length ? { left: Math.min(...rs.map(r => r.left)), top: Math.min(...rs.map(r => r.top)), right: Math.max(...rs.map(r => r.right)), bottom: Math.max(...rs.map(r => r.bottom)) } : null;
  const isBlockOwner = (e) => { const d = cs(e).display; return !(d.startsWith('inline') || d === 'contents' || d === 'ruby'); };
  const textInk = (node) => {
    const el = node.parentElement; if (!el || !node.textContent.trim()) return [];
    if (!shown(el) || !opaqueChain(el) || alpha(cs(el).color) === 0) return [];
    const m = metrics(el); const rg = document.createRange(); rg.selectNodeContents(node);
    const out = [];
    for (const r of rg.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const base = r.top + r.height * m.asc / (m.asc + m.fdesc);
      const c = clip({ left: r.left, right: r.right, top: base - m.cap, bottom: base + m.desc }, el);
      if (c) out.push(c);
    }
    return out;
  };
  // Painted bounds of a picture. SVG: union of the drawn shapes that render (not inside defs / clipPath / mask / symbol /
  // marker / pattern, not hidden, with a fill or stroke), each grown by half its stroke width in screen pixels.
  // <img> / <canvas> / <video>: the content box (padding and border are not the picture). Transparent pixels inside a
  // bitmap are not inspected.
  const imageBounds = (e) => {
    if (e.tagName.toLowerCase() === 'svg') {
      const vb = e.viewBox && e.viewBox.baseVal; const eb = e.getBoundingClientRect();
      const scale = vb && vb.width ? eb.width / vb.width : 1;
      const parts = [];
      for (const s of e.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse, use, text, image')) {
        if (s.closest('defs, clipPath, mask, symbol, marker, pattern')) continue;
        const c = cs(s); if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) === 0) continue;
        const stroke = c.stroke && c.stroke !== 'none' && alpha(c.stroke) > 0 ? parseFloat(c.strokeWidth) || 0 : 0;
        if (!stroke && (c.fill === 'none' || alpha(c.fill) === 0) && !/^(use|image|text)$/.test(s.tagName)) continue;
        const b = s.getBoundingClientRect(); if (!(b.width > 0 || b.height > 0)) continue;
        const g = stroke * scale / 2;
        parts.push({ left: b.left - g, top: b.top - g, right: b.right + g, bottom: b.bottom + g });
      }
      const u = union(parts); if (u) return u;
    }
    const b = e.getBoundingClientRect(); const c = cs(e);
    const t = parseFloat(c.borderTopWidth) + parseFloat(c.paddingTop), btm = parseFloat(c.borderBottomWidth) + parseFloat(c.paddingBottom);
    const l = parseFloat(c.borderLeftWidth) + parseFloat(c.paddingLeft), r = parseFloat(c.borderRightWidth) + parseFloat(c.paddingRight);
    return e.tagName.toLowerCase() === 'svg' ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom } : { left: b.left + l, top: b.top + t, right: b.right - r, bottom: b.bottom - btm };
  };
  const short = (s) => s.replace(/\s+/g, ' ').trim().slice(0, 48);
  const name = (e) => { const t = short(e.innerText || e.textContent || ''); const cl = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean)[0];
    return t || `${e.tagName.toLowerCase()}${cl ? '.' + cl : ''}`; };

  const sel = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
  const result = { regions: [], draw: [] };
  regionDefs.forEach((def, ri) => {
    const reg = regionEls[ri];
    const out = { name: def.name, rows: [], gaps: [] };
    result.regions.push(out);
    if (!reg || !shown(reg) || !reg.getClientRects().length) {   // a missing region fails unless the config says it may be absent
      out.missing = true;
      if (!def.optional) out.gaps.push({ above: '—', below: '—', px: null, expected: null, pass: false, rule: 'missing', note: `region "${def.name}" (${def.selector}) not found or hidden` });
      return;
    }
    const others = regionEls.filter((r, j) => r && j !== ri && r !== reg && reg.contains(r));
    const units = []; const owners = new Map();
    const addUnit = (el, kind, rect) => { if (rect) units.push({ el, kind, rect, label: name(el) }); };
    const visit = (e) => {
      if (others.includes(e) || matches(e, o.ignore) || !shown(e) || !opaqueChain(e)) return;
      const tag = e.tagName.toLowerCase();
      if (matches(e, o.atomic)) {   // a component measured as one shape: union of everything it draws
        const sub = []; const collect = (x) => { for (const k of x.children) { if (!shown(k)) continue; if (painted(k) || /^(svg|img|canvas|video)$/.test(k.tagName.toLowerCase())) { const b = /^(svg|img|canvas|video)$/.test(k.tagName.toLowerCase()) ? imageBounds(k) : k.getBoundingClientRect(); sub.push(clip({ left: b.left, top: b.top, right: b.right, bottom: b.bottom }, k)); } else collect(k); }
          for (const n of x.childNodes) if (n.nodeType === 3) sub.push(...textInk(n)); };
        if (painted(e)) { const b = e.getBoundingClientRect(); sub.push(clip({ left: b.left, top: b.top, right: b.right, bottom: b.bottom }, e)); }
        collect(e); addUnit(e, 'paint', union(sub.filter(Boolean))); return;
      }
      if (/^(svg|img|canvas|video)$/.test(tag)) { addUnit(e, 'image', clip(imageBounds(e), e)); return; }
      if (e !== reg && painted(e)) { const b = e.getBoundingClientRect(); addUnit(e, 'paint', clip({ left: b.left, top: b.top, right: b.right, bottom: b.bottom }, e)); return; }
      for (const n of e.childNodes) {
        if (n.nodeType === 1) visit(n);
        else if (n.nodeType === 3) {
          const ink = textInk(n); if (!ink.length) continue;
          let owner = n.parentElement; while (owner !== reg && !isBlockOwner(owner)) owner = owner.parentElement;
          if (!owners.has(owner)) { const u = { el: owner, els: [owner], kind: 'text', rects: [], label: name(owner) }; owners.set(owner, u); units.push(u); }
          const ou = owners.get(owner); ou.rects.push(...ink);
          if (!ou.els.includes(n.parentElement)) ou.els.push(n.parentElement);   // role matching sees every element holding the text
        }
      }
    };
    visit(reg);
    for (const u of units) if (u.kind === 'text') u.rect = union(u.rects);
    const live = units.filter(u => u.rect).sort((a, b) => a.rect.top - b.rect.top);
    // Rows: units side by side that overlap vertically (an icon beside its title). Two units that overlap vertically AND
    // horizontally are stacked blocks running into each other: recorded as an overlap, which fails.
    const rows = []; const overlaps = [];
    const hOver = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5;
    for (const u of live) {
      const last = rows[rows.length - 1];
      if (last && u.rect.top < last.bottom - 0.5) {
        const hitU = last.units.find(v => hOver(v.rect, u.rect) && !v.el.contains(u.el) && !u.el.contains(v.el));
        if (hitU) overlaps.push([hitU, u]);
        last.units.push(u); last.bottom = Math.max(last.bottom, u.rect.bottom);
      } else rows.push({ top: u.rect.top, bottom: u.rect.bottom, units: [u] });
    }
    const r1 = v => Math.round(v * 10) / 10;
    const allowed = o.allowed || [8, 16, 32]; const tol = o.tolerance ?? 2;
    // Pair rules (D-108): what sits above and below decides the gap. First matching rule wins; a rule names roles
    // ('@legal') or selectors; '*' is anything. box: true measures the layout boxes of the two matched elements (component
    // anatomy that keeps its own spec, e.g. the pinned bar's stacked buttons). No rule matched -> any of 8 / 16 / 32.
    const roles = o.roles || {};
    const sl = (s) => s === '*' ? '*' : (s && s.startsWith('@') ? (roles[s.slice(1)] || null) : s);
    const hit = (els, s) => { const q = sl(s); if (!q) return null; if (q === '*') return els[0] || null;
      for (const e of els) { try { const m = e.closest(q); if (m) return m; } catch { return null; } } return null; };
    const judge = (px, aboveEls, belowEls, edge) => {
      if (edge) { const g = def.edgeGap ?? 32; return { expected: g, pass: Math.abs(px - g) <= tol, rule: 'edge', note: 'content starts this far below the region top' }; }
      for (const r of [...(o.anatomy || []).map(a => ({ kind: 'anatomy', ...a })), ...(o.rules || [])]) {
        const A = hit(aboveEls, r.above), B = hit(belowEls, r.below); if (!A || !B) continue;
        const v = r.box ? r1(B.getBoundingClientRect().top - A.getBoundingClientRect().bottom) : px;
        return { expected: r.gap, pass: Math.abs(v - r.gap) <= tol, rule: r.kind || 'pair', note: r.note, ...(r.box ? { boxPx: v } : {}) };
      }
      const near = allowed.reduce((b, v) => Math.abs(v - px) < Math.abs(b - px) ? v : b, allowed[0]);
      return { expected: near, pass: Math.abs(px - near) <= tol, rule: 'scale' };
    };
    const rowLabel = row => row.units.map(u => u.label).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(' | ');
    if (def.edgeTop && rows.length) {
      const top = reg.getBoundingClientRect().top; const px = r1(rows[0].top - top);
      out.gaps.push({ above: `${def.name} top edge`, below: rowLabel(rows[0]), px, ...judge(px, [reg], rows[0].units.flatMap(u => u.els || [u.el]), true), y1: top - R.top, y2: rows[0].top - R.top, x1: rows[0].units[0].rect.left - R.left, x2: rows[0].units[0].rect.right - R.left });
    }
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i]; const px = r1(b.top - a.bottom);
      const xs = [...a.units, ...b.units].map(u => u.rect);
      out.gaps.push({ above: rowLabel(a), below: rowLabel(b), px, ...judge(px, a.units.flatMap(u => u.els || [u.el]), b.units.flatMap(u => u.els || [u.el]), false),
        y1: a.bottom - R.top, y2: b.top - R.top, x1: Math.max(...xs.map(r => r.left)) - R.left, x2: Math.min(...xs.map(r => r.right)) - R.left });
    }
    for (const [a, b] of overlaps) {
      out.gaps.push({ above: a.label, below: b.label, px: r1(b.rect.top - a.rect.bottom), expected: null, pass: false, rule: 'overlap', note: 'stacked blocks overlap',
        y1: b.rect.top - R.top, y2: a.rect.bottom - R.top, x1: Math.max(a.rect.left, b.rect.left) - R.left, x2: Math.min(a.rect.right, b.rect.right) - R.left });
    }
    out.rows = rows.map(row => ({ top: r1(row.top - R.top), bottom: r1(row.bottom - R.top),
      units: row.units.map(u => ({ label: u.label, kind: u.kind, sel: sel(u.el), top: r1(u.rect.top - R.top), bottom: r1(u.rect.bottom - R.top), left: r1(u.rect.left - R.left), right: r1(u.rect.right - R.left) })) }));
    for (const g of out.gaps) for (const k of ['y1', 'y2', 'x1', 'x2']) g[k] = r1(g[k]);
  });
  result.origin = { x: R.left + scrollX, y: R.top + scrollY, w: R.width, h: R.height };
  return result;
};

// Roles: design-system classes for each part D-108 names. A project adds its own local classes per role in its config
// (selectors are joined, so a project role extends the shared one).
const NOT_BAR = ':not(.tm-actionbar *):not(.tm-sheet__actions *)';   // pinned bars keep their own spec
export const DEFAULT_ROLES = {
  label: '.tm-field__label, .tm-sheet__label',          // label of a field
  groupLabel: '',                                        // "Quick picks", "Custom": 8 to its control
  field: '.tm-field__control, .tm-otp-slots',
  helper: '.tm-field__helper',                           // helper or the field's reserved message line
  notice: `.tm-notice${NOT_BAR}`,
  legal: '.tm-legal',                                    // legal / consent line that describes the button under it
  linkLine: '',                                          // a line whose action is a link ("Didn't receive it? Resend")
  tile: '',                                              // hero / picture tile
  caption: '',                                           // the caption of a picture tile
  chip: '.tm-chip',
  card: '.tm-card',
  pointTitle: '',                                        // title of a point (icon · title · line)
  pointLine: '',                                         // the line under a point's title
  button: `.tm-btn${NOT_BAR}`,
  barNotice: '.tm-actionbar .tm-notice, .tm-sheet__actions .tm-notice',
  barButton: '.tm-actionbar .tm-btn, .tm-sheet__actions .tm-btn',
  barCaption: '.tm-actionbar :not(.tm-btn):not(.tm-btn *):not(.tm-notice):not(.tm-notice *)',
  sheetTitle: '.tm-sheet__title', sheetSubtitle: '.tm-sheet__subtitle',
  sheetHeader: '.tm-sheet__header', sheetBody: '.tm-sheet__body', sheetActions: '.tm-sheet__actions',
};
// D-108 (RULES §8.3, "Entry and home screens"): first match wins, so the specific pairs come first.
export const D108_RULES = [
  // component anatomy that keeps its own spec
  { above: '@barButton', below: '@barButton', gap: 8, box: true, kind: 'anatomy', note: 'pinned bar / sheet actions: buttons 8 apart' },
  { above: '@barNotice', below: '@barButton', gap: 16, kind: 'anatomy', note: 'notice in the pinned bar / sheet actions: 16 above its button' },
  { above: '@barCaption', below: '@barButton', gap: 8, kind: 'anatomy', note: 'bar caption line 8 above its button' },
  { above: '@sheetTitle', below: '@sheetSubtitle', gap: 8, box: true, kind: 'anatomy', note: 'sheet subtitle 8 under the title (D-109)' },
  { above: '@sheetHeader', below: '@sheetBody', gap: 16, box: true, kind: 'anatomy', note: 'sheet header → content 16' },
  { above: '@sheetBody', below: '@sheetActions', gap: 24, box: true, kind: 'anatomy', note: 'sheet content → actions 24' },
  { above: '@button', below: '@button', gap: 8, box: true, kind: 'anatomy', note: 'stacked buttons 8 apart' },
  { above: '@chip', below: '@chip', gap: 8, kind: 'anatomy', note: 'chip grid 8 / 8' },
  // 8 joins parts of one thing
  { above: '@label', below: '@field', gap: 8, note: 'label ↔ field' },
  { above: '@groupLabel', below: '*', gap: 8, note: 'group label → its control' },
  { above: '@field', below: '@helper', gap: 8, note: 'field ↔ its helper / message line' },
  { above: '@legal', below: '@button', gap: 8, note: 'legal line ↔ the button it describes' },
  { above: '@tile', below: '@caption', gap: 8, note: 'a picture tile ↔ its caption (D-108, corrected 2026-11-11: 8)' },
  // 16 inside one group; a field's own message
  { above: '@field', below: '@notice', gap: 16, note: 'a message about one field: 16 under it' },
  { above: '@card', below: '@card', gap: 16, note: 'cards stacked' },
  { above: '@pointTitle', below: '@pointLine', gap: 8, note: 'point title ↔ its line (one thing)' },
  { above: '@pointLine', below: '@pointTitle', gap: 16, note: 'points 16 apart' },
  { above: '@pointTitle', below: '@pointTitle', gap: 16, note: 'points 16 apart (title-only points)' },
  // 32 between different things
  { above: '@tile', below: '*', gap: 32, note: 'hero tile → the content under it' },
  { above: '@notice', below: '*', gap: 32, note: 'notice → the next thing' },
  { above: '*', below: '@notice', gap: 32, note: 'different thing → a notice' },
  { above: '*', below: '@button', gap: 32, note: 'different thing → a button' },
  { above: '@linkLine', below: '*', gap: 32, note: 'link line → the next thing' },
  { above: '*', below: '@linkLine', gap: 32, note: 'different thing → a link line' },
  { above: '@helper', below: '*', gap: 32, note: 'field group → the next thing' },
  { above: '@field', below: '*', gap: 32, note: 'field group → the next thing' },
];
const mergeRoles = (extra = {}) => { const r = { ...DEFAULT_ROLES };
  for (const [k, v] of Object.entries(extra)) r[k] = [r[k], v].filter(Boolean).join(', '); return r; };

export async function measurePage(page, options = {}) {
  const o = { root: 'body', ...options, roles: mergeRoles(options.roles),
    rules: [...(options.rules || []), ...(options.defaultRules === false ? [] : D108_RULES)] };
  const res = await page.evaluate(MEASURE, o);
  const failures = res.regions.reduce((n, r) => n + r.gaps.filter(g => !g.pass).length, 0);
  return { pass: failures === 0, failures, regions: res.regions, origin: res.origin };
}

// Draws the units and gaps over the page, screenshots the root, removes the overlay.
export async function drawReport(page, report, file) {
  await page.evaluate((rep) => {
    const layer = document.createElement('div'); layer.id = '__vg_overlay';
    Object.assign(layer.style, { position: 'absolute', left: rep.origin.x + 'px', top: rep.origin.y + 'px', width: rep.origin.w + 'px', height: rep.origin.h + 'px', pointerEvents: 'none', zIndex: 2147483647 });
    const box = (x, y, w, h, css) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', boxSizing: 'border-box', ...css }); layer.appendChild(d); return d; };
    const col = { text: 'rgba(0, 120, 255, .9)', paint: 'rgba(160, 0, 200, .9)', image: 'rgba(0, 150, 130, .9)' };
    for (const r of rep.regions) for (const row of r.rows) for (const u of row.units) box(u.left, u.top, u.right - u.left, u.bottom - u.top, { outline: `1px solid ${col[u.kind]}` });
    for (const r of rep.regions) for (const g of r.gaps) {
      const c = g.pass ? 'rgba(0, 160, 60, .35)' : 'rgba(230, 0, 0, .45)';
      const x = Math.max(0, Math.min(g.x1, g.x2 - 40)); const w = Math.max(40, g.x2 - g.x1);
      box(x, g.y1, Math.min(w, rep.origin.w - x), Math.max(1, g.y2 - g.y1), { background: c });
      const t = box(Math.max(0, rep.origin.w - 62), g.y1 + (g.y2 - g.y1) / 2 - 8, 60, 16, { background: g.pass ? '#0a7a35' : '#c00000', color: '#fff', font: '600 11px/16px Arial, sans-serif', textAlign: 'center', borderRadius: '3px' });
      t.textContent = `${g.px}${g.pass ? '' : ' ≠' + g.expected}`;
    }
    document.body.appendChild(layer);
  }, report);
  const o = report.origin;
  await page.screenshot({ path: file, clip: { x: o.x, y: o.y, width: o.w, height: o.h } });
  await page.evaluate(() => document.getElementById('__vg_overlay')?.remove());
}

// config: { pages: [{ name, url, root, regions, viewport?: "390x844", viewports?: [...], prepare?: "js expression",
//   anatomy?, atomic?, ignore? }], viewports: ["390x844", "360x640"], allowed?, tolerance?, anatomy?, atomic?, ignore? }
// url: http(s)/file URL, or a path relative to the config file. Shared lists (anatomy / atomic / ignore) add to per-page ones.
export async function checkVisibleGaps(config, { base = process.cwd(), out = null } = {}) {
  const browser = await launchBrowser();
  const report = { checker: 'design-system/scripts/check-visible-gaps.mjs', rule: 'D-108 / RULES §8.3', allowed: config.allowed || [8, 16, 32], tolerance: config.tolerance ?? 2, pages: [] };
  try {
    for (const p of config.pages) {
      const sizes = p.viewports || (p.viewport ? [p.viewport] : (config.viewports || ['390x844']));
      for (const size of sizes) {
        const [w, h] = size.split('x').map(Number);
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: CAPTURE.dpr });
        const page = await ctx.newPage();
        if (page.clock) await page.clock.setFixedTime(CAPTURE.clock);
        const errors = []; page.on('pageerror', e => errors.push(String(e)));
        const [path, query] = p.url.split(/(?=[?#])/);
        const url = /^(https?|file):/.test(p.url) ? p.url : pathToFileURL(isAbsolute(path) ? path : resolve(base, path)).href + (query || '');
        await page.goto(url);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}' });
        await page.evaluate(() => document.fonts && document.fonts.ready); await page.waitForTimeout(150);
        if (p.prepare) { await page.evaluate(p.prepare); await page.waitForTimeout(60); }
        const roles = { ...(config.roles || {}) }; for (const [k, v] of Object.entries(p.roles || {})) roles[k] = [roles[k], v].filter(Boolean).join(', ');
        const opts = { root: p.root || 'body', regions: p.regions, allowed: config.allowed, tolerance: config.tolerance, roles,
          rules: [...(p.rules || []), ...(config.rules || [])], defaultRules: config.defaultRules,
          anatomy: [...(config.anatomy || []), ...(p.anatomy || [])], atomic: [...(config.atomic || []), ...(p.atomic || [])], ignore: [...(config.ignore || []), ...(p.ignore || [])] };
        let rep;
        try { rep = await measurePage(page, opts); } catch (e) { rep = { pass: false, failures: 1, error: String(e), regions: [] }; }
        let picture = null;
        if (out && rep.origin) { picture = `${p.name.replace(/[^\w.-]+/g, '_')}_${size}.png`; await drawReport(page, rep, join(out, picture)); }
        delete rep.origin;
        report.pages.push({ name: p.name, size, url: p.url, picture, errors, ...rep });
        await ctx.close();
      }
    }
  } finally { await browser.close(); }
  report.failures = report.pages.reduce((n, p) => n + p.failures, 0);
  report.pass = report.failures === 0;
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const cfgPath = arg('--config');
  if (!cfgPath) { console.error('usage: check-visible-gaps.mjs --config <config.json> [--out <dir>]'); process.exit(2); }
  const config = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const out = arg('--out'); if (out) mkdirSync(out, { recursive: true });
  const report = await checkVisibleGaps(config, { base: dirname(resolve(cfgPath)), out });
  if (out) writeFileSync(join(out, 'visible-gaps.json'), JSON.stringify(report, null, 1));
  for (const p of report.pages) {
    const bad = p.regions.flatMap(r => r.gaps.filter(g => !g.pass).map(g => `${r.name}: "${g.above}" → "${g.below}" ${g.px} (expected ${g.expected})`));
    console.log(`${p.pass ? 'PASS' : 'FAIL'} ${p.name} ${p.size}${p.error ? ' ERROR ' + p.error : ''}${bad.length ? '\n  ' + bad.join('\n  ') : ''}`);
  }
  console.log(`${report.pass ? 'ALL PASS' : `${report.failures} failing gap(s)`} over ${report.pages.length} capture(s)`);
  process.exit(report.pass ? 0 : 1);
}
