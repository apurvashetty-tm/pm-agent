## 1. Verdict

**Approve with changes** — launch scope is correct; conflicting routes, incomplete call rules and coverage gaps need fixing before building.

**References:** Plan = `docs/proposals/2026-11-05-prototype-build-plan-v3.md`; Checklist = `docs/reviews/2026-11-05-rebuild-checklist-v3.md`; Logic = `ui-screens/app-logic.md`; Decisions = `docs/context/decision_log.md`.

Source review only. `app/` does not exist; runtime, deployment and device behavior **unverified**. No files written. Current Claude report unread.

## 2. Blockers

1. **Pilot 7d has conflicting destinations.** Checklist 4.2 sends “16 **or 7d Pilot** → Confirm & forward → 10b”; 4.1 correctly sends missing-record confirmation to 7f. Direct 10b skips pending confirmation. **Source:** Logic §5, row 7f; §6; `calling-flow/data.js`, `B7d` → `J2` → `C7f`. **Change:** split routes: 16 → 10b; Pilot 7d → 7f, then reconcile record. Test both independently.

2. **Release rule drops its exception and case history.** Checklist 4.7 says release is refused once call request is accepted, without allowing release after doctor-side failure. Plan B13 also treats phone Back after Call as always blocked, overlooking closed-case → Home. **Source:** Decisions D-80.1: “unless the result is 3 or 4” and “never comes back once the patient has been reached”; Logic §4, Closed row. **Change:** specify release after 3/4 only while patient has never been reached; preserve blocked Back after an earlier answered call; closed-case Back goes Home.

3. **Gate and retry contract is incomplete.** Plan B8/B10 and Checklist 4.9 omit counted-call eligibility: “each at least ~10 s, within ~30 min” — Logic §5 / D-58.22, configurable starting values. Checklist 4.8’s blanket “hold + system retry” also loses D-83.6 exceptions: “unknown cause → plain hold; invalid number → not retried, flagged for data cleanup.” **Change:** add eligibility settings and boundary tests; distinguish live Pilot timing from partner-result eligibility; specify cause-based retry gaps/attempt settings and unlimited doctor retries from state 6. No production values invented.

4. **Build ownership is not exclusive.** Plan §5 assigns `d-rx-failed` twice and `s7e-leave-sheet` twice; shorthand also leaves Pilot 7d’s membership ambiguous. Early steps contain states whose real triggers arrive later. **Source:** Plan §5; `ui-screens/README.md`, state inventory; coverage table below. **Change:** publish explicit render-ID ownership, restore step 4’s v2 exclusion for Rx failed, and distinguish early visual checks from later interaction checks.

5. **Deployment packaging safeguards adopted in v2 disappeared.** Plan B1 still points to §4 for shared-file copying, but §4 no longer specifies assets, generated-copy exclusion or deploy-preview verification. Preview production branch/config selection is unspecified. Root `netlify.toml` publishes project root and checks latest commit message for `[deploy]`; that is not itself a PR-title check on arbitrary branch pushes. **Source:** v2 Plan §4; v3 Plan B1/§4; root `netlify.toml`; earlier review blockers on hosting. **Change:** restore explicit local/deployed asset layout, required shared assets, uncommitted generated copies, effective site configuration and branch/trigger wiring. Test marked and unmarked deploy cases, asset loading, and exclusion of project documents.

## 3. Should change

1. **Define generator normalization before using `data.js` as coverage authority.** It contains repeated pictures, grouped states, prose actions, diagram joins and backend-only outcomes. For example, `g0-calling-pilot` belongs to both `CALL` and `B0`; `c-skip-ha` appears under launch and A nodes. **Source:** Plan B4; Checklist 1.3; `calling-flow/data.js`, `states`, `edges`, `trunk`. **Change:** deduplicate picture ownership, retain scenario-specific transitions, resolve joins, preserve backend-only outcomes, and check against independent picture/behavior inventories. Self-consistency alone cannot prove completeness.

2. **Complete simulator controls.** B9 lacks explicit transfer-start failure and HA-no-answer outcomes, although these distinguish 15 from 14. “Record arrives / never arrives” also needs controllable delay and authoritative record contents. **Source:** Decisions D-83.9–10; Logic §5–6; `data.js`, `T13`, `C7f`, `HOLD`; Checklist 4.10/4.22. **Change:** expose these fixtures and test resulting states, including missing-record deadlines and late results.

3. **Give Prescribe and keyboard behavior actual acceptance lines.** SOS totals, dose choices and scrolling appear only in Checklist §0, without their own “How.” No dedicated run covers saving, disabling, re-enabling, discard/cancel or Rx recovery. **Source:** Logic §8–9; Decisions D-80.3, D-81.4/6; `feedback-state-map.md`, Prescribe. **Change:** add `run` checks for medicine mutations/printed output and `device` checks for focused-field visibility, bar hiding and restoration. Include View Rx remaining usable after case closure.

4. **Restore explicit resume data and pending-case reconciliation.** V2 B10 named reviewed medicines, notes and deadlines; v3 B12 only says “an open case.” A doctor can leave 7f or an after-hang-up forward while its record remains pending. **Source:** v2 Plan B10; Logic §3–5; `data.js`, `C7f`, `E15`, `EB3`; Checklist 4.12/4.13/5.7. **Change:** test case A’s late record while case B is active, reload/background recovery, preserved drafts/deadlines and session validity through an open case. Assert no update to wrong case.

5. **Add observable backend assertions.** Checklist omits saved Unavailable reasons, mismatch logging, and positive earnings/count updates after proven confirmation. **Source:** Logic §3, §7, §11; Decisions D-73, D-82.2, D-83.9. **Change:** assert reason persistence, mismatch event, and exactly-once count/earnings updates in mock state. No real analytics table required.

6. **Tighten test methods and acceptance wording.** “Every state matches” cannot prove journeys work. Checklist 1.7 needs `run` for placeholder navigation, alongside `eye`; 4.10/4.22 overlap and need named transition assertions; 5.1’s scenario/endings table is still unspecified. **Source:** Plan §5; Checklist introduction, 1.2, 1.7, 4.10, 4.22, 5.1; `docs/feedback-rules.md` §10. **Change:** assign test IDs, preconditions and expected results; make step-5 demo require complete entry → prescribing → confirmation → next-case run.

**Readiness accounting:** `2026-11-03-prototype-build-readiness.md` §3/§7/§8 changes are largely carried forward. Remaining gaps: simulator/settings details above; runtime SOS/keyboard acceptance; §3’s stale Logic §12 cleanup. Launch tables, mode defaults, new/retired IDs, G7, copy checks and D-88 answers are handled. Approval of draft P1–P5 remains intentionally pending.

## 4. Coverage tables

**Picture inventory:** 149 distinct render IDs; 146 launch and 3 A-only. **Origin:** read-only enumeration of `ui-screens/*/*_w390.png`, excluding contact sheets. No picture omitted under intended shorthand interpretation; duplicate ownership below.

| State / render ID | Where it should be | Where it is now |
|---|---|---|
| `d-rx-failed` | Step 3, Rx viewer; Checklist 1.2/6.2 | Steps 3 **and 4** |
| `s7e-leave-sheet` | One owner, preferably step 3; calling tests reuse it | Steps 3 **and 5** |
| `s7d-result-missing-pilot` | Step 6 only | Explicit step 6; step-5 `s7a–s7f` range needs exclusion |
| `a-confirm-busy`, `a-confirm-failed`, `a-back-blocked`, calling-related `a-offline-action` | Step 3 visual fixtures; step 5 interaction gate | Step 3, before calling exists; later test ownership unstated |
| `s-medicine-disabled` | Step 3 visual fixture; step 4 mutation test | Step 3, before Disable exists |
| `home_profile-case-open` | Step 2 visual fixture; case/session behavior checked later | Step 2; no explicit open-case logout/session run |
| `HOLD` / mismatch outcome, no picture | Mock foundation; explicit step-5/6 reconciliation tests | No explicit §5 owner; umbrella Checklist 1.2 and 4.1 |
| Behavior-only offer/unlock transitions, `signin.locked-number`, `case.reopened` | Steps 1 and 7 with explicit fixture/test mapping | Broad journey assignment only; Checklist 1.2/4.17/4.18/5.7 |
| `t08b`, `t11`, `t12` | Step 9, tagged A | Correctly deferred |

Sources: Plan §5; `ui-screens/README.md`; `docs/feedback-state-map.md`; `calling-flow/data.js`.

| Journey / path | Checklist coverage | Gap or result |
|---|---|---|
| Sign-in → OTP → offer/unlock → Home → case → Prescribe → confirm → next case | 4.17–4.18, 5.2, umbrella 1.2 | No explicit complete run, including medicine review and next-case reset |
| Cat4, Knowlarity → result → 8a → 10a | 4.2, 4.11, 5.1 | Calling path covered; explicitly assert no state 5 and full next-case loop |
| HA skipped by customer / system, Ozonetel → 5 → 8a → 10a | 4.2–4.3, 4.11, 5.1 | Covered; preserve separate scenario runs |
| Pilot HA free: B0 → B1 → B2 → 13 → 14 | 4.2, 4.10, 5.1 | Covered; HA-no-answer variant needs simulator/test |
| Pilot no HA free: B2 → B3 → hang-up | 4.1–4.2, 4.19 | Live/ended UI covered; later-record reconciliation needs explicit continuation |
| Transfer cannot start: 13 → 15 → hang-up | 4.10, 4.19, 4.22 | B9 lacks explicit trigger |
| Doctor failure → 3/4 → retry or release | 4.7–4.8 | Release exception/history incorrect; blocker 2 |
| Patient failure → 9 | 4.8 | Cause-specific retry exceptions missing; blocker 3 |
| Short call → 6 → repeat call / Callback | 4.9, 4.15 | Missing counted-call boundaries and explicit unlimited retry assertion |
| Unknown end → 7b → Still talking → repeat question; known end → 7c | 4.11–4.12 | Repeated question and both 7c result-found/result-missing branches not explicit |
| Cat4/Pilot 7d → confirm, Callback or Unavailable | 4.1–4.2, 4.15; §0 | Pilot confirm conflict; reason persistence and sheet cancellation not explicit |
| Skip HA on B1 → 17 → 8a / 6 / 9 / 7c–7d; Skip on 16 → confirm | 4.4, 4.10 | “Normal result path” is broad; enumerate branches and distinguish live/ended skip |
| Pending medicine; failed/uncertain confirm | 4.5–4.6 | Covered broadly; repeat across launch confirm routes, not only 8a |
| Availability expiry, foreground return, reopen | 4.13, 4.16, 5.7; step 7 | Add open-case session preservation and previous-case pending-record reconciliation |
| Prescribe / Disable / re-enable / discard; Rx failure/retry | Umbrella 1.2/6.2 | Dedicated interaction runs missing |

Sources: Logic §2–11/§14; `calling-flow/data.js`, corresponding named states/actions/events.

## 5. Nice to have

- Record source revision and generated-map version in review evidence, extending Checklist’s build-version requirement — Plan B4/B15; Checklist introduction.
- Restore concise install instructions and explicit manifest identity/scope fields dropped from v2 §4; retain existing device acceptance — Plan §4; Checklist 5.5–5.9.

## 6. Source errors

- **Frozen Skip HA picture uses version-A background.** `c-skip-ha_w390.png` visibly shows transfer script; `case.html` recipe opens over state 12. Launch B1 needs neutral script, and state 16 has no live script. Exact whole-picture comparison cannot validate every launch context without an approved comparison exception. Sources: `ui-screens/README.md`, Skip HA row; Logic §6; Decisions D-87.
- **Diagram retry edges lose Pilot context.** `data.js` sends `C6 → C0` and `C7b → C0`, but `C0.types = "CK"`; unskipped Pilot retries must retain Pilot flow. Treat diagram as reference, not executable transitions. Sources: `data.js`, `edges`, `C0`, `B0`; Logic §5–6.
- **Logic retains superseded rules.** §5 still puts Pilot Non-Value Meds among result-only cases; §4 retains route-specific pre-B scripts; §13 still describes Callback retained in Transferring. These conflict with D-83/D-87 and later applied states.
- **Locked summary is stale.** `project_truth.md` §3–5 retains A routing, pre-D-80 release wording and Ops escalation for missing records; brief’s D-80/D-83/D-87 decisions supersede these.
- **Staleness cleanup remains incomplete.** Logic §12 retains resolved flags/obsolete transfer-screen question; README retains retired 15b styling and pending-approval text; `open_questions.md` OQ-002 says “no hold,” contrary to D-83.6. Readiness §3’s cleanup row remains unresolved.

## 7. P1–P5

| Point | View | Why |
|---|---|---|
| P1 — build order | **Disagree as written** | B-first order works; ownership overlaps and later-dependent tests need explicit handling. |
| P2 — HTML/JS | **Agree** | Fits prototype; retain HTTP serving, packaging and test harness. |
| P3 — generated calling map | **Agree with changes** | Normalize diagram data; independent inventory and scenario checks remain necessary. |
| P4 — mock settings | **Agree with additions** | Listed mock values are labelled; counted-call eligibility and retry-attempt settings are missing. |
| P5 — review milestones | **Agree** | Works with explicit per-step evidence and complete step-5 demo gate; approval remains Apurva’s. |

## 8. Parked

Production telecom contracts, HA allocation, real retry tuning, native authentication/platform certification, real analytics storage, Help/bell content, version A and old-site cutover details. No screen or product-logic changes proposed.