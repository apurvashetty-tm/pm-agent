# Doctor portal — prototype build readiness

**Status:** DRAFT for Apurva, 2026-11-03 — **answers so far in §11** (read first). Read-only check; nothing else was changed.
**Checked against:** project `CLAUDE.md`, `session_handoff.md` (latest: 2026-11-03 08:05), `backlog.md` (incl. the uncommitted D-84 amendment), `decision_log.md` D-79 → D-84 (incl. "amended 08:33"), `docs/proposals/2026-10-29-prototype-build-plan.md` (v2), `docs/reviews/2026-10-29-rebuild-checklist.md` (v2), plus `ui-screens/README.md`, `app-logic.md`, `open_questions.md`, root `netlify.toml`.
**Copy round:** the terminal copy round is changing `ui-screens/`, `messages.json`, `app-logic.md`, `feedback-state-map.md` and the copy-audit files now. Rows on those files are judged on today's text and must be re-checked once it is merged.

**Key:** ✅ ready · ⏳ ready once the copy round is merged · ❌ missing · ⚠ outdated by a later decision

---

## 0. Summary

- **Screens, app logic, design system and test numbers are in place.** The calling journey is closed (D-83) and the copy round finishes the wording.
- **The build plan and checklist are a week old (v2, 29 Oct) and never approved.** D-80 → D-84 changed them in a dozen places — most importantly **Fallback B first** (plan step 6 still builds A first and lists retired state 15b), Back/Release (D-80), and the bare link (D-79 P3 reversed the plan's recommendation). Both need a v3 before anything is built.
- **D-79 puts the build after the storyboard review (Part C), PRD, engineering spec and test cases.** None of the three documents exists; Part C is open. This is the main question (Q1).
- 5 pointed questions in §9. Everything else can be fixed without you.

---

## 1. Start gate

| # | Item | Status | Note |
|---|---|---|---|
| G1 | Screens promoted and frozen | ✅ | D-78, re-frozen D-82; D-83 applied by the calling round (149 states, guards 0, merged PR #25). |
| G2 | `app-logic.md` approved | ✅ / ⚠ | Approved at D-78/D-82; D-83 added as §14. But §6 and §11 still describe the A flow (see §3). |
| G3 | `feedback-state-map.md` in line with app-logic | ✅ | Aligned at D-79; D-83 lines present (`call.waitingForHangup`, 15b retired). |
| G4 | Copy round merged | ⏳ | D-84 amended: all decided copy fixes applied and re-rendered in one round. Build waits for it. |
| G5 | Build plan + rebuild checklist approved | ❌ | Both DRAFT v2; P6b and P9 never answered. Need v3 (§7, §8). |
| G6 | Storyboard review Part C (entry → Home → case + Prescribe) | ❌ | D-79 (b): every journey reviewed before it is documented or built. Only calling is closed (D-83). → **Q1** |
| G7 | PRD, prototype engineering spec, test cases | ❌ | D-79 (c)–(d): build from the spec, checked against the test cases. None exist (`Doctor_Portal_Developer_PRD.md` is the stale 8-Oct one). → **Q1** |

## 2. Screens (`ui-screens/`)

| Journey | Pictures | Status | Note |
|---|---|---|---|
| Sign-in | 12 states | ⏳ | CA-04 wording. Part C open. |
| OTP | 17 | ⏳ | CA-04, CA-05, CA-26. Part C open. |
| Returning unlock | 7 | ✅ | Part C open. |
| Faster sign-in offer | 6 | ✅ | Incl. screen-lock fallback (D-64). Part C open. |
| Home + Profile | 22 | ⏳ | CA-06. Part C open. |
| Case page (non-calling) `a-*`, `s-*`, `e-*` | 22 | ⏳ | CA-02 empty case, CA-11, CA-22 Stay. |
| Prescribe `d-*` | 23 | ⏳ | CA-16 – CA-18, CA-24. P-03 (injection units) — check it was settled before the PRD medicine table (D-80 pt 3). |
| Calling — Cat4 / HA skipped (1 – 10a, 7b – 7f, 8c, callback sheets, 9) | — | ⏳ | D-83 applied. CA-07/08/09/10/12 remove or change outcome-card lines (layout change → re-rendered). |
| Calling — **Fallback B** (`g0`, `g1`, `g2`, `g3b`, `g3b-after-hangup`) + shared 13 – 17, `s7d-result-missing-pilot` | — | ✅ | Complete for B. `t15-after-hangup` new. |
| Calling — **A only** (`t11`, `t12`; probably `t08b`) | — | ✅ | Kept as the later version. Whether `t08b` is reachable in B → **Q2** |
| Retired | `t15b` | ✅ | Removed (D-83). Plan step 6 and checklist 4.10 still list it (⚠). |
| Help / bell destinations | — | ❌ | Shown on screens, not designed (backlog §4b). Plan P9 placeholder never approved → **Q4** |

## 3. App logic (`ui-screens/app-logic.md`)

| Item | Status | Note |
|---|---|---|
| §2 sign-in/OTP, §3 Home, §4 case journey, §7 callback/unavailable, §8 Prescribe, §9 notes/Rx, §10 errors | ⏳ | Up to date to D-83; copy round updates quoted text. |
| §5 calls and gate, B as the launch Pilot flow, §14 D-83 summary | ✅ | |
| §6 final-button table | ⚠ | Still the A table (Pilot Value Meds → Confirm & transfer on the live call). In B the live call shows Confirm prescription and the route is decided at B2. Fix after the copy round merges (not mine to edit now). |
| §11 scenario table (5 scenarios) | ⚠ | Same: built around A. B needs scenarios by **HA free / no HA free at the tap**, plus who-ended (16/16b/16c) → **Q2** |
| §11 test numbers and OTP codes | ✅ | 9000000001–05; 1234 / 0000 / 9999 (D-79). |
| Call simulator outcomes | ❌ | §11 lists connected / no answer / didn't connect / switched off / wrong number. D-83 needs: doctor-side vs patient-side failures (3/4 vs 9), partner (Ozonetel sends hang-up → 5; Knowlarity doesn't), record under the gate / no record (unproven confirm), callback refused (leg 2 not answered), release refused after the call was accepted (D-80). Mock design, not a product question — goes in the spec. |
| Settings with mock values | ❌ | Gate 50 s ✅; 3-min no-result timeout ✅; **record wait time** (D-83 "a setting", was 30 min in D-73), hold-retry gaps, polling interval (OQ-030) — need labelled `[MOCK ASSUMPTION]` values in the spec. |
| §12 open questions list | ⚠ | Still names OQ-021 "transfer-failed screen" and Flags 2/3/5/6 — tidy with the §6 fix. |
| Open product points the build must not invent | ✅ (as open) | OQ-035 empty-case destination (copy placeholder "Ops team will check it"), OQ-025 restoring an open case, OQ-030/031/032, Knowlarity call-ended event, partner for Pilot Non-Value Meds. All `[OPEN DECISION]` / mock; none blocks the prototype. |

## 4. Copy

| Item | Status | Note |
|---|---|---|
| Copy rules v2 (26 rules) | ✅ | D-84. |
| Copy annex final list, applied and re-rendered | ⏳ | Copy round (FIX-BRIEF). Annex becomes the PRD's record. |
| `messages.json` → `messages.js` + `native/messages.ts` | ⏳ | Single source; regenerated by `build-messages.mjs`. |
| Copy checks in `check-sources.mjs` (rules 4, 5, 11, 13, 14, 19, 21 – 23) | ⏳ | Added in the copy round. Becomes checklist row 3.7. |
| Labels still typed in code (sheet labels, some button labels) | ⚠ | Accepted at D-78; the copy round moves only those with a natural key. The rest move into the registry in the build (backlog §3, plan B6). |

## 5. Design system

| Item | Status | Note |
|---|---|---|
| `design-system/` (`truemeds.css`, `icons.js`, tokens, RULES §7 – 9) with D-82 changes (icon sizes by button, pinned bar everywhere, notice band, page margin 16, status line) | ✅ | Central; the build uses only `--tm-*` / `.tm-*`. |
| Lockup `brand/truemeds-for-doctors.svg` + `check_lockup.py` | ✅ | |
| Home-screen icon `design-system/logo/truemeds-icon.svg` | ✅ | P6 settled. Background colour (P6b) open → **Q4** |
| Design System artifact republish + React Native notes (backlog §2j) | ❌ | Not needed for the prototype build; due after the copy round. |

## 6. Test data and checks

| Item | Status | Note |
|---|---|---|
| Synthetic fixtures (5 scenarios, fallback B, stress: 10 medicines, long names, empty case) | ⚠ | Exist inside the render recipes; scenario list must be redone for B (Q2). |
| `check-locked-specs.py` (incl. 360×640 small phone), `check-sources.mjs`, `check_lockup.py` | ✅ | Run on `ui-screens/` today. |
| `docs/layout_check.py` | ⚠ | Still opens the old `index.html`; plan step 0 points it at `app/` on a local server. |
| Screenshot compare | ✅ | Calling round's capture method (390 + 360, fixed clock, frozen animations); promotion-round compare. Spinner frames on a mask list. |
| Regression gate G7 (all standards + final decisions) | ✅ | D-82 pt 8; add to every build step (checklist §7). |
| Test cases (QA document) | ❌ | D-79: absorbs the rebuild checklist + test numbers. → **Q1** |

## 7. Build plan (2026-10-29 v2) — what later decisions changed

| Plan item | Status | What changed |
|---|---|---|
| Inputs "decision log D-01 – D-73" | ⚠ | Now D-01 – D-84. |
| §2 start gate | ⚠ | Items 1 – 3 done; add copy round merged, Part C (or Q1 answer), plan/checklist v3 approved. |
| B1 – B3, B5, B9, B12, B13 | ✅ | Unchanged. |
| B4 one `?s=<render-id>` per state | ✅ | Add `g0`, `t15-after-hangup`, `g3b-after-hangup`, `c-callback-refused`, `s7d-result-missing-pilot`; drop `t15b`. |
| B6 copy | ✅ | Plus: copy annex already applied; `check-sources` copy rules must pass on `app/`. |
| B7 polling, B8 clock | ⚠ | Add D-83: 5 only after a known hang-up (Ozonetel), Cat4 stays on Calling; 7b only when the end can't be known; record wait time setting. |
| B10 remembering an open case | ✅ | Prototype mock; production still OQ-025. |
| B11 phone back | ⚠ | "Leave sheet before the first attempted call" → **D-80:** Back only while a call button is offered (1, 3, 4); hidden from the tap on Call for every case type; toast after. |
| §4 modes: "bare link = demo; review via `?review=1`" | ⚠ | **D-79 P3:** bare link = **review**; demo via `?demo=1`; installed app opens demo. |
| §4 hosting: new site deploys the project branch | ⚠ | Since 2026-11-03 the current site deploys **on demand only** (`[deploy]` in the PR title, credits). Plan doesn't say how the new site deploys → **Q3** |
| §5 build order | ⚠ | Fallback B first; 15b gone — new order in §8 below. |
| §8 P3, P8 | ✅ | Answered by D-79 (P8: old link retired after approval; redirect recommended — confirm later, not now). |
| §8 P6b icon background, P9 Help placeholder | ❌ | Never answered → **Q4** |
| §8 P1, P2, P7 ("both reviewers agree") | ❌ | Never formally approved; covered by approving v3. |

## 8. Rebuild checklist (v2) — lines outdated

| Line | Now | Decision |
|---|---|---|
| §0 table | Add rows for D-80, D-81, D-82, D-83, D-84 (below) | — |
| 4.1 Confirm before the gate | Keep; add 7f/forwards **confirmed only on the partner's result** (unproven confirm → not confirmed, hold and retry, no ₹20) | D-83 pt 9 |
| 4.2 final button per case type | Rewrite for B: B1 Confirm prescription → B2 → 13/14 or B3; 16 Confirm & forward; 7d by route | D-83 pts 1, 8 |
| 4.4 Skip HA | Add B1 (and 8b only if A) | D-83 |
| 4.7 leaving | Back only while a call button is offered; hidden from the tap on Call; release refused once the call request is accepted (→ `a-release-failed`); Release → Home; empty case releases without a sheet | D-80, D-83 pt 4 |
| 4.8 leg 2 failed → Patient unavailable | Add: 3/4 only doctor-side; patient-side → 9 whenever detected; 9 = hold + system retry | D-83 pts 5, 6 |
| 4.10 calling states | Remove `t15b`; add `g0`, `t15-after-hangup`, `g3b-after-hangup`, `s7d-result-missing-pilot`, `c-callback-refused`; tag A-only states | D-83 |
| 4.14 callback | Callback only on 6 and 7d; refused when leg 2 never answered | D-83 pt 2 |
| 4.18 closed case | 15 / B3: "Waiting for the call to end…" while live, Request next case · Back to Home only after the hang-up (replaces "Request next case checks the call has ended") | D-83 pt 10 |
| New | 5 only after a known hang-up; 7b only when the end is unknown | D-83 pt 7 |
| New | Empty case: no Call patient, notice at the top, Release case | D-80 pt 4, D-83 pt 4 |
| New | SOS daily total in the printed line; dose by form (tablet ½·1·2, capsule 1·2); scroll to first error; keyboard rule (pinned bar hides) | D-80 pt 3, D-81 |
| New | One pinned action bar; notice band in the bar; sheets cover the bar; small phone 360×640 on every state; G7 regression gate | D-82 |
| 3.1 / 3.7 copy | Copy rules v2 checks in `check-sources.mjs` pass on `app/` | D-84 |
| 5.2 demo mode | "Demo = default link" → demo via `?demo=1`; installed app = demo | D-79 P3 |
| 5.10 hosting | Add the deploy trigger (Q3) | 2026-11-03 Netlify rule |

### Build order (proposed for v3 — Fallback B first)

| Step | Journey | Pictures |
|---|---|---|
| 0 | Shell: frame, navigation + phone back (D-80), state, storage, clock, `MSG()`, mock server + call simulator (D-83 outcomes), mock unlock, state map, review panel (`?demo=1` / review default), install, checks on `app/`, preview site | — |
| 1 | Sign-in, OTP, offer, unlock | `sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/` |
| 2 | Home, availability, Profile, Log out | `home/` |
| 3 | Case page (incl. empty case, release failed, Rx failed) | `case/a-*`, `s-*`, `prescribe/d-rx-failed` |
| 4 | Prescribe and Disable | `prescribe/d-*` |
| 5 | Calling, Cat4 and HA skipped → **phone demo ready** | `t01`–`t10a` (not `t08b`), `s7*`, `c-callback*`, `e-callback-scheduled`, `e-availability-ended` |
| **6** | **Pilot, Fallback B (launch flow):** B1 before/after the gate, B2, 13 → 14, 15 + after hang-up, B3 + after hang-up, 16 / 16b / 16c → 10b, 17, Skip HA sheet, 7d Pilot | `g0`, `g1`, `g2`, `t13`, `t14`, `t15*`, `g3b*`, `t16*`, `t10b`, `t17`, `c-skip-ha`, `s7d-result-missing-pilot` |
| 7 | Across journeys (availability ends mid-case, reopen into open case, backgrounded call) | app-logic §3 – 4 |
| 8 | Final pass (copy parity, G7) → approval | all |
| 9 (later) | **Pilot A:** live-call route labels | `t11`, `t12`, (`t08b`) |

## 9. Questions for Apurva

**Q1 — Build now, or after the documents?** D-79 says: storyboard review Part C → PRD → engineering spec + test cases → build. None of those exist. Options: (a) keep D-79 as written; (b) update the plan and checklist to v3 now (they are the spec's foundation and the test cases' first draft), build step 0 (shell, no screens) right after the copy round, and build each journey only once its Part C review is closed. **Recommendation: (b)** — step 0 doesn't depend on any screen, and calling (the biggest journey) is already closed.

**Q2 — Pilot scenarios in Fallback B.** In B the route is decided at B2 by whether an HA is free (transfer → 13/14, none → B3). My reading: B has no separate "Value Meds" / "Non-Value Meds" scenarios at the start of the call — they become **"HA free at the tap"** and **"no HA free"**, and `t08b` (8b, Confirm & forward on a known non-value route) is A-only, like 11/12. Is that right, or does a Non-Value Meds case skip B2 and always forward?

**Q3 — New preview site deploys.** Your 3-Nov rule makes the current site deploy only with `[deploy]` in the PR title. Should `truemeds-doctor-app-preview` follow the same rule (recommended — you choose when to spend credits), or deploy every push to the project branch while we build?

**Q4 — Two old plan points.** P6b: home-screen icon on a **white** background (recommended — a blue tile hides the blue of the mark)? P9: Help (and the bell) show where the pictures show them and open a plain placeholder marked `[OPEN DECISION]` (recommended)?

**Q5 — Part C scope.** Is the storyboard review still needed for all four journeys (entry, Home, case, Prescribe), or have the five-lens audit (D-80/D-81) and the fix round (D-82) covered enough that some can be closed without a walkthrough? This decides how much of the build has to wait.

## 10. Not done here (on purpose)

No edits to `ui-screens/`, `messages.json`, `app-logic.md`, the state map, the copy-audit files, the plan, the checklist, the decision log or the backlog. No commits. After the copy round merges: re-check every ⏳ row, then fix §6/§11/§12 of app-logic and write plan + checklist v3 from your answers.

Also noticed (housekeeping, no decision needed): `backlog.md` §1 – §2c still show unticked items that D-78/D-82 closed; `CLAUDE.md` "Current state" says 145 states (now 149).

## 11. Answers so far (2026-11-03, evening) — start here in the build thread

| Q | Answer | Source |
|---|---|---|
| Q2 Pilot scenarios in B | **B is the one Pilot flow.** Non-Value Meds also go through the HA check (B2): HA free → transfer, none → forward (B3). `t08b`, `t11`, `t12` are A-only. Demo scenarios: Cat4 · Pilot HA free · Pilot no HA free · HA skipped (customer / system). | Apurva in chat; backlog §2k (record in the decision log) |
| A-only screens | **Left out of the first build** (built later, as version A). | Apurva; handoff 13:00 |
| Skip HA on a live call | **D-85:** 17 shows the note + "Getting call result…", then the normal result path (8a / 6 / 9 / 7c–7d). | D-85 |
| Copy round | Merged (D-84, commit 427dab5). All ⏳ rows in §2 – §4 are now ✅ — re-check against the merged files at the start of the build thread. | commit 427dab5 |
| Calling flow for Engineering | Live page `calling-flow/` (doctor-portal site `/calling-flow/`): every calling state, trigger, button, event and rule, with the happy path per case type. Use it as the calling-flow reference for the build. | `docs/reviews/2026-11-03-calling-flow-site/` |
| **Still open** | **Q1** build now (step 0 shell) vs after PRD / spec / test cases (rec: plan + checklist v3 now, shell first) · **Q3** preview-site deploy rule (rec: `[deploy]` only, as today) · **Q4** icon background white, Help / bell placeholder · **Q5** storyboard review Part C scope. Also app-logic §6 / §11 tables still describe A (fix with backlog §2k). | — |
