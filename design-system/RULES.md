# Truemeds Design System — Rules for building any UI

Read this before writing or changing any screen, prototype, mockup or page in this workspace.
It applies to every project: doctor portal, portal enhancements, internal tools, consumer flows.

**Source of truth: this folder.** It was built from SALT — the "TRUEMEDS Design Library (App)" Figma file from the design team (`figma.com/design/DcOIxZidim4Opva4DaDDRO`) — and extends it with Truemeds decisions listed in `beyond-salt.md`. When the design team sends an updated SALT file, merge it in deliberately (see README); it never overwrites anything in `beyond-salt.md` or `tokens/truemeds.json`. Changes to the design system are approved by Apurva.

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
4. **One icon set:** Tabler outline via `icons.js`. Icons are monochrome and inherit text colour (default `--tm-content-secondary` or `--tm-content-primary`). **No emoji in UI.** No illustrated, multicolour or 3D icons (no shading, gradients or rendered depth; a one-colour line drawing of an object at an angle, like the `tablet` glyph, is fine). Glyphs Tabler lacks are drawn on its grid in `scripts/build-icons.mjs`, marked [PROPOSED]. Product images are real photos (`.tm-thumb`), never illustrations.
5. **Colour means state, never decoration.**
   - Brand blue (`--tm-content-brand`, `--tm-surface-brand-*`) = the main action and selection.
   - Green (`success`) = done / saved. Amber (`warning`) = needs attention. Red (`error`) = failed / destructive.
   - Everything else is neutral grey and white.
6. **One primary button per context.** Other actions use the button roles in §9.1: secondary → quiet (and destructive where something is removed or closed for good).
7. **Use what exists.** Need something new? Check `preview.html` and SALT first. If it truly isn't there, add it to `src/components.css` marked `[PROPOSED]` (built from tokens only) — never inside a project.
8. **Logo: LOCKED. Use the official files in `design-system/logo/`; never redraw, recolour, stretch, crop or hotlink them.** `truemeds-logo.svg` is the full logo (icon + wordmark, 110x26 viewBox, render at 130x31 in headers) and is the primary logo; Product-specific lockups (for example the Doctor app's "truemeds for doctors") are NOT design-system files: they live in their own project (`projects/<project>/brand/`), must embed `truemeds-logo.svg` unchanged, and carry their own lock check. `truemeds-icon.svg` is the icon-only mark (70x70, shape from the Truemeds-LOGO Figma file, https://www.figma.com/design/nD1pPa1SMzuZKnJIZxCdKa/Truemeds-LOGO) for favicons, avatars and tight spaces. **Colours are fixed: logo blue `#1B69DE` and logo green `#22B573`, in every logo file.** (The Figma file's older blue `#0071BC` is not used.) These are logo colours only; UI colour still comes from tokens (`--tm-content-brand` is blue-600 `#1D5DCF`, see `beyond-salt.md`). Reference with `<img src="…/design-system/logo/<file>.svg" alt="Truemeds">`. Lock: `logo/logo.lock.json` holds each file's sha256; `python3 design-system/scripts/check_logo.py` must pass before any commit that touches `logo/`. Changing a logo needs explicit approval from Apurva / the design team, then `check_logo.py --update`.

## 3. Choosing components

| Need | Use |
|---|---|
| The one main action | `.tm-btn.tm-btn--primary` (`--block` for full width on mobile) |
| Secondary action | `.tm-btn--secondary` (white, grey border, brand text, subtle shadow — as SALT) — §9.1 |
| Leave / cancel / dismiss | `.tm-btn--quiet` (grey text, no border) — §9.1. Tertiary, ghost and link-styled buttons are retired into Quiet. |
| Link inside a sentence | `.tm-btn--link` / plain link, brand colour |
| Destructive (remove or close for good) | `.tm-btn--destructive` (red border and text, never solid) — §9.1 |
| End a live call | `.tm-btn--call-end` (solid red) — only this use — §9.1 |
| Status label (Pending, Prescribed…) | `.tm-tag` + `--info / --success / --warning / --critical / --dark` |
| Filter or pick-one options | `.tm-chip` with `aria-pressed` |
| Text entry | `.tm-field` (label, control, helper; `--error / --success / --disabled`) |
| Grouped content | `.tm-card` (default shadow) or `--flat` / `--tint` |
| Item lists (medicines, orders) | `.tm-row` with `.tm-thumb` |
| Inline message | `.tm-notice` (`--warning`, `--error`) |
| Brief confirmation with nowhere else to show it | `.tm-toast` — dark, one line (two at most), above the bottom bar — §9.5 |
| Outcome of a task (e.g. case completed) | Status card — §9.3 |
| Mobile choice / detail panel | `.tm-sheet` over `.tm-overlay`, one template — §9.4 |
| Mobile sticky action | `.tm-actionbar` — white, hairline top edge + upward shadow so it separates from white cards (D-62). Only where content scrolls under the buttons; a footer that sits on a fixed panel (sign-in, OTP, unlock, offer) keeps the panel and needs no edge |

Button sizes: `--lg` 56px for every full-width action button in a group (bar, sheet, form), default 48px for compact inline buttons. `--sm` 40px and `--xs` 32px are **not used for anything tappable on mobile** (below the 48px minimum, §8.6). Details in §9.1.

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
- [ ] Four text levels only, from §8.1?
- [ ] One side margin and only the three gaps from §8.3?
- [ ] Main button placed per §8.4 (inline on typing screens, pinned otherwise)?
- [ ] All text passes AA contrast on its actual background (§8.7)?
- [ ] Buttons use the four roles and one height per group (§9.1)? Every tap target at least 48px (§8.6)?
- [ ] Chips wrap instead of squeezing; grids use one chip size per screen (§9.2)?
- [ ] Every sheet follows the one template (§9.4)? Toasts only where nothing on screen can show the result (§9.5)?
- [ ] Every state in §9.6 that applies is designed and rendered (loading, empty, failed, offline, busy, outcome, disabled, read-only, long content)?
- [ ] Sentence case, formats and accessibility per §9.7–9.8?

## 6. Known gaps (open with design team)

- SALT has two generations of variables. This folder uses the new set (`Colour/…`): brand surfaces blue-500 `#266CE1`, brand **text** blue-600 `#1D5DCF` (Truemeds override for AA, `beyond-salt.md`). Some SALT components still reference the older `tm_semantic_*` set (brand `#1B69DE`, which truemeds.in also uses). Design team is aware; a side-by-side check against the Figma library is pending — do not claim full SALT parity until then.
- SALT's Font page lists "SF Pro Display" as the typeface; variables, components and truemeds.in all use Plus Jakarta Sans. We use Plus Jakarta Sans.
- "Heading XL" on the Font page is 32px on a 28px line height — looks like a typo, so it is left out.
- No web/desktop library yet; the internal-tools layer above fills the gap until one exists.

**Backlog — not in the system yet (2026-10-15):**
- **Data table behaviour** for portals: sorting, filters, pagination, row selection and actions, loading / empty / error, long values, narrow layouts, keyboard and screen-reader behaviour.
- **Workflow patterns** (prescription review, substitute comparison, payment retry, refund timeline, hand-off / escalation): built first in the product project that needs them; moved here only when a second product needs the same pattern.
- **Deprecated classes** `.tm-btn--tertiary`, `.tm-btn--ghost` (aliases of quiet): remove once every project has migrated to the §9.1 roles.

## 7. Phone-frame prototypes (layout rule — do not re-litigate)

Mobile-first prototypes are previewed on desktop as a **9:16 phone frame**, never as a stretched page, a narrow column glued to the window, or a dialog layout.

1. **Below 768px** the app *is* the screen: the window scrolls and overlays are viewport-fixed.
2. **At 768px and up** the app sits in a centred 9:16 frame: `height: clamp(640px, 100vh - 48px, 800px)`, `width: height × 9/16`, rounded border, `overflow: hidden`, `transform: translateZ(0)`.
3. **One scroll area** inside the frame (the content region). The header is pinned above it. The page behind never scrolls because of the frame, and no side panel may be a scroll container.
4. **Overlays live inside the frame.** Bottom sheets, full-screen viewers, toasts and snackbars are DOM children of the frame (the transform makes `position: fixed` anchor to it). Bottom sheets keep the mobile bottom-sheet behaviour at every width; they are never turned into centred dialogs on desktop.
5. **Demo/dev panels** float beside the frame (absolutely positioned) and never change its size or centring.
6. Desktop overrides go in one block at the END of the stylesheet so they beat the mobile rules.
7. Check before every commit that touches layout: `python3 projects/<project>/docs/layout_check.py` must say ALL PASS (frame 9:16, wheel scroll works, sheet at frame bottom, Rx viewer fills frame, no page errors).

## 8. Mobile screen layout  [ADDED 2026-10-14 · layout v2 · D-42–D-45]

1. **Type scale — four levels per screen.**

   | Level | Use | Style |
   |---|---|---|
   | L1 | Screen title | `.tm-text-title-lg` 32/40 semibold |
   | L2 | Key content (values, names, the thing acted on) | `.tm-text-body-lg` 16/24 (or `-strong` where emphasis matters) |
   | L3 | Supporting text (descriptions, helper, status lines) | `.tm-text-body-md` 14/20, `--tm-content-secondary` |
   | L4 | Fine print (consent, legal) | `.tm-text-body-sm` 12/16, `--tm-content-secondary` |

   Only the screen title is large; buttons keep their design-system style. Don't introduce in-between sizes.
   **Small sizes:** 9–11px text tokens are never used in apps. 12px only for tags and L4 fine print. Anything the user needs to act on (clinical details, amounts, status, errors) is 14px or larger.
   The type scale applies to screen text. Component internals (OTP digits, button labels, keyboard) keep their component specs.
2. **Side margin:** `--tm-space-xl` (24) on every mobile screen. Every block — fields, notices, cards, code boxes, buttons — shares the same left and right edges.
3. **Three gaps only:** tight `--tm-space-sm` (8): label↔field, field↔helper · related `--tm-space-lg` (16): items within a group · section `--tm-space-2xl` (32): between groups. Spare vertical space goes between the content and a pinned button, never inside a group.
   Home-base screens use 3xl (48) as the hero gap between logo and title.
4. **Main button placement:**
   - **Screens with text entry:** the primary button sits inline directly under the content, so it stays visible above the keyboard without moving.
   - **Screens without text entry:** the primary button is pinned to the bottom with the safe-area inset; a secondary/quiet action sits below it.
5. **Header types** (each product decides which screens use which):
   - **Home-base header:** product logo/lockup left, icon actions right.
   - **Task header:** Back + screen title, no logo. **Back only where there is a previous screen** to return to; screens that open a journey (e.g. a launch screen, a post-sign-in offer) have none. Two sizes:
     - **Hero** — tall tinted band, title `.tm-text-title-lg` 32/40. For short step screens with little content.
     - **Compact** — short sticky tinted band, title `.tm-text-h1` 20/28, meta lines under it. For dense work screens. Never changes height while scrolling. When Back is hidden, the title and meta move to the left margin. Long titles wrap to at most two lines; the height is set per screen, never while scrolling.  [ENHANCED 2026-10-15]
   - **Edit screen header** [ADDED 2026-10-15] — for a full-screen editor opened over a page (e.g. Prescribe). White bar: ✕ on the left (closes; asks before discarding unsaved changes), title 20/28 with an optional one-line subtitle, at most one action on the right (destructive outline if it removes something). A pinned summary band may sit directly under it.
   - **Viewer header** [ADDED 2026-10-15] — for full-screen viewers (e.g. a prescription image). Dark bar: ✕, title, tools (zoom, rotate, fit) using `.tm-btn--on-dark`. The title never overlaps the tools; it truncates first.
6. **Tap targets:** **48px minimum** for everything tappable that is not a link inside a sentence: icon buttons (✕, ?, Back, zoom), buttons, chips, rows, toggles, standalone links. Enlarge the hit area, not the text. Meets Android (48dp) and iOS (44pt); WCAG 2.5.8's floor is 24px. Links inside a sentence follow WCAG 2.5.8's inline exception.  [CHANGED 2026-10-15, was 44]
7. **Contrast:** all text meets WCAG AA (4.5:1; 3:1 for 24px+ or 18.66px+ bold) on the surface it sits on, including tinted bands and notices. Blue means "tap me" (§2.5): links are always `--tm-content-brand`, never grey-and-underlined. Disabled controls are exempt from the contrast rule (WCAG 1.4.3) and keep the design-system disabled style.
8. **Loading primary:** brand-blue fill, white label and white spinner (`.tm-btn--busy` with `.tm-spinner`) on every screen. Never grey, pale or disabled-looking.
9. **Keyboard clearance:** keep at least 16px between the inline main button and an open keyboard. If the content does not fit, the content scrolls.
10. **Titles:** no full stop at the end of a screen title. Titles wrap balanced (L8).
11. **Decorative icons** (bullets, list markers) are neutral (`--tm-content-secondary`); brand blue is for actions and selection only (§2.5). An icon tile used as a screen's hero may stay brand-tinted.
12. **Value display:** a large status value (e.g. time remaining) is a component, not screen text: 32/40 semibold, fixed-width digits (L9). Like OTP digits, it sits outside the four-level type scale.

### Locked specs (D-46, D-47) — set once in the design system, never per screen

These are fixed. A change needs Apurva's approval and an update to D-46. `ui-screens/feedback/check-locked-specs.py` fails the build if any of them is violated.

| ID | Spec |
|---|---|
| L1 | OTP code boxes (`.tm-otp-slots`): square 56×56 slots, 24px digits, one tight centred group, gap 8 (`--tm-space-sm`). Never stretched, never 16px digits. |
| L2 | Loading primary buttons: brand-blue fill, white label, white spinner, on every screen (sign-in "Sending OTP", OTP "Verifying", any future loading primary). |
| L3 | OTP keyboard stays open during "Verifying" (D-44). Only locked and expired-and-resend-limited close it. |
| L4 | Field helper and field error text: 14/20 (`.tm-field__helper`). |
| L5 | Notice text (`.tm-notice`): 14/20. |
| L6 | Sign-in logo-to-title gap: 48 (`--tm-space-3xl`), home-base hero gap. |
| L7 | Field helper/error text aligns with its field: left under full-width fields, centred under the centred OTP code boxes (D-47). |
| L8 | Screen titles wrap balanced — never a single word alone on the last line (D-47). |
| L9 | Value display (e.g. Home time remaining): 32/40 semibold, fixed-width digits (D-47). |

## 9. Components and states  [ADDED 2026-10-15 · design-system review · checked against Material 3, Apple HIG, WCAG 2.2]

Set once in the design system; a project never restyles them. Where `src/components.css` does not yet match a rule below, the rule wins and the component is updated centrally (tracked in `beyond-salt.md`).

### 9.1 Buttons
| Role | Look | Use for |
|---|---|---|
| **Primary** | Solid brand blue, white label | The one action that moves the flow forward. One per screen or sheet. |
| **Secondary** | White, grey border (`--tm-border-default`), brand label, subtle shadow (`--tm-shadow-button-secondary`) — as SALT | A real alternative action, less likely than the primary. |
| **Quiet** | Grey text, no border | Leave, cancel, dismiss, "not now", "back to …". |
| **Destructive** | White, red border and label — never solid | Removes or closes something for good (disable, mark unavailable). Never the primary role (Apple HIG). |
| **Call end** (special) | Solid red, white label | Only for ending a live call (the phone convention). Nothing else uses it. |

- **One height per group** — differ by style, not size (Apple HIG). Full-width action buttons in a pinned bar, sheet or form: **56px, 18 semibold**, whatever their role. Compact inline buttons (e.g. "View Rx" in a content row): **48px, 16 semibold**.
- **Icons on buttons (2026-10-24):** primary and secondary buttons carry an icon only when it helps the user recognise the action at a glance — calling, scheduling, viewing, skipping, direction (→ next). No icon when the label must be read: confirming, finalising, releasing, and answers to a question. Quiet buttons never have icons. One icon per button, from `icons.js`, before the label (direction arrows after). **Scope:** labelled buttons only — header icons, the close ×, status and notice icons are not buttons and are not covered; adding time ("Add time" with a plus) counts as scheduling.
- **Order, top to bottom:** primary → secondary → quiet. Two secondaries may sit side by side (equal width, label fits on one line at 360px wide with room to spare; otherwise shorten the label or stack). (D-54)
- **Icons in buttons:** only when they add meaning (e.g. a phone on "Call patient"). On a side-by-side pair, **both buttons or neither** carry an icon (D-54).
- **Labels:** verb first, sentence case, no full stop, never "Click" / "Tap".
- **States:** pressed; disabled (design-system disabled style, exempt from contrast); busy (L2). A quiet action in progress shows text only ("Ending…"), no spinner. **Busy labels always end with "…"** ("Verifying…", "Sending OTP…") (D-54).
- Links inside a sentence stay links (brand colour), not buttons.

### 9.2 Chips and choice grids
- **Free-flowing chips** (e.g. frequency, food timing, date): fixed padding and font, width hugs the label, **wrap to the next row** when they don't fit. Never squeeze, clip or shrink text.
- **Grid chips** (e.g. dose per time of day, extra doses, time slots): equal-width columns on a 4-column grid. **Every grid on one screen uses the same chip size**; a row with fewer options leaves cells empty (left-aligned) instead of stretching. **A grid starts at its label's left edge**; only a grid with row labels (M / A / N) sits after the label column (D-54). **One chip size per screen:** grids without row labels use the same column width as the M / A / N grid and leave the extra space on the right. Grid chips have 8px side padding — the column sets the size. **Words are free chips, numbers are grid chips:** units (Days / Weeks / Months / Ongoing), frequencies and food timing wrap as free chips; doses, counts and time slots sit in grids (D-54).
- Selected = brand tint + brand border (`aria-pressed`). 48px minimum height.

### 9.3 Lists, tags and cards
- **Rows:** thumb · title · meta · trailing. A **chevron** only when the row opens something. **Row with a status:** title on line 1 (full width); line 2 = one short fact on the left (14/20 semibold, e.g. "Qty 30") and the status tag on the right (`.tm-row__line`, D-54). Details that belong to an edit screen (dose, duration) are not repeated in the row. **Read-only rows** (e.g. a closed task): muted text, no chevron, not tappable, still readable.
- **Status tags:** colour by meaning — done = success, needs action = warning, removed / inactive = neutral, failed = critical. **Reserve the tag width** so the row text never re-wraps when the status changes. Tag text meets AA.
- **Cards:** one level only, never a card inside a card.
- **Status card** (outcome of a task): icon + title (optional one line under it), stays on screen. Not a toast. **Tinted by outcome** (decided D-62, 2026-10-25): `--success` (confirmed, transferred, forwarded — success tint, tick), `--neutral` (pending or no outcome — grey tint, clock / phone-off / info icon), `--warning` (completed with a problem the user must act on — amber tint, warning icon). A plain white status card is not used: the outcome must not look like another content card. **Edge, not shadow** (2026-10-25, option C5): every tone has a 1px edge in its colour (success green-300, neutral grey-200, warning amber-700) and no drop shadow, so it reads as a result, not as a tappable card. Neutral keeps the grey-100 fill.
- **Empty state:** `.tm-empty`.

### 9.4 Bottom sheets — one template
| Part | Rule |
|---|---|
| Background | Page dimmed behind the sheet (`.tm-overlay`). |
| Top | Rounded top corners; **no drag handle** (the ✕ is always there). |
| Header | Title 20/28 semibold, left · ✕ right (48px target) · **no divider**. Optional one-line subtitle (L3). |
| Spacing | 24px side margins (same as screens) · 16px header → content · 24px + safe area at the bottom. |
| Content | Fields, chips, or **option rows** (one shared style for reason lists: title + one-line description, full width, 48px+; tapping applies). |
| Actions | §9.1 order and size (56px, full width). Reason lists need no button. **Confirmation sheet** ("Leave this case?", "Discard changes?"): the action the sheet asks about on top — red outline if it can't easily be undone, primary otherwise — and the "stay" option as quiet text below. A sheet offering two real actions (e.g. Retry call / Mark as unavailable) is a choice, not a confirmation (D-54). |
| Closing | ✕, tap outside or swipe down = cancel — **except while an action is in progress**. Unsaved input asks before closing. |
| Size | Up to 85% of the screen height; the content scrolls, header and actions stay. Max width 640px on desktop. |

### 9.5 Feedback
| Surface | Rule |
|---|---|
| **Field error** | Under the field (L4, L7). |
| **Notice** | In the page; stays until the cause is gone. Neutral / warning / error (L5). **Warning** when something blocks the main action or runs on a timer (offline, locks, near expiry); **error** when an action failed; **neutral** only for side information (D-54). |
| **Status card** | The outcome of a task (§9.3). |
| **Toast** | **Dark** (inverse surface — the platform standard), **14/20**, 12px × 16px padding, medium radius, one line (two at most), width up to the screen minus margins. Just above the bottom bar, **one at a time**, about 4 seconds, polite screen-reader announcement, never takes focus. **Only when the result has no place on the screen**; otherwise show it where it happens. |
| **Loading** | Busy primary (L2). |
| **Rule** | One message per cause — never field error + notice + toast for the same thing. |

### 9.6 States every screen must cover
A screen is not done until each state that applies is designed and rendered: **loading · empty · error / failed · offline · busy (in progress) · success / outcome · disabled · read-only · long content** (long names, two-line wraps at 360px wide).

### 9.7 Content and formats
- Sentence case for buttons, titles, labels and sheet titles. No full stop on titles; full stops on sentences in notices and helpers.
- Time **3:00 PM** · date **12 Aug 2024** · money **₹1,240** · timers **m:ss** (9:42).
- Say what happened and what to do next. No blame, no jargon.

### 9.8 Accessibility
- Contrast AA (§8.7); tap targets 48px (§8.6).
- **Visible focus ring** on buttons, links and tappable rows. Text fields and the OTP code show focus with their own border (no outline on top); a sheet or screen focused by script shows no outline (D-54).
- **Accessible name** on every icon-only button (Back, Help, Close, Zoom in).
- Toasts and status changes announced politely; never steal focus.
- Animations (sheets, toasts) respect the phone's reduce-motion setting.

### 9.9 Out of scope unless a project opts in
Dark mode · large text / dynamic type (tested in the native app) · haptics and animation detail (native) · desktop layouts beyond §7.

## 10. How screens are designed and reviewed (all projects)  [ADDED 2026-10-15]

The screen version of the workspace rule "Definition of done" (`AGENTS.md`). Lesson: `knowledge/learnings/2026-10-15-define-done-before-work.md`.

1. **Standards before screens.** Every component and state a screen set needs exists here (§9) before anything is rendered. Missing → add it centrally first, never inside the project.
2. **Checklist before review.** Each project starts from `design-system/templates/standards-checklist.md`, adds its own decisions, and gets Apurva's OK. Claude, Codex and Apurva all review against it, not taste.
3. **Automatic checks** run on every captured state at 360, 390 and 430 wide; a state with a failing check is not shown for review.
4. **Concepts come from the real source** — the real screen with only the agreed changes. No invented sections, content or buttons.
5. **Projects never restyle central components**; old shared stylesheets are not loaded by concepts.
6. **Shared fixes first**, then screens; every round is compared with the last approved finals.
7. **Decisions recorded before building** (project decision log), then the build prompt.
8. **Reviewer feedback is vetted**: adopt what's valid, log what's out of scope, flag doubts.
9. **Every state planned in the coverage list** before rendering (§9.6), including stress content.
10. **Finish line:** checks pass, every checklist line passes, reviewers report no blockers, Apurva approves. Then frozen: new findings are a bug (fix where it occurs) or a next-version idea (logged).

