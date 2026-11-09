# Design-system token audit — 2026-11-09

**Why:** the Sign-in hand-off kit found sizes with no token (D-98). This audit checks the whole design system and
every approved screen for the same kind of miss, before the other journeys reach the kit.
**Scope:** `design-system/src/components.css`; built screens `app/screens/*.css`; approved screens still to be built
(`ui-screens/case/case-styles.css`, `ui-screens/home/home-reference.css`, `<style>` in `ui-screens/*/*.html`).
**Method:** every CSS value that is not a token (`var(--tm-…)`), grouped by kind and checked against the token list.
Script: `/tmp` one-off; re-run as a guard (see §5).

## 1. Why we found this so late

1. **SALT has no tokens for these kinds of value.** It covers colour, spacing, radius, type and shadow. It has
   nothing for icon and control sizes, border widths, animation timing or layering. Our design system copied SALT,
   so it inherited the same blind spots.
2. **Our rule wasn't applied to the design system itself.** RULES §2 bans raw values in *project* code. The
   design system's own components file has ~130 raw numbers, and no check looked at it.
3. **The checks only covered colours and the locked specs.** Nothing checked sizes, borders, timing or layering.
4. **The web forgives this; native doesn't.** A raw `20px` works fine in a browser, so nothing ever looked wrong.
   Only translating to another platform makes every unnamed number visible.

## 2. Missing token families (real gaps — fix in the design system)

| # | Family | What's typed today | Where | Suggested tokens |
|---|---|---|---|---|
| 1 | **Sizes** | icons 16 / 20 / 24 (~45 uses); touch target 48 (10+); large button and OTP box 56; empty-state icon 64; thumbnail 48; logo lockup 166; spinner 16 | components, every screen | icon sm / md / lg; target-min 48; control-lg 56; icon-xl 64; logo-lockup 166 |
| 2 | **Border widths** | 1px (~33 uses), 2px (spinner, focus), focus ring 2 + offset 2; one off-scale 1.5px (option-card check) | components, case | border-thin 1, border-thick 2, focus-ring width / offset; 1.5 → 2 or 1 |
| 3 | **Animation timing** | 150ms (buttons, toggle), 0.8s spinner, 1.2s and 1.8s pulse, sheet 0.28s with its own curve, toast 0.25 / 0.3s | components, case | duration fast / medium / slow; one standard easing; spinner and pulse cycles |
| 4 | **Layering** | z-index 1, 2, 4, 10, 55, 150, 200, 500, 800, 900, 901, 950, 1000 — no system | components, case, home | named layers: content · sticky bars · overlay · sheet · snackbar / toast |
| 5 | **Bar shadow** | action bar and stuck sheet actions use `0 -1px 8px rgba(16,24,40,.10)`, not one of the shadow tokens | components | shadow-bar |
| 6 | **Opacity / pressed** | disabled 0.5 (twice), pressed `brightness(0.92)` | components, case | opacity-disabled; a pressed-state rule |

Layering and timing matter most for native: React Native has no CSS stacking, and the team will otherwise guess
which sits on top (toast vs sheet) and how fast sheets move.

## 3. Raw values inside approved screens not yet built (fix when lifted)

These show up when Home, Case and Prescribe are built and reach the kit. They are each a lift-time fix, not a
redesign:
- **Off-scale spacing:** 6px gaps (case back link, OTP helper), 18px margin (case back), −9 / −14px header
  margins (home), 1.5px border (option card).
- **Colours outside tokens:** home sheet overlay `rgba(0,0,0,.32)` (the overlay tokens exist), case button spinner
  `rgba(255,255,255,.45)`.
- **Ad-hoc layering and motion** in case and home (see §2.3–2.4).
- Type is on the scale (14/20, 24 line height) but typed as raw numbers in `case.html`; it maps straight to tokens.

## 4. Fine as they are (documented exceptions, not gaps)

The mock Rx paper (exempt by rule: it imitates a printed document) · prototype chrome: phone frame (390 / 430 / 844),
review controls, drawn keyboard · layout keywords and `100%` · the 31ch text measure · −1px border-overlap margins ·
the hidden OTP input's 16px (stops iPhone zooming) · 50% / −50% centring and the 360° spin.

## 5. Recommendation

1. **Add the six families** to the design system in one pass, marked `[PROPOSED]` in `beyond-salt.md`, and replace
   the raw values in `components.css`. No visual change, proved by the picture compare. Raise them with the
   design team as additions to SALT.
2. **Add a guard** that fails on any raw size, colour, border width, z-index or timing in `components.css` and
   `app/screens/`, outside a short exceptions list (§4). This makes it impossible for this to happen again.
3. **Tell the build tabs:** when lifting Home, Case and Prescribe, use the new tokens and fix the §3 values; anything
   still missing goes on a list, not into the code.
4. Run it **after** the current kit fix run (D-98) ends: that run is adding part of family 1 and 2 for Sign-in, and
   this pass should extend the same names, not compete with them.
