# Truemeds Design System

The shared visual system for every Truemeds frontend: prototypes, internal portals, internal tools and consumer flows. It is a faithful copy of **SALT**, the TRUEMEDS Design Library (App) in Figma, plus a small internal-tools layer for portals and desktop screens.

Calm, clinical and trustworthy. White surfaces, one confident blue for action, and colour that only ever means something.

## Where things come from

- **Colour, spacing, radius, type scale:** SALT's variable export (Core + Default collections). Semantic tokens point at the Core palette.
- **Shadows and text styles:** copied from SALT's Shadow and Font pages (Figma does not export them).
- **Components:** SALT atoms and molecules (Buttons 2.0, Input Fields, Chips, Toasts, Checkboxes, Toggles, Dividers, cards and list items).
- **Icons:** Tabler, outline style. SALT's Icons page is the Tabler set, same names.
- **Internal-tools layer:** page grid, side navigation, data table, KPI tile. **Proposed, not in SALT**, built only from SALT tokens.

The code copy lives in the pm-agent workspace at `design-system/` (`truemeds.css`, `icons/icons.js`, `RULES.md`). This page is generated from the same files.

## Content fundamentals

- Say what happened or what to do, in plain words: "Call failed. Try again or schedule a callback."
- Labels are short nouns ("Order ID", "Doctor notes"); buttons are short verbs ("Call patient", "Confirm order").
- Use Truemeds' own terms exactly as the business uses them (attempted, connected, Cat4, Pilot, HA).
- Toasts fit on one line. Helper text is one sentence.
- No emoji anywhere in the interface.

## Visual foundations

### Colour means state, never decoration

| Meaning | Tokens |
|---|---|
| Text | `tm-content-primary` (main), `tm-content-secondary` (supporting), `tm-content-tertiary` (hints and placeholders only) |
| Backgrounds | `tm-surface-primary` (cards, sheets), `tm-surface-secondary` (page), `tm-surface-tertiary` (quiet fills) |
| Action and selection | `tm-surface-brand-default`, `tm-content-brand`, `tm-border-selected`, `tm-surface-brand-subtle` |
| Done / saved | `tm-content-success`, `tm-surface-success-subtle` |
| Needs attention | `tm-content-warning`, `tm-surface-warning-subtle`, `tm-feedback-warning-*` |
| Failed / destructive | `tm-content-error`, `tm-surface-error-subtle`, `tm-feedback-error-*` |
| Lines | `tm-border-subtle` (dividers), `tm-border-default` (inputs, outlined buttons), `tm-border-focus` |

Never use a `tm-core-*` palette step directly. Purple (`tm-content-accent`, `tm-surface-accent-*`) is a marketing accent; internal tools don't use it.

### Type

One family: **Plus Jakarta Sans**. Mobile screens use `tm-text-h1`…`h3` (20/18/16); portals and desktop use `tm-text-h1-web`…`h3-web` (36/32/20). Body runs from `tm-text-body-xl` (18) to `tm-text-body-xs` (10), each in regular and `-strong` (semibold). Buttons have their own four styles.

### Space, shape, depth

- Spacing steps: 2, 4, 8, 12, 16, 24, 32, 48 (`tm-space-2xs` … `tm-space-3xl`). Card padding is `tm-space-lg` (16); page gutters `tm-space-xl` (24).
- Radius: buttons and cards `tm-radius-lg` (16); small buttons and inputs `tm-radius-md` (12); thumbnails `tm-radius-sm` (8); chips and tags `tm-radius-full`; bottom sheets `tm-radius-2xl` (24) on top corners.
- Depth is soft: cards use `tm-shadow-card` (5% black, 17px blur); sticky headers `tm-shadow-header`; floating action bars `tm-shadow-primary` (blue-tinted). No other shadows.
- No cards inside cards. Group with spacing and a `tm-border-subtle` divider instead.

## Iconography

- **Tabler outline only**, 24px grid, 2px stroke, round caps. At 16–20px that renders as the thin line SALT uses.
- Icons are **monochrome** and inherit the text colour: `tm-content-secondary` by default, `tm-content-primary` next to strong text, brand or status colour only when the icon *is* the state.
- No emoji, no multicolour or 3D icons, no illustrations in working screens. Products are shown with real photos.
- In code: `<span class="tm-icon" data-icon="phone"></span>` with `icons/icons.js`. Browse the bundled set under Assets → Icons.

## Rules for building

1. Link the system; never copy values out of it. No hex codes, other fonts or other icon sets in a project.
2. One primary button per context. Others step down: secondary → tertiary → ghost → link.
3. Status is a tag (`tm-tag`), not a custom pill or a coloured background.
4. Missing something? Add it to the system marked **Proposed**, not inside a project.
5. Run the design review checklist (in `RULES.md`) before calling UI work done.

## Accessibility notes

- `tm-content-primary` (11.3:1) and `tm-content-secondary` (6.2:1) pass on white. Brand blue on white and white on brand are 4.9:1.
- `tm-content-tertiary` on white is 3.0:1: hints and placeholders only, never information the user needs.
- SALT's success tag (`tm-content-success` on `tm-surface-success-subtle`) is 4.0:1, below 4.5:1 at tag size. Kept as SALT defines it; flagged to the design team.

## Not synced

- SALT has an older variable set (`tm_semantic_*`, brand `#1B69DE`, also used on truemeds.in) still referenced by some components. This system follows the newer export (brand `#266CE1`). The design team is aware.
- SALT's Font page lists "SF Pro Display"; variables, components and truemeds.in use Plus Jakarta Sans, so this system does.
- "Heading XL" (32px on a 28px line) is left out as a likely typo.
- No dark theme exists in SALT.
- No Truemeds logo file was available; the cover uses type only.
- Molecules beyond the core set (product cards, order tracker, bill details, payment components) are not built here yet.
