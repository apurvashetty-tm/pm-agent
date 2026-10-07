# Truemeds Design System — Rules for building any UI

Read this before writing or changing any screen, prototype, mockup or page in this workspace.
It applies to every project: doctor portal, portal enhancements, internal tools, consumer flows.

**Source of truth:** SALT — "TRUEMEDS Design Library (App)" in Figma
(`figma.com/design/DcOIxZidim4Opva4DaDDRO`). This folder is a code copy of it. If SALT and this folder disagree, SALT wins: re-export and rebuild (see README).

---

## 1. How to use it

Link two files. Never copy values out of them.

```html
<link rel="stylesheet" href="../../design-system/truemeds.css">
<script src="../../design-system/icons/icons.js"></script>
<body class="tm"> …
```

(Adjust the relative path to your project's depth.)

- Colours, spacing, radius, shadows: `var(--tm-…)` semantic tokens only.
- Text: `.tm-text-*` classes (or the matching `--tm-font-size-*` / `--tm-font-lineheight-*` tokens).
- Components: `.tm-btn`, `.tm-field`, `.tm-chip`, `.tm-tag`, `.tm-card`, `.tm-row`, `.tm-notice`, `.tm-toast`, `.tm-sheet`, `.tm-appbar`, `.tm-actionbar`, `.tm-check`, `.tm-toggle`.
- Icons: `<span class="tm-icon" data-icon="phone"></span>`.
- See every token and component rendered in `preview.html`.

## 2. Hard rules

1. **No raw values.** No hex codes, no `rgb()`, no ad-hoc px for colour, radius, spacing or shadow in project code. If a value isn't a token, it isn't allowed.
2. **Semantic tokens only.** Use `--tm-content-*`, `--tm-surface-*`, `--tm-border-*`, `--tm-feedback-*`, `--tm-space-*`, `--tm-radius-*`. Never use `--tm-core-*` (the raw palette) in a project.
3. **One font:** Plus Jakarta Sans (comes with `truemeds.css`). No system-font stacks, no second typeface.
4. **One icon set:** Tabler outline via `icons.js`. Icons are monochrome and inherit text colour (default `--tm-content-secondary` or `--tm-content-primary`). **No emoji in UI.** No illustrated, multicolour or 3D icons. Product images are real photos (`.tm-thumb`), never illustrations.
5. **Colour means state, never decoration.**
   - Brand blue (`--tm-content-brand`, `--tm-surface-brand-*`) = the main action and selection.
   - Green (`success`) = done / saved. Amber (`warning`) = needs attention. Red (`error`) = failed / destructive.
   - Everything else is neutral grey and white.
6. **One primary button per context.** Other actions step down: secondary → tertiary → ghost → link.
7. **Use what exists.** Need something new? Check `preview.html` and SALT first. If it truly isn't there, add it to `src/components.css` marked `[PROPOSED]` (built from tokens only) — never inside a project.
8. **Logo: use the official files in `design-system/logo/`; never redraw, recolour, stretch or hotlink them.** `truemeds-logo.svg` is the full logo (icon + wordmark) from the truemeds.in nav (110x26 viewBox; render at 130x31 in headers) and is the primary logo. `truemeds-icon.svg` is the icon-only mark (70x70) from the Truemeds-LOGO Figma file (https://www.figma.com/design/nD1pPa1SMzuZKnJIZxCdKa/Truemeds-LOGO) for favicons, avatars and tight spaces. Reference with `<img src="…/design-system/logo/<file>.svg" alt="Truemeds">`. New variants are added to `logo/` only as unmodified exports. **Known mismatch:** the Figma file uses blue `#0071BC`, the nav logo uses brand blue `#1B69DE` (green `#22B573` matches); design team to confirm which blue is current.

## 3. Choosing components

| Need | Use |
|---|---|
| The one main action | `.tm-btn.tm-btn--primary` (`--block` for full width on mobile) |
| Secondary action | `.tm-btn--secondary` (brand text, border) or `--tertiary` (grey text) |
| Quiet / inline action | `.tm-btn--ghost` or `.tm-btn--link` |
| Destructive (stop, remove, end) | `.tm-btn--destructive` |
| Status label (Pending, Prescribed…) | `.tm-tag` + `--info / --success / --warning / --critical / --dark` |
| Filter or pick-one options | `.tm-chip` with `aria-pressed` |
| Text entry | `.tm-field` (label, control, helper; `--error / --success / --disabled`) |
| Grouped content | `.tm-card` (default shadow) or `--flat` / `--tint` |
| Item lists (medicines, orders) | `.tm-row` with `.tm-thumb` |
| Inline message | `.tm-notice` (`--warning`, `--error`) |
| Brief confirmation | `.tm-toast` — bottom centre, one line |
| Mobile choice / detail panel | `.tm-sheet` over `.tm-overlay` |
| Mobile sticky action | `.tm-actionbar` |

Button sizes: `--lg` 56px (hero, one per screen), default 48px, `--sm` 40px, `--xs` 32px.

## 4. Mobile vs web / internal tools

SALT is built for the app. Use it as-is for mobile screens.

For **portals, desktop and internal tools**, use the same tokens and components plus:

- Web headings: `.tm-text-h1-web` (36/48), `.tm-text-h2-web` (32/40), `.tm-text-h3-web` (20/28) — these are in SALT.
- The **[PROPOSED] internal-tools layer** in `truemeds.css`: `.tm-page`, `.tm-grid`, `.tm-stack`, `.tm-sidenav`, `.tm-table`, `.tm-stat`. These are not in SALT yet; they are built from SALT tokens and pending design-team review.
- Internal tools are **denser and calmer** than the consumer app: body `md`/`sm` text, `.tm-card--flat` over shadows for dense layouts, tags instead of coloured backgrounds, no promotional elements (offer banners, savings strips, illustrations).

## 5. Design review checklist

Run before calling any UI task done. Every answer must be "yes".

- [ ] Only `truemeds.css` tokens/components — no hex, no raw px for colour/radius/spacing/shadow?
- [ ] Plus Jakarta Sans only?
- [ ] All icons from `icons.js`, monochrome? Zero emoji?
- [ ] Colour used only for state (brand = action/selection, green/amber/red = status)?
- [ ] Exactly one primary button visible per context?
- [ ] Status shown with `.tm-tag`, not custom pills?
- [ ] No cards nested inside cards?
- [ ] Anything new marked `[PROPOSED]` in the design system, not invented in the project?
- [ ] Checked against `preview.html` side by side?

## 6. Known gaps (open with design team)

- SALT has two generations of variables. The new set (`Colour/…`, brand `#266CE1`) is what this folder uses. Some components still reference the older `tm_semantic_*` set (brand `#1B69DE`, which truemeds.in also uses). Design team is aware.
- SALT's Font page lists "SF Pro Display" as the typeface; variables, components and truemeds.in all use Plus Jakarta Sans. We use Plus Jakarta Sans.
- "Heading XL" on the Font page is 32px on a 28px line height — looks like a typo, so it is left out.
- No web/desktop library yet; the internal-tools layer above fills the gap until one exists.
