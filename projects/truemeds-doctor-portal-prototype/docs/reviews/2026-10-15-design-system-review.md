# Truemeds Design System — review copy (2026-10-15)

Status: **PROPOSAL — for Apurva's review.** Nothing here is applied yet.
Source of truth today: `design-system/RULES.md`, `src/components.css`, `tokens/truemeds.json`, and the project's `docs/feedback-rules.md`.

Every item is marked:
- **[EXISTS]**: already defined and used. No change.
- **[ENHANCE]**: exists but incomplete, inconsistent or wrong against the standards. Changed here.
- **[ADD]**: missing today. New rule or component.

Checked against Material 3, Apple's Human Interface Guidelines and WCAG 2.2 (sources at the end).

---

## 1. Foundations

| Item | Status | Rule |
|---|---|---|
| Tokens (colour, spacing, radius, shadow) | [EXISTS] | `var(--tm-…)` semantic tokens only; no raw values. |
| Font | [EXISTS] | Plus Jakarta Sans only. |
| Icons | [EXISTS] | Tabler outline, monochrome, no emoji. Decorative icons neutral grey (§8.11). |
| Logo | [EXISTS] | Locked files and lock check. |
| Colour meaning | [EXISTS] | Blue = action / selection · green = done · amber = attention · red = failed / destructive · everything else neutral. |
| Brand colour reference in RULES §2.8 | [ENHANCE] | It says brand is `#266CE1`; the live token is blue-600 `#1D5DCF` (layout v2). Fix the line. |
| Type scale, 4 levels (L1 32/40 · L2 16/24 · L3 14/20 · L4 12/16) | [EXISTS] | Screen text only; components keep their own specs. |

## 2. Layout

| Item | Status | Rule |
|---|---|---|
| Phone frame for prototypes | [EXISTS] | RULES §7. |
| Side margin 24, gaps 8 / 16 / 32 | [EXISTS] | RULES §8.2–8.3. |
| Main button placement | [EXISTS] | Inline on typing screens, pinned otherwise (§8.4). |
| **Page surface** | [ADD] | **Step screens** (sign-in, OTP, offer, unlock, Home): white page under the tinted band. **Work screens** (case page, Prescribe): grey page with white cards. Nothing sits loose on the grey; every block is in a card. |
| Safe area | [ADD] | Pinned bars and sheets add the phone's bottom safe-area inset. |

## 3. Headers

| Type | Status | Rule |
|---|---|---|
| Home-base | [EXISTS] | Logo left, icon actions right (Home, sign-in). |
| Task: hero | [EXISTS] | Tall tinted band, Back where there is a previous screen, title 32/40 (OTP, unlock, offer). |
| Task: compact | [EXISTS] → [ENHANCE] | Short sticky tinted band, title 20/28, meta lines; never changes height while scrolling. **Add:** when Back is hidden (during a call, case closed), the title and meta move to the left margin. Long names wrap to at most 2 lines; height is fixed per case, never while scrolling. |
| **Edit screen** | [ADD] | For full-screen editors opened over a page (Prescribe). White bar: ✕ on the left (closes, asks before discarding), title + one-line subtitle, at most one action on the right (e.g. Disable, destructive outline). A pinned summary band may sit under it (the "On prescription" band). |
| **Viewer** | [ADD] | For full-screen viewers (Rx viewer). Dark bar: ✕, title, tools (zoom, rotate, fit). The title never overlaps the tools; tools are 48 px targets. |

## 4. Buttons

**Roles: the design system lists eight styles today (primary, secondary, tertiary, ghost, link, quiet, destructive, on-dark) with no rule for which to use. [ENHANCE] to four roles plus one special case:**

| Role | Look | Use for | Examples |
|---|---|---|---|
| **Primary** | Solid blue, white label | The one action that moves the flow forward. One per screen or sheet. | Send OTP, Request a case, Confirm prescription, Release case |
| **Secondary** | White, blue border, blue label | Another real action, less likely than the primary | Schedule callback, Skip HA call, View Rx |
| **Quiet** | Grey text, no border | Leave, cancel, dismiss, "not now" | Back to Home, Stay on this case, Not now, End availability |
| **Destructive** | White, red border, red label | Actions that remove or close something for good. Never solid. | Mark as unavailable, Disable |
| **Call end** (special) | Solid red, white label | Only for ending a live call, the universal phone convention. Nothing else uses it. | End call |

- Inline text links stay links (blue, in a sentence): Change, Resend code, call Doctor Ops. [EXISTS]
- Retire as separate choices: tertiary, ghost and link-styled buttons map to **Quiet**. `on-dark` stays only inside the dark Viewer header. [ENHANCE]

**Size and layout [ENHANCE]**
- **One height per group** (Apple: distinguish by style, not size). Full-width action buttons in a pinned bar, sheet or form: **56 px, 18 semibold**, for every role in the group.
- **Compact inline button** (e.g. View Rx in a content row): 48 px, 16 semibold.
- The 40 px and 32 px sizes are **not used for anything tappable on mobile** (below the 48 minimum).
- **Order, top to bottom:** primary → secondary (two may sit side by side) → quiet.
- **Side-by-side pair:** equal widths, no icons, labels must fit on one line at 360; otherwise stack them.
- **Icons in buttons:** only on a full-width button, only when they add meaning (phone on Call patient / End call). Never on side-by-side pairs.
- **Labels:** verb first, sentence case, no full stop, no "Click / Tap".
- **States:** pressed, disabled (design-system disabled style, exempt from contrast), busy (L2: brand fill, white label and spinner).

## 5. Tap targets

| Item | Status | Rule |
|---|---|---|
| Minimum tap area | [ENHANCE] | **48 × 48 px** (was 44). Meets Android 48 dp and Apple 44 pt; WCAG minimum is 24. Applies to icon buttons (✕, ?, Back, zoom), chips, rows, toggles, links outside sentences. Enlarge the tap area, not the text. |
| Links inside a sentence | [EXISTS] | WCAG inline exception. |

## 6. Chips and choice grids

| Item | Status | Rule |
|---|---|---|
| Chip component | [EXISTS] | `.tm-chip`, `aria-pressed`, selected = blue tint + blue border. |
| **Free-flowing chips** (How often, Food, Date) | [ADD] | Fixed padding and font; width hugs the label; **wrap to the next row when they don't fit**. Never squeeze, clip or shrink text. |
| **Grid chips** (Dose M/A/N, SOS dose, Max a day, Time slots, Every X hours) | [ADD] | Equal-width columns on a 4-column grid. **Every grid on one screen uses the same chip size**, even if a row has fewer options (3 options = 3 cells of the 4-grid, left-aligned, not stretched). |
| Large chip | [EXISTS] | `.tm-chip--lg` for choices tapped during a call. |

## 7. Fields

| Item | Status | Rule |
|---|---|---|
| Field, helper, error | [EXISTS] | Label · control · helper; helper/error 14/20 (L4), aligned with the field (L7). |
| Text area | [EXISTS] | Same field anatomy. |
| Inline unit (ml, units) | [EXISTS] | Suffix inside the control. |
| Error copy | [EXISTS] | Says what to do; adapts to the form (ml / units). |

## 8. Lists, tags and cards

| Item | Status | Rule |
|---|---|---|
| Row (`.tm-row`) | [EXISTS] | Thumb · title · meta · trailing. |
| Tappable row | [ADD] | Chevron on the right only when the row opens something. |
| **Read-only row** | [ADD] | Closed case: muted text, no chevron, not tappable, still readable. |
| Status tag | [EXISTS] → [ENHANCE] | **Fixed mapping:** Prescribed = success · Pending = warning · Disabled = neutral. **Reserve the tag width** so names never re-wrap when the status changes. Text AA (success tag green-700). |
| Card | [EXISTS] | One level only; no cards inside cards. |
| **Status card** | [ADD] | Outcome of a case: icon + title, top of the content, stays. Green tick for completed outcomes (Prescription confirmed, Transferred, Forwarded, Callback at …); neutral info icon for non-success (Patient unavailable). |
| Empty state | [EXISTS] | `.tm-empty` (e.g. "No medicines on this order"). |

## 9. Bottom sheets

**[ENHANCE + ADD]**: the design system has only a bare container, and the case page uses its own sheet styles. One template for every sheet in the app:

| Part | Rule |
|---|---|
| Background | Page dimmed behind the sheet (overlay token). |
| Top | Rounded top corners; **no drag handle** (✕ is always present). |
| Header | Title 20/28 semibold on the left · ✕ on the right (48 px target) · **no divider**. Optional subtitle (L3) under the title. |
| Spacing | 24 side margins (same as screens) · 16 between header and content · 24 + safe area at the bottom. |
| Content | Fields, chips or **option rows** (one shared style for reason lists: title + one-line description, full-width, 48+ px). |
| Actions | Per the button rules: primary → secondary → quiet, 56 px, full width. Reason lists apply on tap and need no button. |
| Closing | ✕, tap outside, or swipe down = cancel. **Not while an action is in progress** (busy). Unsaved input asks first. |
| Size | Up to 85% of the screen height; the content scrolls inside, the header and actions stay. Max width 640 on desktop. |

Sheets in the app today: Leave this case · Missed call · Schedule callback · Skip HA call · Disable medicine · Discard changes · Add availability · End availability · Profile / Logout.

## 10. Feedback

`docs/feedback-rules.md` already defines the patterns (field error F1, notice F2, warning W1, neutral N1, status S1, toast T1, loading L1). Kept; these rules make them visible in the design system.

| Item | Status | Rule |
|---|---|---|
| **Notice** | [EXISTS] | In the page, stays until the cause is gone. Neutral / warning / error. 14/20 (L5). |
| Field error | [EXISTS] | Under the field (L4, L7). |
| Loading | [EXISTS] | Busy primary (L2); quiet actions show text only ("Ending…"), no spinner. |
| **Toast** | [ENHANCE] | **Dark** (inverse surface; the platform standard, and already in feedback-rules §5). One line, one at a time, 3–4 seconds, just above the bottom bar, never takes focus. **Only when the result has no place on the screen.** Otherwise show it where it happens (D-27's principle). Users today: "Time added" (Home), "Finish this case first" (phone back during a call). **Needs Apurva: adjusts D-27 ("no black toasts").** |
| **Status card** | [ADD] | See §8: the outcome of a case. |
| One message per cause | [EXISTS] | Never field error + notice + toast for the same thing. |

## 11. Other components

| Item | Status | Rule |
|---|---|---|
| Pinned bottom bar | [EXISTS] → [ENHANCE] | Button rules above; steps aside while typing. |
| Toggle, checkbox | [EXISTS] | 48 px tap area. |
| OTP code boxes | [EXISTS] | Locked L1. |
| Wheel picker | [EXISTS] | D-40: one light-blue selection band, large blue values. |
| Value display | [EXISTS] | Locked L9. |
| Divider | [EXISTS] | Between list rows only; not under sheet or card titles. |

## 12. States every screen must cover [ADD]

A screen isn't done until each that applies is designed and rendered:
**loading · empty · error / failed · offline · busy (in progress) · success / outcome · disabled · read-only · long content** (long names, long medicines, two-line wraps at 360).

Missing in phase D today: case loading, case failed to load, offline during a case, Confirm in progress, Confirm failed, Release failed, callback failed to save, Rx failed to load, order with no medicines, very long patient and medicine names.

## 13. Content and formats [ADD]

- Sentence case for buttons, titles, labels and sheet titles ("Disable medicine", not "Disable Medicine").
- No full stop on titles; full stops on sentences in notices and helpers.
- "Case" for the doctor's unit of work; "order" only for the order ID and order data.
- Time **3:00 PM** · date **12 Aug 2024** · money **₹1,240** · timers **m:ss** (9:42).
- Write for the doctor: say what happened and what to do next; no blame, no jargon.

## 14. Accessibility

| Item | Status | Rule |
|---|---|---|
| Contrast AA | [EXISTS] | §8.7, including tinted bands and notices. |
| Tap targets | [ENHANCE] | 48 px (§5). |
| **Focus visible** | [ADD] | A visible focus ring on every interactive element for keyboard and switch users. |
| **Labels** | [ADD] | Every icon-only button has an accessible name (Back, Help, Close, Zoom in). |
| Announcements | [EXISTS] | Toasts and status changes announced politely; never steal focus. |
| **Reduced motion** | [ADD] | Sheet and toast animations respect the phone's reduce-motion setting. |

## 15. Explicitly out of scope (so nobody raises them later)

Dark mode · large text / dynamic type (tested in the native app) · haptics and animation detail (native) · desktop layout beyond the phone-frame rule · the desktop side panel.

---

### Sources
- Material 3 buttons: https://material-web.dev/components/button
- Apple HIG, Buttons: https://developer-mdn.apple.com/design/human-interface-guidelines/components/menus-and-actions/buttons
- Material Components, Bottom sheets: https://gitea.com/784622644/material-components-android/src/branch/master/docs/components/BottomSheet.md
- Material Components, Snackbar: https://github.com/material-components/material-components-android/blob/master/docs/components/Snackbar.md
- WCAG target sizes (Smashing Magazine): https://smashingmagazine.com/2024/07/getting-bottom-minimum-wcag-conformant-interactive-element-size/
- Material chips: https://m2.material.io/components/chips
