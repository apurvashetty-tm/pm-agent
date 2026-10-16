# Layout v2 — render brief and coverage matrix

Status: PLANNED (Step 1 matrix; no capture yet)
Date: 2026-10-14 · Owner: Claude (builds, captures, self-audits) · Reviewer: Codex (read-only) · Approver: Apurva (glance at the end)
Rules: feedback-rules v1.1 · Loop: `docs/reviews/2026-10-14-layout-v2-loop.md`

Create this README **before** generating any images. "Not run" is valid evidence; "passed" without a check is not.

## Purpose and authority

- Review question: do the layout-v2 screens (D-42 header types, D-43 type scale / spacing / button placement, D-44 OTP v2, D-45 faster sign-in offer) follow the rules, and do all states render and behave?
- Decisions/specs: `docs/context/decision_log.md` D-38 (pointer), D-42, D-43, D-44, D-45; `docs/feedback-rules.md` v1.1; `docs/feedback-state-map.md` v1.1; `design-system/RULES.md` §8.
- Rules: `../../feedback-rules.md` · Mapping: `../../feedback-state-map.md`
- Approved baseline: `ui-screens/` PNGs are the **last approved** state and are not touched in this loop. Layout-v2 screens are **superseded pending re-approval** (`ui-screens/README.md`).
- Intended changes: task header (no logo) on OTP / offer / unlock / case page; logo kept on sign-in and Home; four-level type scale; 24 side margin; inline main button on typing screens; pinned main button on offer and Home; OTP four boxes over one real input with replace-on-first-keystroke.
- Proposed copy or behaviour needing review: OQ-023 (re-offer timing; placeholder = never automatic); copy in the offer screen and the "Resend in 0:30" / "Resend code" line (screen labels, not feedback registry messages).

## Sources

- Shared component / design-system version: `design-system/truemeds.css` rebuilt 2026-10-14 with `tokens/truemeds.json` applied last (brand text blue-600, placeholder grey-500, title-lg 32/40/600, body-lg 16/24).
- HTML source: `ui-screens/sign-in/sign-in.html`, `ui-screens/otp/otp.html`, `ui-screens/returning-unlock/returning-unlock.html`, `ui-screens/home/home.html` (+ `add-availability.html`, `availability.html`); phase B new folder `ui-screens/faster-signin-offer/` (to create); phase D `index.html` (case page).
- Native component: **not changed in this loop** (`ui-screens/native/`).
- Shared copy registry: `ui-screens/feedback/messages.json` + `metadata.json` (copy-only siblings map to representatives). Migration to registry for layout-v2 screen labels: pending.
- Source revision: git `doctor-portal/sign-in` at 2026-10-14 start (uncommitted working tree).
- Fonts and platform/runtime: Plus Jakarta Sans bundled in `design-system/fonts/`; headless Chromium via Playwright installed outside the project (scratchpad).

## Coverage matrix

Notation: **Own** = gets its own capture (390×844 @2x, plus 360 wide where text wraps or controls sit side by side). **Covers X** = copy-only or same-layout sibling of representative X (stays in the matrix, not captured). **Fixture** = source/behaviour state with no capture planned unless a render-policy trigger fires. Keyboard: **open / closed / n/a**. Pattern per `feedback-state-map.md` (F1 field error, F2 action notice, W1 warning, N1 status, S1 inline success, T1 toast, L1 loading).

### Phase A — Sign-in (`ui-screens/sign-in/`) · selector has 12 states

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| signin.default | Entry | None | closed | Own (A-01) |
| signin.keyboard-open | Partial valid entry, field focused | None | open | Own (A-02) |
| signin.empty-tap | Submit with empty field | F1 | open (focus returned) | Covers A-02 layout; own at 360 only if wrapping |
| signin.too-short | Submit with incomplete digits | F1 | open | Covers A-02 |
| signin.wrong-first-digit | Impossible prefix | F1 | open | Own (A-03) — field error + keyboard reach (R01) |
| signin.pasted-cleaned | Paste with prefix | None | closed | Covers A-01 |
| signin.sending | Send pending | L1 | closed | Own (A-04) — loading CTA position |
| signin.not-registered | Server: not registered | N1 | closed | Own (A-05) — neutral notice + sign-up route (R06) |
| signin.offline | Offline after action | F2 | closed | Own (A-06) — notice above CTA |
| signin.couldnt-send | Confirmed send failure | F2 | closed | Covers A-06 (copy sibling) |
| signin.too-many-tries | Issuance cap | W1 | closed | Own (A-07) — warning notice (R04-type) |
| signin.inactive | Account inactive | F2 access | closed | Own (A-08) — Call Doctor Ops notice |

Sign-in rows: **12 states, 8 own captures, 4 covered.**

### Phase A — OTP (`ui-screens/otp/`) · selector has 12 states + 5 combinations from the state map

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| otp.default | Entry; keyboard opens on load; box 1 focused | None | open | Own (O-01) — current source does not open keyboard yet; build item |
| otp.empty-tap | Verify with no code | F1 | open | Covers O-01 (copy sibling of F1 layout) |
| otp.too-short | Verify with two digits | F1 | open | Covers O-03 |
| otp.verifying | Verify pending | L1 | closed (in progress) | Own (O-02) — loading CTA |
| otp.wrong-code | Server wrong code | F1 | open | Own (O-03) — digits visible, red boxes, no focus box (R02-type); current source shows no digits yet; build item |
| otp.two-tries-left | Wrong code with remaining count | F1 | open | Covers O-03 (count copy) — longest-copy check at 360 |
| otp.resend-available | Resend allowed | None | open or closed (decide at fixture) | Own (O-04) — brand "Resend code" line |
| otp.new-code-sent | Resend confirmed | S1 | open | Covers O-04 (copy sibling) |
| otp.code-expired | Known-expired code | F1 | open | Own (O-05) — "Resend code" at once, Verify blocked (R02) |
| otp.couldnt-verify | Service failure | F2 | open | Own (O-06) — notice; code retained (R03) |
| otp.too-many-resends | Resend capped | W1 | open | Own (O-07) — resend line hidden, Verify available (R05) |
| otp.locked | Number lock | W1 | closed | Own (O-08) — boxes/Verify disabled, lines hidden (R04) |
| otp.resending | Resend pending | L1 | open | Fixture — same loading CTA as O-02; Covers O-04 |
| otp.resend-failed | Resend failed | F2 | open | Covers O-06 |
| otp.offline | Offline | F2 or N1 | open | Covers O-06 |
| otp.cooldown-reconciling | Timer zero, eligibility pending | W1 + progress | closed | Fixture — Covers O-07 |
| otp.expired-and-resend-limited | No usable code, resend limited | W1 | closed | Covers O-07; wording review required (R05 layout) |

OTP rows: **17 states, 8 own captures, 9 covered or fixture.**

### Phase B — Faster sign-in offer (new, D-45) · folder `ui-screens/faster-signin-offer/` (to create)

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| offer.shown-fingerprint | First OTP sign-in on fingerprint phone, feature off | None | closed | Own (B-01) — pinned primary + "Not now" |
| offer.shown-face-id | Same on Face-ID phone | None | closed | Own (B-02) — wording difference only; 360 check |
| offer.enabling | Turn on tapped; OS prompt pending | L1 + OS prompt | closed | Own (B-03) — progress on primary |
| offer.enabled | OS prompt success | — | n/a | No screen: goes to Home (Home covered by C-01) |
| offer.cancelled | OS prompt cancelled | None | n/a | Destination Home (C-01); no capture |
| offer.failed | Enrolment failed | None | n/a | Destination Home (C-01); no capture |
| offer.not-now | Not now tapped | None | n/a | Destination Home (C-01); no capture |
| offer.unsupported | Device unsupported / already on | — | n/a | Screen skipped; no capture |

Returning unlock (`ui-screens/returning-unlock/`) · selector has 4 options; pending, cancelled and platform-retry are not in the selector yet.

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| unlock.fingerprint | Fingerprint | None | n/a | Own (B-04) — task header, no logo |
| unlock.face-id | Face ID | None | n/a | Own (B-05) |
| unlock.screen-lock | Screen lock | None | n/a | Own (B-06) |
| unlock.pending | OS prompt pending | L1 + OS | n/a | Fixture — add selector option; Covers B-04 |
| unlock.unavailable | Unavailable → OTP fallback | F2 | n/a | Own (B-07) — notice + "Use OTP instead" |
| unlock.cancelled | OS prompt cancelled → return to unchanged screen | None | n/a | Fixture — no error; Covers B-04 |
| unlock.platform-retry | OS-owned retry guidance | OS-owned | n/a | Fixture + device check; no mock OS prompt |

Phase B: **7 own captures** planned (offer B-01..B-03, unlock B-04..B-07); the rest are covered, fixture or no-screen rows.

### Phase C — Home (`ui-screens/home/home.html`) · selector has 8 states; the rest are fixtures to add

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| home.setup | Setup wheel | None | n/a | Own (C-01 setup) |
| home.setting | Setup confirmed, pending | L1 | n/a | Fixture — Covers C-01 |
| home.setup-failed | Setup failed | F2 | n/a | Own (C-02) |
| home.active | Active timer, Request a case | None | n/a | Own (C-03) — home-base header, pinned CTA |
| home.requesting | Request pending | L1 | n/a | Fixture — Covers C-03 |
| home.no-cases | Nothing to show | N1 | n/a | Own (C-04) — not in Home selector yet; add option in build; draft needs state approval |
| home.request-failed | Confirmed request failure | F2 | n/a | Own (C-05) — R09 |
| home.offline | Offline, pending reconcile | F2 or N1 | n/a | Covers C-05 (copy sibling) |
| home.near-expiry | ≤15 min left | W1 | n/a | Own (C-06) — Add time placement |
| home.add-open | Add sheet, wheel | None | n/a | Own (C-07) — wheel sheet; 360 check |
| home.adding | Add pending | L1 | n/a | Fixture — Covers C-07 |
| home.add-failed | Add failed, sheet stays | F2 | n/a | Own (C-08) — R07 |
| home.added | Confirmed add | T1 | n/a | Own (C-09) — toast above CTA (R08) |
| home.end-confirmation | End confirmation | Confirmation | n/a | Fixture — later review |
| home.stop-pending | Stop pending | N1 + L1 | n/a | Fixture — Covers C-03 |
| home.expired-pending | Request submitted, expired | N1 + L1 | n/a | Fixture — Covers C-03 |
| home.idle-expired | Expired idle; setup reuse | N1 + setup | n/a | Fixture — Covers C-01 |
| home.manually-ended | Ended by doctor; setup reuse | N1 + setup | n/a | Fixture — Covers C-01 |
| home.unknown-result | Uncertain server outcome | N1 + L1 | n/a | Fixture — backend integration required |

Home: **18 rows, 9 own captures**, rest fixtures. Home keeps the home-base header (D-42).

### Phase D — Case page (`index.html`, prototype) · main states

| ID | Trigger | Pattern | Keyboard | Capture |
|---|---|---|---|---|
| case.call-not-started | Case open, call not started | None | n/a | Own (D-01) — task header, type scale audit |
| case.on-call | Call in progress | None | n/a | Own (D-02) |
| case.prescribing | Prescribing | None | n/a | Own (D-03) |
| case.call-ended | Call ended | None | n/a | Own (D-04) |

Consultation logic, CTAs and the locked flow are **not** changed (CLAUDE.md). Exact state IDs to confirm against `index.html` at build time.

## Totals (planned)

- Rows: sign-in 12 · OTP 17 · offer 8 · unlock 7 · Home 18 · case 4 = **66 rows**.
- Own captures planned: sign-in 8 · OTP 8 · offer 3 · unlock 4 · Home 9 · case 4 = **36 PNG states at 390×844**, plus 360-wide checks where text wraps.
- Fixtures / copy siblings / no-screen rows: remainder (must each name a representative or source state).

## Phase A status (2026-10-14) — Reviewed — yet to be approved by Apurva (final: round 4, locked specs D-46)

- Rounds: 3 (cap). Round 3 had no open blockers. Rejected points are in Needs Apurva, not open blockers.
- Contact sheets (final): `A/round-4/contact-otp.png` (17 states), `A/round-4/contact-sign-in.png` (12 states).
- Changes per round: `A/round-1/changes.md`, `A/round-2/changes.md`, `A/round-3/changes.md`, `A/round-3-fix/changes.md`.
- Reviewed: all 17 OTP and 12 sign-in states (Claude self-audit + Codex, no open blockers).
- Not promoted. `ui-screens/` PNGs untouched. Native not changed.
- Needs Apurva (phase A): all closed by D-46 (see `A/NEEDS-APURVA.md`). Guard: `ui-screens/feedback/check-locked-specs.py` PASS.

## Final pass (D-47) — Reviewed — yet to be approved by Apurva

- Phase A (sign-in, OTP): `A/final/` — 34 OTP + 24 sign-in renders. Contact sheets `A/final/contact-otp.png`, `A/final/contact-sign-in.png`. Codex check: no blockers. Metrics: `A/final/metrics-*.json`.
- Phase B (faster sign-in offer, returning unlock): `B/final/` — 6 offer + 10 unlock renders. Contact sheets `B/final/contact-offer.png`, `B/final/contact-unlock.png`. Codex: no blockers.
- Phase C (Home): `C/final/` — 38 renders across 19 states. Contact sheet `C/final/contact-home.png`. Codex: no blockers.
- Guard: `ui-screens/feedback/check-locked-specs.py` PASS (L1–L9, titles, clipping, pinned footer, timer format; 17 OTP, 12 sign-in, 19 Home, 5 unlock, 3 offer states). `check-sources.mjs` PASS.
- Open items: `A/NEEDS-APURVA.md` (none), `B/NEEDS-APURVA.md` (platform retry device check), `C/NEEDS-APURVA.md` (none).
- Not promoted to `ui-screens/`. Nothing committed.

## Phase D — case page (rendered from `docs/concepts/2026-10-14-case-page/v2/concept.html`, D-51 addendum)

Status: **Reviewed — yet to be approved by Apurva.** Three review rounds (cap reached); no open layout blockers. Decisions D-46 to D-51 applied; the open items are in `D/NEEDS-APURVA.md`. `index.html` is not edited (it is rebuilt from the approved concepts later, as a separate step).

| Group | States (390 + 360) | Contact sheet (`D/final/`) |
|---|---|---|
| A · Case page | a-top, a-scrolled, a-order-details, a-rx-viewer, a-notes-typing, a-leave-sheet, a-releasing, a-back-blocked | `contact-case-page.png` |
| B · Call | b-calling, b-on-call, b-ended-early, b-missed-call, b-unavailable-sheet, b-post-gate-transfer, b-post-gate-cat4, b-post-gate-forward | `contact-call.png` |
| C · Sheets | c-callback, c-callback-error, c-skip-ha | `contact-sheets.png` |
| D · Prescribe | d-default, d-scrolled, d-error-dose, d-error-other, d-sos-on, d-notes-keyboard, d-discard-sheet, d-disable-sheet, d-header-white | `contact-prescribe.png` |
| E · End of case | e-prescription-confirmed, e-transferred, e-forwarded, e-callback-scheduled, e-patient-unavailable, e-availability-ended | `contact-end-of-case.png` |

Totals: 34 states × 2 widths = 68 renders (`D/final/`, metrics in `D/final/metrics.json`). Rounds: `D/round-1`, `D/round-2`, `D/round-3` (each with `metrics.json`, `codex-review-batch1–9.md`, `changes.md`). Checks: `check-sources.mjs` PASS, `check-locked-specs.py` PASS, zero console errors.

## Codex review of this matrix (2026-10-14, read-only, once)

- GAPS: added unlock.cancelled and unlock.platform-retry; split home.idle-expired / home.manually-ended.
- Counts corrected: Home 18 rows, total 66 rows.
- BLOCKERS raised against current source, not the matrix: otp.wrong-code digits and otp.default keyboard-open, home.no-cases selector. Kept as Step 2 build items (matrix states the target behaviour from D-44).
- Suggestion to label offer.shown-fingerprint / -face-id as variants of one state-map key: accepted (same state key, device wording differs).

## Preflight — complete before capture

- [x] Read current rules, mapping and relevant decisions (this session, Step 0).
- [ ] Exact message IDs/copy/fixture values confirmed; proposed copy labelled.
- [ ] Shared components/assets/tokens; no per-state style overrides.
- [ ] Trigger, clear condition, retained input, recovery and pending behaviour mapped (matrix above + state map).
- [ ] Every planned image earns a new capture under render policy.
- [ ] No real patient/doctor data or secrets in fixtures (use demo numbers, e.g. +91 98765 43210).

## QA evidence — not run yet

| Check | Result | Evidence / limitation |
|---|---|---|
| Standard size 390×844 @2x, correct font/assets | not run | |
| CTA position and text centring | not run | |
| 360-width / longest copy | not run | |
| Large text | out of scope for this loop (React Native later) | |
| Keyboard and safe-area reachability | not run | Headless only |
| Notice/field/toast rules | not run | |
| Loading duplicate prevention | not run | |
| Screen-reader association and announcements | not run | |
| HTML/native copy and state mapping | not run | Native not changed in this loop |
| Source-derived capture | not run | |

## Approval and promotion

- Status: layout-v2 states are **Reviewed — yet to be approved by Apurva** only after both Claude self-audit and Codex review report no blockers (Step 5).
- Approved by/date/message: pending Apurva (end of loop).
- Files promoted to ui-screens: none (`ui-screens/` untouched until approval).
- Known gaps / next action: Step 2 build phase A (sign-in, OTP) next.
