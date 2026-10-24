# Added beyond SALT

Everything below is a **Truemeds decision on top of SALT, owned here** (approved by Apurva). Share it with the SALT
designers so Figma can catch up; the native app team treats it as final, not as proposals. Last updated 2026-10-24.

## Truemeds token and text-style decisions (`tokens/truemeds.json`, layout v2 · D-43)
Applied last by `scripts/build.py`; these override SALT values on purpose.

| Token / style | SALT value | Truemeds value | Why |
|---|---|---|---|
| `--tm-content-brand` (blue text, links, outline/ghost/link buttons, selected-chip text, blue icons) | blue-500 `#266CE1` | **blue-600 `#1D5DCF`** | blue-500 fails AA on the light-blue band (4.50) and the amber notice (4.19). Blue buttons/surfaces (`--tm-surface-brand-default`) and the logo are unchanged. |
| `--tm-content-placeholder` (new) | — (used `--tm-content-tertiary`, grey-400, 3.0:1) | **grey-500 `#6B7280`** (4.83:1) | Placeholder must be readable; still lighter than typed text. `--tm-content-tertiary` stays for decorative uses. |
| `.tm-text-title-lg` (new) | — (mobile headings stop at 20) | **32 / 40 / semibold** | Screen-title hierarchy (L1). Uses `--tm-font-size-title-lg`. |
| `.tm-text-body-lg` / `-strong` | 16 / **20** | **16 / 24** | 20px line height is tight once 16px text wraps. Affects every screen using this style. |

Mobile layout rules: `RULES.md` §8 (four type levels, one side margin, three gaps, button placement, two header types, contrast).

## Components (`src/components.css`)
| Item | Class | Why it exists |
|---|---|---|
| Secondary button, **no drop shadow** | `.tm-btn--secondary` | SALT gives the white secondary button a drop shadow (`--tm-shadow-button-secondary`) and the primary none, so secondaries look raised above the main action. Truemeds keeps SALT's grey border and brand label, drops the shadow (Apurva, 2026-10-24). Share with the SALT designers. |
| Quiet button | `.tm-btn--quiet` | Grey text, no border: leave / cancel / dismiss / "not now" (RULES §9.1). Replaces tertiary, ghost and link-styled buttons. SALT's ghost button is brand blue and reads as the main action. |
| On-dark button | `.tm-btn--on-dark` | Light controls on a dark surface (prescription viewer). |
| Busy button | `.tm-btn--busy` | "Calling…", "Sending OTP": keeps the primary look while working; disabled grey reads as unavailable. |
| Field prefix | `.tm-field__prefix` | Fixed "+91" before the mobile-number input. |
| One-time code | `.tm-otp` | OTP boxes (one real input under the boxes, so SMS autofill and paste work). |
| Large chip | `.tm-chip--lg` | ~46px touch-size chip for choices tapped during a call (dose, interval, duration). |
| Medium tag | `.tm-tag--md` | 12px tag label; SALT's 10px is too small on dense doctor screens. |
| Snackbar | `.tm-snackbar` | Message + one action. Unused; a toast never carries an action (RULES §9.5). Candidate to drop. |
| Empty / waiting state | `.tm-empty` | Centred icon, title, line and optional action (e.g. "No cases right now"). |
| Web layer | `.tm-sidenav`, data table, `.tm-stat` | Internal desktop tools only; not needed in the native app. |

Fix (not new): checked toggle inside a label stayed grey (D-21).

## Locked specs (D-46, Apurva, 2026-10-14) — set in the components, never per screen
Guard: `projects/truemeds-doctor-portal-prototype/ui-screens/feedback/check-locked-specs.py` (fails on any violation).

| Item | Class | Locked value |
|---|---|---|
| OTP code boxes | `.tm-otp-slots`, `.tm-otp-slots__slot` | 56×56 square, 24px digits, one centred group, gap 8 (L1) |
| Loading primary | `.tm-btn--busy` (+ `.tm-spinner`) | brand-blue fill, white label and spinner, also when disabled (L2) |
| Field helper / error | `.tm-field__helper` | 14/20 (L4) |
| Notice text | `.tm-notice` | 14/20 (L5) |

Screen rules (not components): OTP keyboard stays open during verifying (L3); sign-in logo-to-title gap 48 (L6); 16px minimum between the inline button and the keyboard.

## Icons (`scripts/build-icons.mjs`)
| Icon | Why |
|---|---|
| `tablet`, `syrup`, `eye-drops`, `ointment-tube`, `inhaler` | Medicine forms Tabler doesn't have (approved 2026-10-09). |
| `face-id` | Returning-doctor unlock (approved 2026-10-12). |

## Screen patterns in approved doctor-app screens (not yet components)
Built with local styles in `projects/truemeds-doctor-portal-prototype/ui-screens/`:
- **Sign-in layout:** brand-subtle blue top with logo and heading, white panel with 24px rounded top for the form
  (sign-in, OTP, returning unlock).
- **Inline notices** in four tones (info, warning, error, success) that replace the field helper line. Toasts only where nothing on screen can show the result (RULES §9.5).
- **Info notice** (`.tm-notice--info`), used for "number not registered".
- **Task header** (Back + screen title, no logo) for OTP, faster sign-in offer, returning unlock and task screens (D-42).
- ~~Faster sign-in option card~~ dropped by D-45 (offer is its own screen).

## Component rules (2026-10-15, design-system review, approved by Apurva) — RULES.md §8.5, §8.6, §9
Checked against Material 3, Apple HIG and WCAG 2.2. Review copy: `projects/truemeds-doctor-portal-prototype/docs/reviews/2026-10-15-design-system-review.md`.

| Rule | Departure from SALT / previous state | Implementation in `src/components.css` |
|---|---|---|
| Four button roles + call end (§9.1) | SALT has eight button styles with no usage rule | Map tertiary/ghost/link-as-button to `.tm-btn--quiet`; add `.tm-btn--call-end` (solid red, only for ending a live call) — **done** |
| One height per group; 56px action buttons, 48px compact (§9.1) | `--sm` 40 and `--xs` 32 were used for tappable buttons | Stop using `--sm` / `--xs` for touch; compact inline = default 48 — **done** |
| 48px minimum tap target (§8.6) | Was 44 | Icon buttons, chips, rows, toggles — **done** |
| Chips wrap; grids share one chip size (§9.2) | No rule | Chip and grid styles — **done** |
| Read-only row, reserved tag width, status card (§9.3) | No rule / no component | `.tm-row--readonly`, tag min-width, `.tm-status-card` — **done** |
| One bottom-sheet template (§9.4) | `.tm-sheet` was a bare container; projects styled their own sheets | `.tm-sheet__header`, `__title`, `__close`, `__body`, `__actions`, option row — **done** |
| Toast: dark, 14/20, roomier, one line, only when nothing on screen can show the result (§9.5) | Was 12/16 with 4×8 padding (too small to notice) | `.tm-toast` resized — **done** |
| Edit-screen and viewer headers (§8.5) | Not defined | Header styles — **done** |
| Visible focus ring, reduce-motion (§9.8) | Not defined | Global focus style, `prefers-reduced-motion` — **done** |

Implemented centrally 2026-10-15 (preview renders: `build/preview-2026-10-15/`). Every approved project screen is re-checked against them next.

### Added 2026-10-15 (gaps found by the A–D standards pass) — done
| Item | Class | Why |
|---|---|---|
| Field spacing 8 | `.tm-field` gap | RULES §8.3 says label↔field↔helper = 8; was 4 |
| Full-height inputs | `.tm-field__control` min 48, input fills it | the whole control is the tap target (§8.6) |
| Read-only field / block | `.tm-field--readonly`, `.tm-readonly` | closed cases: muted, readable, not tappable (§9.3) |
| Notice icon 20px | `.tm-notice .tm-icon` | feedback-rules icon size |
| 3-column chip grid | `.tm-chip-grid--3` | long labels such as "10:30 AM" never wrap (§9.2) |
| Compact task header | `.tm-header-task--compact` (+ `__row`, `__title`, `__meta`, `--no-back`) | D-49 / §8.5 as a central component |
| Link button height | `.tm-btn--link` min 48 | standalone link-buttons meet §8.6 |

