# Brief — design-system token pass (D-99)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex as tester and critic · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).
Why: `docs/reviews/2026-11-09-design-system-token-audit.md`. Decision: `docs/context/decision_log.md` D-99.
**Target: under an hour.** The thinking is done: the token table below is final. Apply it; don't redesign it.
**Lean checks (Apurva, 2026-11-09):** this is a mechanical change. During the work run only the one check that
covers what you just changed. Run the full check suite and the picture proof **once, at the end**. No Codex
critique: the Codex tests from section 0 plus the guard are the review. No screenshots or sheet. Don't loop:
if something can't be fixed in one try, list it in the report and move on.

## How to run

- **Section 0 can run now**, in its own tab, while the kit fix run (D-98) is still going: it only writes
  `tests/codex/tokens/`. When asked "section 0 only", do section 0, commit, stop.
- **Sections 1–6 start only when the kit fix run is done** (`docs/renders/2026-11-09-handoff-kit/REPORT-2.md` exists
  and its changes are committed). Until then, stop and say so. Nobody else edits `design-system/` while 1–6 run;
  Run A1 is on hold until this is done.
- Commit after each section with `scripts/publish.sh` (own files, named). On a `.lock` file, wait and retry.
  On this Mac: `CHROME=` / `CHROMIUM=`, `< /dev/null` on `codex exec`, `git -C`.
- **No visual change** is the bar. Any picture difference = stop and fix.

## 0 · Codex writes the tests first (can run now)

`codex exec --sandbox workspace-write --output-last-message docs/renders/2026-11-09-token-pass/codex-tests.md "Tester for docs/renders/2026-11-09-token-pass/TERMINAL-BRIEF.md (D-99). From this brief and docs/reviews/2026-11-09-design-system-token-audit.md only, write tests/codex/tokens/CASES.md and node tests in tests/codex/tokens/*.mjs that check, after the pass: every token in the table exists in design-system/truemeds.css (CSS name and value) and in design-system/native/tokens.json (native path and value); design-system/src/components.css and projects/truemeds-doctor-portal-prototype/app/screens/*.css contain no raw size, colour, border width, z-index, opacity or duration except on a line carrying a /* raw-ok: <reason> */ marker or in the file-level exceptions the brief lists; the guard script design-system/scripts/check_tokens.py exists, passes on the repo and fails on a planted raw value in a temp copy; RULES.md §2 names sizes, borders, timing, layering, shadow and opacity, and §5 has the native question. Write only under tests/codex/tokens/." < /dev/null`
Commit as they are. Later: a failing Codex test means fixing the work, unless it contradicts this brief (then
`test-disputes.md`, don't edit the test).

## 1 · Tokens (final table)

Add to `design-system/tokens/truemeds.json` next to the D-98 `size` group, same pattern (CSS `--tm-<group>-<name>`,
native `tokens.<group>.<name>` camel-cased by `build_native.py`). Already there from D-98 (keep): `border-width-default`
1 · `focus-ring-width` 2 · `focus-ring-offset` 2 · `icon-size-sm/md/lg` 16 / 20 / 24 · `spinner-size` 16 ·
`spinner-ring` 2 · `logo-lockup-width` 166.

| Family | CSS token | Value | Replaces |
|---|---|---|---|
| Size | `--tm-icon-size-xl` | 32 | empty-state glyph 32 |
| | `--tm-icon-tile-size` | 64 | empty-state circle, offer hero tile, unlock prompt icon (64) |
| | `--tm-target-min` | 48 | every 48 min-height / min-width / line-height used as a tap target |
| | `--tm-thumb-size` | 48 | `.tm-thumb` 48 × 48 |
| | `--tm-control-height-lg` | 56 | OTP slot 56 × 56, any 56 min-height (large button, action bar) |
| | `--tm-spinner-size-lg` | 18 | status-line spinner 18 |
| | `--tm-check-size` | 18 | checkbox 18 |
| | `--tm-toggle-width` / `-height` / `-knob` | 36 / 20 / 16 | toggle track and knob; knob inset = `--tm-space-2xs`; travel = `calc(width − knob − 2 × inset)` |
| Border | `--tm-border-width-thick` | 2 | status-line spinner ring; every other 2px border (focus uses `focus-ring-*`) |
| | (existing) `--tm-border-width-default` | 1 | every 1px border, border-top/-bottom/-right, and the 1px inset rings in `box-shadow` |
| Radius | (existing) `--tm-radius-full` | 999 | every `border-radius: 50%` on a circle |
| Timing | `--tm-duration-fast` | 150ms | button / toggle transitions |
| | `--tm-duration-medium` | 250ms | (for sheets and toasts when Home / Case are built) |
| | `--tm-duration-spinner` | 800ms | spinner cycle |
| | `--tm-duration-pulse` | 1200ms | busy pulse ring |
| | `--tm-easing-standard` | cubic-bezier(0.25, 0.1, 0.25, 1) | `ease` (same curve, named) |
| | `--tm-easing-sheet` | cubic-bezier(0.32, 0.72, 0, 1) | (for sheets when Case is built) |
| Layering | `--tm-layer-raised` | 2 | sheet header / actions inside a sheet |
| | `--tm-layer-sticky` | 10 | app bar, action bar, compact header |
| | `--tm-layer-overlay` | 900 | scrim |
| | `--tm-layer-sheet` | 901 | sheet |
| | `--tm-layer-snackbar` | 950 | snackbar |
| | `--tm-layer-toast` | 1000 | toast |
| Shadow | `--tm-shadow-bar` | `0 -8px 24px 0 rgba(16, 24, 40, 0.10)` | action bar and stuck sheet actions (the `0 -1px 0` hairline uses `--tm-border-default` + `--tm-border-width-default`); native export like the other shadows |
| Opacity | `--tm-opacity-disabled` | 50 | (for Case disabled rows when built) |
| | `--tm-pressed-dim` | 0.92 | call-end pressed `brightness()`; native note: apply as an overlay / darker fill |
| Layout (web only) | `--tm-layout-page-max` / `-narrow` / `-mobile` / `-sidenav` / `-sheet-max` / `-text-max` | 1280 / 720 / 420 / 240 / 640 / 300 | `.tm-page`, `--narrow`, `.tm-mobile`, `.tm-sidenav`, desktop sheet, empty-state text; native README says "web only" |
| | `--tm-sheet-max-height` | 85 | sheet `85vh` (percent of screen) |

Use a token by **meaning**, not by value: a 20px text line is `--tm-font-lineheight-sm`, not an icon size; a 2px knob
inset is `--tm-space-2xs`. Header optical offsets `calc((20px − …)/2)` use `--tm-icon-size-md`.
List each token in `beyond-salt.md` as `[PROPOSED]` under a new heading **"Proposed SALT additions (2026-11-09)"**,
one line each (name, value, what it's for) — Apurva shares that section with the design team.
`python3 scripts/build.py`. Native `README.md`: one line per new family (web-only layout marked).

## 2 · Replace the raw values

`design-system/src/components.css` and `app/screens/*.css`: every raw value → its token from the table. Rebuild.
What may stay raw — each line gets a `/* raw-ok: <reason> */` marker, except the file-level exceptions:
- geometry: `50%` / `-50%` centring, `100%`, `100vh` / `100%` min-heights, `rotate(360deg)`, `line-height: 1`;
- optical nudges of 1–3px (icon `margin-top: 1px`, spinner `vertical-align: -3px`, link `text-underline-offset: 3px`);
- the 31ch text measure; the hidden OTP input's `font-size: 16px` (stops iPhone zoom);
- reduced-motion `0.01ms`; `@media` widths (CSS can't read tokens there);
- the legacy `.tm-otp` block (no project uses it: mark it `[DEPRECATED]` in a comment, exempt as a block);
- the drawn keyboard's height in `otp.css` (prototype only).
File-level exceptions (not scanned): `app/shell/`, `app/review/`, the mock Rx paper selectors, and `ui-screens/`
reference files (frozen; Run A1 / A2 tokenise them when lifting).

## 3 · Guard

`design-system/scripts/check_tokens.py`: scans `src/components.css` and `projects/*/app/screens/*.css`, fails on any
raw size, colour, border width, z-index, opacity or duration without a `raw-ok` marker. Add it to the build-fast
`run-checks.sh` and to `tests/run-checks.mjs`' list. Prove it fails on a planted raw value (temp copy).

## 4 · Rules

`design-system/RULES.md` §2 rule 1: "No raw values" covers colour, spacing, radius, shadow, **sizes, border widths,
timing, layering and opacity**; name the guard; point to the exceptions above (short list in the rule). §5 review
checklist: add **"Would the native app need a name for this value? If yes, it's a token."**

## 5 · Prove nothing moved, regenerate the kit

1. Re-capture all approved pictures the D-94 way and compare byte for byte (same method as Run A0's picture proof:
   `docs/renders/2026-11-09-build-fast/run-A0/picture-proof.md`): expect all identical. `compare-step1.mjs` unchanged (exact 80 · listed 6 · failed 0). All
   checks pass (`run-checks.sh`).
2. `node scripts/build-handoff.mjs`, then `--check`: Sign-in still zero red; the new tokens show by native name.
3. Codex tests (section 0) pass.

## 6 · Report, stop

`REPORT.md`, short (half a page): tokens added, values replaced (count),
`raw-ok` lines (count and reasons), picture proof, checks, Codex tests pass / disputed, anything not fixed. Don't write `docs/context/`. Publish, stop.
