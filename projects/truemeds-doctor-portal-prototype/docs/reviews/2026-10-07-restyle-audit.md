# Doctor Portal — restyle audit against the central design system
Date: 2026-10-07 · Auditor: Claude · Status: DRAFT for ChatGPT review
Scope: index.html (620 lines), styles.css (1,599), app.js (1,225). Rubric: `design-system/RULES.md` §2 and §5.
Out of scope: flow, 50s valid-call gate, CTA routing — [LOCKED], do not change.

## 1. Headline numbers
| Check | Found | Rule |
|---|---|---|
| Hex colours in CSS | 89 (40 unique) + 59 rgba() | none allowed |
| Hex colours in JS/HTML | 34 in JS (medicine icons), 5 in HTML (logo, ghost border) | none allowed |
| Font | system stack (+ Georgia on Rx) | Plus Jakarta Sans only |
| Font sizes | 12 sizes, 9px–28px | SALT scale (10–36) |
| Border radii | 14 distinct values (2/4/5/6/7/8/9/10/14/20/50%) | 8/12/16/24/full |
| Box-shadows | 18 ad-hoc | 6 shadow tokens |
| Emoji / symbol glyphs as icons | 30 in HTML, 15 in JS | zero |
| Icon system | 3 filled Material SVGs in `ICONS` + 5 multicolour medicine SVGs | Tabler outline, mono |
| Inline `style=` | 22 in HTML, 38 in JS | tokens/classes only |
| Primary colour | #1B69DE | #266CE1 via token |

## 2. Findings by area
Severity: H = visible mismatch, M = inconsistent, L = tidy.

### A. Foundation (do once, fixes most)
1. H — Replace `:root` token block in styles.css with `truemeds.css` link; delete `--primary/--success/...` aliases. Map: bg → `--tm-surface-secondary`; surface → `--tm-surface-primary`; text → `--tm-content-primary/secondary/tertiary`; borders → `--tm-border-*`.
2. H — Add `<body class="tm">`, link `truemeds.css` + `icons.js`; drop `ICONS` map and `initIcons()` in app.js.
3. H — Font to Plus Jakarta Sans; remove Georgia from `.rx-*` (see decision D3).
4. M — Type scale: collapse 12 sizes into `.tm-text-*`. 9–11px labels (section labels, demo bar, badges) move to `body-xs` (10) minimum.
5. M — Radii/shadows → tokens.

### B. Components → SALT equivalents
| Current | Replace with |
|---|---|
| `.btn .btn-lg/md/sm` + `primary/success/danger/calling/ghost/text` | `.tm-btn` `--lg/default/--sm`; `--primary/--secondary/--tertiary/--ghost/--link/--destructive`. Sizes 56/48/40 (current sm is 42). |
| `.btn-success` on "Prescribe", "Confirm Callback", "Retry Call", "Next Order" | Brand primary (one primary per context). Green only as done-state. See D5. |
| `.chip`, `.man-btn`, `.qty-btn` | `.tm-chip` with `aria-pressed`; M-A-N and qty need a decision (D8, D9) |
| `.med-status-badge`, `.badge-cat4/pilot/ha-*` | `.tm-tag` + `--info/--success/--warning/--critical/--dark`. See D6. |
| `.medicine-item` | `.tm-row` |
| `.bottom-sheet` + `#sheet-overlay` | `.tm-sheet` over `.tm-overlay` (top radius 24) |
| `.sheet-input`, `.notes-textarea` | `.tm-field` (label, control, helper) |
| `#toast`, `#success-toast` | `.tm-toast` (one line). Success toast has a Next Order button — see D7. |
| `#portal-header`, `#compact-strip` | `.tm-appbar` |
| Sticky CTA zone (`#action-zone`) | `.tm-actionbar` pinned bottom. See D4. |
| `.side-panel-card` | `.tm-card--flat`; and see D1 |
| HA warning banner, briefing strip | `.tm-notice` (`--warning`) |
| Profile sheet menu | `.tm-row` list |

### C. Icons & emoji (all must go)
- Header logo: hand-drawn two-colour SVG (#1B69DE + #16a34a). No logo file exists in SALT export → D2.
- Emoji used as UI: ⚡ ⏩ ⏱ 📵 🔇 ❌ 📞 📋 📖 🚪 ⚠️ ✅ 📡 📦 🔴 🚫 ⓘ ✓ ✗ ✕ → Tabler: `bolt, player-track-next, clock, phone-off, volume-off, x, phone, clipboard-text, book, logout, alert-triangle, check, info-circle, circle-x`. Check each exists in `icons/icons.txt`; add missing via build.
- Medicine form thumbnails (tablet/capsule/injection/syrup/drops/…): 5+ multicolour illustrations, 34 hex values. → D4b.
- Unavailable sheet: 40px 📵 emoji → `phone-off` icon, mono.
- Rx full-screen close/zoom/rotate glyphs (✕ − + ↻ ⊡) → Tabler `x, minus, plus, rotate-clockwise, arrows-minimize`.

### D. Layout / structure
1. M — Mobile column max 430px centred with a desktop side panel duplicating the CTA/state. Fine as a prototype scaffold but not a Truemeds pattern → D1.
2. M — Demo bar and side-panel scenario controls are dev tools styled like product. Move to a collapsed "Demo" tray, neutral, behind a toggle (`.tm-card--flat`), so screenshots look like product → D3b.
3. M — Call Patient button sits mid-scroll in `#action-zone`; handoff wants it pinned bottom (`.tm-actionbar`). Locked rules unaffected.
4. L — 22 + 38 inline styles: move into classes or delete.

### E. Rx viewer
- Dark full-screen viewer (intentional for readability) uses its own palette; keep dark but build from `--tm-overlay-*` + white text tokens.
- The dummy prescription paper (Georgia, stamp, ℞) is a fictional document, not UI → exempt from tokens (D3).

## 3. Proposed restyle order (Claude owns A–C; ChatGPT reviews)
1. Wiring: link CSS/JS, `body.tm`, kill `:root`, font. App should still run unstyled-correct.
2. Buttons + chips + tags + icons (global swap; fixes 60% of mismatch).
3. App bar, medicine rows, patient block, briefing.
4. Sheets (callback, skip HA, edit med, disable, add med, retry, unavailable, profile).
5. Action bar + toast.
6. Demo tray, side panel, Rx viewer.
7. Checklist pass (RULES §5) + screenshots at 390px and 1280px.

## 4. Product decisions needed
See the decision list sent to Apurva (D1–D12). Nothing in sections 2–3 should be built on those items until answered.

## 5. Icons to add to the design system before restyle
Not yet in `icons/icons.txt`: bolt, player-track-next, volume-off, clipboard-text, book, rotate-clockwise, arrows-minimize, vaccine, bottle, droplet, user-circle. Add via `icons.txt` → `node scripts/build-icons.mjs` (needs `npm i @tabler/icons`).
