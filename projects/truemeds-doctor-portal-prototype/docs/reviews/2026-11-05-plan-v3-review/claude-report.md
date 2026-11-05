# Claude Code review — build plan v3 + rebuild checklist v3

**Reviewer:** Claude Code (terminal), independent of Codex. Codex was not opened by this review.
**Date:** 2026-11-05
**Read:** BRIEF.md · `docs/proposals/2026-11-05-prototype-build-plan-v3.md` · `docs/reviews/2026-11-05-rebuild-checklist-v3.md` · `ui-screens/app-logic.md` (whole) · `calling-flow/data.js` · `docs/feedback-state-map.md` (keys and rows) · `ui-screens/README.md` · `docs/context/decision_log.md` D-78 → D-88 · `docs/proposals/2026-11-03-prototype-build-readiness.md` · `docs/context/open_questions.md` (OQ-017, 019, 024, 033, 035) · `docs/context/backlog.md` §2k–2l · root `netlify.toml`.
**Not done:** I did not open the PNG pictures. Picture coverage is judged from file names and the state IDs in the sources. Where a claim depends on what a picture shows, it says so.

---

## 1. Verdict

**Not ready.** The structure is sound (step order, Fallback B first, state map generated from `data.js`, one shared core). Six blockers stop a clean build. Three of them need Apurva's decision because the sources contradict each other. The rest is text work.

---

## 2. Blockers (must change before building)

**B-1. The Back rule has three readings. Apurva decides.**
- Source: D-80 pt 1 says Back stays on 1, 3 and 4 and "never comes back once the patient has been reached"; it is hidden from the Call tap. app-logic §4 (Leaving a case) and `feedback-state-map.md` `case.back-before-call` say "hidden from the Call tap **for the rest of the case**". D-79 item 1 says Back works during Calling until the patient answers. `data.js` E3 (states 3 and 4) shows "Call again · header Back".
- Problem: states 3 and 4 are only reached after a Call tap. Under "rest of the case" Back can never appear on them, which contradicts D-80 and the pictures' bar text. Plan B13 and checklist 4.7 copy one wording and do not notice.
- Change: Apurva to choose. My recommendation is D-80 as written: Back hidden from the Call tap while a call is running; it returns on 3 / 4 only if the patient was never reached. Then fix app-logic §4 "for the rest of the case" and `case.back-before-call` to say the same, and state the rule once in plan B13 and checklist 4.7.

**B-2. Is a Pilot "Confirm & forward" confirmed on the partner's result or at once? Apurva decides.**
- Checklist 4.1 says "7f and **every forward** are confirmed only on the partner's result … no ₹20". `data.js` T16: "Confirm & forward → 10b Forwarded to HA" with no wait. D-83 pt 9 names only **7f and forwards from 15 and B3**, not 16.
- Change: decide whether 16's forward waits for the record. If it does, add a 7f-style wait to `data.js` T16 and app-logic §5. If not, narrow checklist 4.1 to 7f, 15 and B3. Either way add a line for the ₹20 outcome.

**B-3. Where does a Pilot 7d confirm end? Apurva decides; source and checklist disagree.**
- `data.js` B7d → J2 → C7f: Pilot 7d "Confirm & forward" → 7f → on record over the gate → **E10a "Prescription confirmed"**. Checklist 4.2 says "7d Pilot → Confirm & forward → **10b**". Those cannot both be right. A forward that ends as "Prescription confirmed" on the Pilot route looks wrong.
- Change: decide the ending (10a or 10b), then fix `data.js` (C7f edge) and checklist 4.2.

**B-4. Prescribe has no test lines at all.**
- Checklist §4 covers calling, Home and sign-in only. Step 4 ("Prescribe and Disable") therefore has nothing to pass except picture compare. Rules with no line: dose choices by form (app-logic §8 table), "Choose a dose for at least one time of day", "Enter the dose in ml/units", "Use numbers only" checks, scroll-to-first-error (D-81 F16), disabled-medicine note and re-enable (D-81 F17), SOS daily total in the printed line (D-80 pt 3, D-81 F14), Disable removes the medicine from the order (app-logic §8), Discard-changes sheet (D-54). Checklist §0 mentions some of these as "carried-over" but nothing tests them.
- Change: add a "Prescribe" group to checklist §4 (about 10 run/auto lines, one per rule above). Add Rx viewer lines too (app-logic §9: zoom 50–400 %, rotate, reset; load failure → Try again; ✕ always closes; disabled while confirming).

**B-5. Hosting for the second Netlify site is not specified and would break the shared design system.**
- Plan §4 says the new site has "its own settings file inside `app/`" and "only `app/` published". Plan B1 says "a small deploy step copies the shared files in". Root `netlify.toml` (current site) does this with `command = "rm -rf … && cp -R design-system …"`, `publish = "projects/truemeds-doctor-portal-prototype"`, and the `ignore` line that makes deploys happen only with `[deploy]` in the PR title.
- Problem: `app/` links the central design system as `../../design-system/…`. If only `app/` is published, that path is missing on the preview site. A `netlify.toml` inside `app/` is not read unless it is the site's base directory. The `[deploy]` rule (D-88 pt 3) lives only in the root file, so the new site has no deploy gate as written.
- Change: write the second site's base directory, publish directory, build command (copy `design-system/` into `app/`, as the root file does) and `ignore` line into plan §4 and step 0. Add a checklist line in §5.10 or §5.5 that the preview loads `truemeds.css`, `icons.js` and the icons from the deployed link. I did not verify Netlify's behaviour with a second site from the same repo (no access) — unverified.

**B-6. The settings list (plan B10 / checklist 3.2) misses values the sources set, and the demo timing conflicts with a rule.**
- Missing from B10 (all in app-logic or the decision log): minimum connected-call length ~10 s and talk-time window ~30 min (app-logic §5, D-58 pt 22); 7b repeat every 3 min (app-logic §5); hold-retry **attempts** (D-83 pt 6 says "gaps and attempts are settings"; only the gap is listed); OTP lock 15 min, OTP window 10 min, resend waits 30 / 60 / 120 s (app-logic §2 — all `[MOCK]`, OQ-017); near-expiry warning 5 min (app-logic §3, `[MOCK]`); returning-unlock fallback after 3 failures (app-logic §2, `[MOCK]`); polling "within about 5 s" (app-logic §5, D-58 pt 14 — plan uses 3 s without saying why).
- Conflict: plan §1 demo = "short call about 8 s … whole demo clock faster". app-logic §5 says each connected call must be at least ~10 s. An 8 s demo call fails that rule unless the 10 s minimum is also scaled. Plan B8 does not say which values scale.
- Change: add the missing values to B10 with `[MOCK ASSUMPTION]` labels, and list each one that the demo speed-up scales (gate, 3-min timeout, 30-min record wait, 15-min hold gap, 10-s minimum, 30-min window, 3-s polling). Make checklist 3.2 name the same list.

**B-7 (must fix before step 5 test writing). Coverage gaps by state and flow.** See §4 (state table) and §5 (flow table). Two states are duplicated in plan §5, and behaviour-only states from `feedback-state-map.md` have no build step at all, so checklist 1.2 cannot pass as written.

---

## 3. Should change

1. **Checklist 4.2 has the wrong 7d Pilot ending** (see B-3).
2. **Checklist 4.7 leaves out the release exception.** D-80 pt 1 and OQ-024: Release is refused once our call request is accepted, *unless the result is 3 or 4*. The line gives only the refusal.
3. **Knowlarity call-ended event is stated as fact.** Plan B7 ("Cat4 on Knowlarity stays on Calling until the result") and checklist 4.11 treat it as settled. `data.js` C0 and D-83 "Engineering" list it as **open**. Mark it `[OPEN]` in both, and make it a switch in the call simulator (B9) so either answer can be tested.
4. **Checklist has no step column.** "A step passes only when every line that applies passes" cannot be checked: nothing says which lines apply to step 3 or step 5. Add a "Step" column (0–9) to every line in §3–§6.
5. **Checklist 1.5 open-question list is incomplete.** Add OQ-001 (timer on hold), OQ-017 (OTP values), OQ-019 (no-cases re-check), OQ-020 (pooled callback), OQ-021 (support contacts), OQ-023 (re-offer faster sign-in), OQ-024 (release backend — needed for line 4.7), OQ-029 (volume figures, if used).
6. **Missing run lines (each is a rule in the sources):**
   - Log out sheet, and "You can log out after this case is closed" during an open case (app-logic §3).
   - Session stays valid through an open case — no OTP over a live case (OQ-017, confirmed 2026-10-12).
   - "Request next case → next case" (plan step 5 names it; no line tests it).
   - Request accepted before the window ends is honoured even if the case arrives after (app-logic §3).
   - One phone active at a time (app-logic §3).
   - Returning unlock: "Not you? Switch account" and 3 failed tries → OTP (app-logic §2).
   - Faster sign-in "Not now" → Home (offer.not-now).
   - Callback sheet validation: "Pick a date and a time." / "Pick a date." / "Pick a time." (app-logic §7).
   - Notes survive a dropped connection (app-logic §9).
   - Unavailable reason sheet on 7d → saves the reason → 9, for both Cat4 and Pilot (app-logic §7, `data.js` C7d/B7d).
   - 7b "Still talking" loops back to Calling and asks again after 3 min (`data.js` C7b).
   - Pilot call ends before the gate → result path → 6 or 9 (`data.js` B0 → J3 → RES). Not in any line.
   - 6 "Call again" loops and keeps adding talk time (`data.js` C6 — 4.9 only partly covers it).
   - 13 Transferring: the doctor's leg drops by itself once the HA's phone rings (`data.js` T13 rules).
   - 16 with Skip HA → 10a and 17 with Skip HA on a live call → result path: 4.4 has both but says "normal result path" with no test of each branch.
7. **Checklist 4.13 / 4.19: "gate worked out right" is not testable as written.** Name the case: patient answered at T, app backgrounded for 60 s, gate passes at T+50 s, Confirm appears on return.
8. **Checklist 4.16 "time formats" is vague.** Use app-logic §3: h:mm:ss from one hour (1:00:00), m:ss below (9:42), 0:00 at end, "+ Add time" does not move the timer (A-09), 15-min minimum, 15-min wheel steps.
9. **Checklist 3.3 names "D-50 labels" without listing them.** List them: Confirm prescription · Confirm & transfer · Confirm & forward · Skip HA (plus Callback, Unavailable, Release case, Request next case, Back to Home). Note that CLAUDE.md still says "Skip HA call" (pre-D-70 wording).
10. **Checklist 6.2 ("offline, loading, failure states … reachable and correct")** is not a testable line. List the states (`feedback-state-map.md`, 122 rows, 6 pattern codes) or point to a generated list from the state map.
11. **Plan B4 / checklist 1.2 — behaviour-only states need IDs and a step.** The state map must carry them with a `?s=` ID even though they have no picture. Examples are in §4 below.
12. **Plan §5 step 1 depends on later steps.** "Unlock → Home" and Profile toggle (checklist 4.18) need Home (step 2). Say which lines of step 1 are run against stubs.
13. **Plan §5 step 3 pictures that need calling triggers.** `a-confirm-busy`, `a-confirm-failed` and `a-back-blocked` can be reached by `?s=` in step 3 but their real triggers exist only in steps 5–6. Say so in the step's "done when".
14. **Plan §5 P5 review points.** Step 6 (Pilot, Fallback B) is the riskiest step: seven new states, and D-83 / D-85 changed it after the last approval. Add Apurva's phone check at step 6, not only step 5.
15. **Plan B15 / step 0 "state map ↔ data.js check passes".** The check only proves the two match. It does not prove `data.js` is right. Two items are doubtful (see §6: the C7f ending, and retired keys still in the state map). Add a line that the state map is reviewed against app-logic §5 once more before step 1.

---

## 4. Coverage — states (brief question 1)

Picture count check: 390 pictures on disk = **149** (case 62, prescribe 23, home 22, otp 17, sign-in 12, faster-signin 6, returning-unlock 7). Plan §5 names all 149 at least once, after the wildcard expansion. The problems are duplicates, one ambiguous range and behaviour-only states.

| State / render ID | Where it should be | Where it is now | Action |
|---|---|---|---|
| `case/s7e-leave-sheet` | Step 3 (leave sheet, case page) | Step 3 **and** step 5 (inside `s7a`–`s7f`) | Keep in step 3; take it out of the step 5 range |
| `prescribe/d-rx-failed` | Step 3 (Rx viewer state, app-logic §1 lists it under Rx viewer) | Step 3 **and** step 4 (`prescribe/d-*`) | Keep in step 3; exclude from step 4 |
| `case/s7d-result-missing` (Cat4 7d) | Step 5 | Not named; reached only by the `s7a`–`s7f` range | Name it in step 5 |
| `case/s7d-result-missing-pilot` | Step 6 | Step 6 by name; also inside step 5's range | Exclude from the step 5 range |
| `a-confirm-busy`, `a-confirm-failed`, `a-back-blocked` (case folder) | Step 3 picture, step 5 trigger | Step 3 only | Note the trigger dependency in step 3's "done when" |
| `home/home_profile-case-open` | Step 2 picture, needs an open case (step 3) for real | Step 2 | Note the dependency |
| `t08b`, `t11`, `t12` | Step 9 (A-only) | Step 9 | OK |
| `c-skip-ha` | Step 6 | Step 6 (also used by A12, step 9) | OK |
| behaviour-only: `offer.cancelled`, `offer.not-now`, `offer.unsupported`, `offer.enabled` | Step 1 | Not in §5 (no picture) | Add as behaviour rows with IDs |
| behaviour-only: `rx.load-failed` (Rx viewer, Try again) | Step 3 | Not in §5 | Add |
| behaviour-only: `case.reopened` | Step 7 | Step 7 names "reopen into an open case" but no ID | Add the ID |
| retired keys still in the state map: `call.forwarded-after-hangup`, `call.end-call-first`, `case.end-call-first` | None (retired) | Listed as rows | Mark "retired" or remove from the map |

---

## 5. Coverage — flows (brief question 2)

| Path or journey | Checklist line that tests it | Status |
|---|---|---|
| Shared start: Call patient (`R1`→`CALL`), Back (`R1`→`LEAVE`) | 4.7, 4.8 | OK (Back rule open, B-1) |
| `CALL`→`E3` doctor's leg failed → Call again / Back | 4.8 | Partial (Back, B-1) |
| `CALL`→`P9` patient side failed (any time) | 4.8 | OK |
| Cat4 / HA skipped: `C0`→`RES`→`C8`→`E10a` | 4.2, 5.1 | OK |
| `RES`→`C6` too short → Call again loop / Callback | 4.9, 4.15 | Partial |
| `C0`→`C7b` → Still talking loop / Call ended | 4.11 | **Missing** the loop |
| `C0`→`C7c`→`C7d` → Confirm → `C7f` → `E10a` / HOLD | 4.1, 4.21 | Partial (Cat4 7d → 7f not named) |
| `C7d` / `B7d` Unavailable → reason → `P9` | 4.8 (9 only) | **Missing** |
| Pilot `B0`→`B1`→`B2`→`T13`→`E14` | 4.2 | OK; "13 drops by itself" missing |
| `B2`→`B3`→hang-up→`EB3` | 4.19 | OK |
| `B0`→`B7d`→Confirm & forward→`C7f` | 4.2 says 10b | **Wrong** (B-3) |
| `B0`→`J3`→`RES`→6 / 9 (ended before the gate) | — | **Missing** |
| `B1`→`T17`→`RES`→8a / 6 / 9 / 7c–7d | 4.4 | Partial |
| `B1`→`T16`→Confirm & forward → `E10b`; `T16`→Skip HA → `E10a` | 4.2, 4.4 | OK, but see B-2 (wait or not) |
| `T13`→`T15`→hang-up→`E15` | 4.19 | OK |
| Sign-in → OTP | 4.17 | OK |
| Faster sign-in offer, unlock | 4.18 | Partial (Not now, Switch account, 3 failures) |
| Home → availability → request | 4.16 | Partial (window rule, one phone) |
| Case page | 4.5–4.7, 4.14 | Partial (Rx viewer, notes drop) |
| **Prescribe** | — | **Missing entirely** (B-4) |
| Log out / Profile during an open case | — | **Missing** |
| "Request next case → next case" | — | **Missing** (plan step 5 names it) |

---

## 6. Source errors (frozen files, not the drafts)

1. `calling-flow/data.js` C7f: the Pilot 7d route ends at E10a. See B-3.
2. `calling-flow/data.js` / `feedback-state-map.md`, `case.no-medicines`: the copy still quotes "This order has no medicines. Release it — our Ops team will check it." D-84 changed it to "No medicines on this order. Our Ops team will check it." (app-logic §4 is correct.)
3. `ui-screens/app-logic.md` §5, "Transfer cases (Pilot, Value Meds)" bullet: describes version A (transfer on the live call) as a current rule. Launch is Fallback B. Mark it version A.
4. `ui-screens/app-logic.md` §4 and `feedback-state-map.md` `case.back-before-call`: "hidden for the rest of the case" conflicts with D-80 and states 3 / 4. See B-1.
5. `ui-screens/app-logic.md` §4 end-of-call script list omits `call.scriptNeutral`, which is the script on B1 (`g0`, `g1`). The text exists in `messages.json` line 61 only.
6. `feedback-state-map.md`: retired keys `call.forwarded-after-hangup`, `case.end-call-first`, `call.end-call-first` still have rows (see §4).
7. `ui-screens/app-logic.md` §7: the button label is written "📅 Callback" (emoji). D-54 and the icon rule say icons come from the design system. Do not copy the emoji into the build.
8. `ui-screens/README.md`: the case picture counts add up to 65 (43 + 16 + 1 + 2 + 3), but the folder holds 62. Home is written as "19 states (+3 Profile)" while the folder holds 22. Counts only, no behaviour effect.
9. `CLAUDE.md` (project file): lists "Skip HA call" as the final label. D-70 changed it to "Skip HA". The checklist is right; CLAUDE.md is stale.

---

## 7. P1–P5 (plan §8)

| # | Point | My view | Why |
|---|---|---|---|
| P1 | Build order and steps | **Agree with changes** | Order is right. Add behaviour-only states to §5, mark step 1 dependency on Home, fix duplicates (§4), add Apurva's phone check at step 6 (§3 item 14). |
| P2 | Plain HTML/JS, no framework | **Agree** | Hosting copy step must be specified (B-5). |
| P3 | Calling rows of the state map generated from `data.js`, with a drift check | **Agree with a caveat** | The check proves the two match, not that `data.js` is right. Two items in `data.js` need a decision first (B-2, B-3). |
| P4 | Mock settings values | **Disagree — incomplete** | The list is missing values the sources set. The demo 8 s call conflicts with the ~10 s minimum (B-6). |
| P5 | Apurva's review points: step 5 (phone demo) and step 8 (final) | **Agree, plus step 6** | Step 6 is the riskiest: seven new states and the decisions changed after the last approval. |

---

## 8. Nice to have

- Add a one-line "what this proves" under each checklist section (e.g., §4 "the consultation rules").
- Put the test-number table (app-logic §11) into the checklist as a data file the tests read, not a copy of it.
- Name the calling-flow page version in the state map header (`2026-11-03 · screens frozen at D-85`) so drift is visible.
- Plan B1: say which Node tools run the checks (the Playwright line in B15 adds Node test tooling; the plan says "no app build"). Harmless, but say so.

---

## 9. Parked (out of scope for this build)

- Version A (steps 9+): transfer on the live call, route known at call start, Non-Value Meds "Calling → 5 → 8b".
- Call again after a valid call (CW-C4) — decide with call-log data.
- Help and bell content (D-88 pt 4 placeholder only).
- Profile redesign and User manual link.
- Token inspector (plan §7).
- Offline cache, in-app VoIP calling, real phone unlock.
- Restoring an open case after app restart in production (OQ-025): the prototype mocks it (B12).
- Icon background: decided in the main thread, not flagged here.

---

## 10. Checks I could not do

- Did not open picture files (PNG). Picture-to-text checks rely on file names, `data.js` `pics`, README and the state map.
- Did not run the guards or the layout check (the brief is read-only for review).
- Netlify behaviour for a second site from this repo: unverified (no access).
- Codex report: not opened (by instruction).
