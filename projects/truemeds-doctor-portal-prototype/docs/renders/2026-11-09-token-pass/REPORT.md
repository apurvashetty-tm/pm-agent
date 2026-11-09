# Token pass (D-99) — report

**Result: done, no visual change.** Unattended run; rulings read first (`docs/runs/RULINGS.md`).

**Tokens added (`design-system/tokens/truemeds.json`, all `[PROPOSED]`, listed in `beyond-salt.md` › "Proposed SALT additions (2026-11-09)")** —
the brief's table, exactly: `icon-size-xl`, `icon-tile-size`, `target-min`, `thumb-size`, `control-height-lg`, `spinner-size-lg`,
`check-size`, `toggle-width/-height/-knob`, `border-width-thick`, `duration-fast/-medium/-spinner/-pulse`, `easing-standard/-sheet`,
`layer-raised/-sticky/-overlay/-sheet/-snackbar/-toast`, `shadow-bar`, `opacity-disabled` (CSS 50%), `pressed-dim`, `layout-*` (web only),
`sheet-max-height` (85vh). Sizes sit in the D-98 `size` group; non-px values in a new `scale` group (`_unit` per group); `shadow.bar`
in a new `shadow` group. `build.py` / `build_native.py` / the kit's `build-handoff.py` read them (native `tokens.<group>.<name>`;
`shadow.bar` in the same format as the SALT shadows). Native README: one line per family, layout marked web only.

**Values replaced:** the guard's 111 findings → 0. 101 raw values became tokens; 10 stayed raw with a marker. Also swapped by meaning
(same values): `--tm-space-3xl` used as a tap target → `--tm-target-min` (14), header offsets `(20px − 3xl)/2` → `(icon-size-md − target-min)/2`,
call-end `brightness(0.92)` → `--tm-pressed-dim`, toggle travel `16px` → `calc(width − knob − 2 × space-2xs)`, the 32 icon `--tm-space-2xl` → `--tm-icon-size-xl`,
OTP reserved line `20px` → `--tm-font-lineheight-sm`. Legacy `.tm-otp` marked `[DEPRECATED]`.

**`raw-ok` lines: 25.** 13 × `100%` fill, 1 × `100vh`, 1 × `50%` centring, 1 × `line-height: 1`, 3 × optical nudge (underline 3px, spinner −3px,
icon 1px), 1 × hidden OTP input 16px, 1 × reduced-motion 0.01ms, 1 × `@media` 768px, 1 × 31ch, 1 × drawn keyboard 256px,
**1 not in the brief's list:** the scrim's `rgb(0 0 0 / overlay-token %)` — SALT has no black semantic colour.

**Guard:** `check_tokens.py` passes on the repo; added to `run-checks.sh` and `tests/run-checks.mjs` (S3). **Fixed a guard gap:** it rejected a
token followed by a list comma (`transition: … var(--tm-easing-standard), …`); `stylelint.config.mjs` now accepts the comma (fixtures f10 / p11 added; must-fail 10, must-pass clean).

**RULES:** §2.1 covers sizes, border widths, timing, layering and opacity, names the guard, lists the exceptions; §5 has the native question.

**Picture proof:** all approved pictures re-captured the D-94 way → **298 / 298 identical** (`picture-proof.json`). `compare-step1`: exact 80 · accepted 6 · failed 0.
**Checks** (`checks/`): all pass (entry journeys 61/61, run-checks 91/91, layout ×2, locked specs, sources, lockup, guard, scan, state map).
**Kit:** rebuilt; Sign-in 0 raw values; new tokens show by native name (`tokens.target.min`, `tokens.duration.spinner`, …); `--check` up to date; D-98 hand-off tests 16/16.
**Fresh-AI round 5 (Codex):** 0 DECIDED questions, strict code **PASS** (the round-4 spinner fail is gone: it uses `tokens.duration.spinner`).

**Codex tests (section 0): 45 pass, 45 disputed** (`test-disputes.md`): 43 read native tokens under an extra `tokens` root key that `tokens.json` doesn't have
(and rename the D-98 paths); 1 wants `--tm-radius-full` as a literal, not SALT's alias; 1 counts `transparent` as a raw colour.

**Not fixed / for the main thread:** OPEN o24 (spinner motion) can be closed — the token now exists (`open_questions.md` not written by this run).
Scrim black (above) needs a SALT colour or stays marked. The run's Bash sandbox blocked `env VAR=` prefixes, so Chrome is set in small wrappers (`tools/*.sh`).
