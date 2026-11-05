# Plan v3 review — merged result (main thread, 2026-11-05)

Inputs: `claude-report.md` (Claude Code, terminal), `codex-report.md` (Codex), main-thread notes (written before either report was read). Verdicts: Claude Code "not ready", Codex "approve with changes". Both agree on structure (B first, generated state map, one core); all findings are about missing or wrong lines. Applied to plan v3.1 and checklist v3.1 in one pass (marked **[R]**).

## 1. Resolved from the sources (no question for Apurva)

| Finding | Raised by | Resolution |
|---|---|---|
| Back rule has three readings | Claude Code B-1, Codex B2 | D-80 pt 1, app-logic §4 table and the pictures agree: Back on 1, 3, 4 while the patient was never reached. The one sentence "hidden … for the rest of the case" (app-logic §4, state map `case.back-before-call`) is a bug — fixed in step 0 (§4 below) |
| Does 16's Confirm & forward wait for the record? | Claude Code B-2 | No. D-83 pt 9 names only 7f and forwards from 15 and B3. On 16 the partner has already reported a hang-up after the gate. Checklist narrowed (4.22, 4.23) |
| Release exception "unless the result is 3 or 4" | Both, main thread | Added (4.8) |
| Cat4 and state 5 | Main thread, Claude Code | app-logic §5 row 5: Cat4 never reaches 5. Plan B7 and 4.28 corrected; Knowlarity call-ended event marked open, simulator switch |
| Duplicate owners (`d-rx-failed`, `s7e-leave-sheet`, `s7d-…-pilot` in a range) | All three | One owner per picture; ranges replaced by names (plan §5) |
| Pictures whose trigger comes later (`a-back-blocked`, `a-confirm-*`, `s-medicine-disabled`, `home_profile-case-open`) | All three | ↗ rule: looks-right check in its own step, gets-there test in the later step |
| Behaviour-only states, retired keys | Claude Code, Codex | In the state map with IDs; retired keys dropped (B4, 1.2) |
| Missing settings; demo 8 s vs ~10 s minimum | Both | B10 completed; demo scales every time value by one factor |
| Prescribe and Rx viewer had no test lines | Both | Group 4B (4.10 – 4.17) |
| Retry by cause; simulator gaps (transfer couldn't start, HA no answer, record delay) | Codex | B9, 4.26, 4.30 |
| Resume data; late record for an earlier case | Codex | B7, B12, 5.7 |
| Reason saved, mismatch logged, earnings once | Codex | 4.34, 4.23, 4.38 |
| Missing journey lines (Log out, one phone, window rule, unlock, Not now, callback validation, notes on drop, 7b loop, Pilot ended before gate, 13 drop, next case) | Claude Code | 4.2 – 4.7, 4.11, 4.28 – 4.30, 4.33, 4.37 |
| Flow coverage proof | Main thread | 4.20: one test per calling-flow edge, generated |
| Step column, test IDs | Both | Every line has a Step; line IDs become test IDs |
| Hosting under-specified; `[deploy]` is read from the latest commit message, not the PR title | Both | Plan §4: base directory `app/`, production branch = project branch, same `ignore` rule, copy step, both cases tested (5.10) |
| `data.js` retry edges lose Pilot context | Codex | Normalising step (B4) |
| `c-skip-ha` picture shows the version-A background | Codex | Bug: re-render over B1 and 16 before step 6 (plan §5 note) |

## 2. Not adopted

- **Claude Code: Apurva decides the Back rule and the 16 forward (B-1, B-2)** — both are settled by existing decisions (§1).
- **Claude Code: phone check at step 6 as a plan change** — put to Apurva as Q-B instead, since it adds to her load.
- **Claude Code nice-to-have "what this proves" lines** — the section titles already say it.

## 3. Questions for Apurva

- **Q-A** — Pilot 7d: after Confirm & forward and the record arrives, which ending? Recommended **10b Forwarded to Health Advisor** (sources say "Prescription confirmed" for both routes; that would log a forward as a confirm, against D-50).
- **Q-B** — phone check at step 6 (Pilot)? Recommended yes.

## 4. Stale source lines — fixed as bugs in step 0 (before the state map is generated)

1. app-logic §4 "hidden from the Call tap for the rest of the case" and state map `case.back-before-call` → D-80 wording.
2. app-logic §5 bullets "Transfer cases (Pilot, Value Meds)" and "All other cases (… Pilot Non-Value Meds …)" → mark version A; state the launch (B) rule.
3. app-logic §4 script list → add `call.scriptNeutral` (B1); route scripts marked version A.
4. app-logic §12 resolved flags and OQ-021 note; §13 Callback during Transferring.
5. app-logic §7 "📅 Callback" → plain label (icons come from the design system).
6. `calling-flow/data.js` and state map `case.no-medicines` → D-84 copy "No medicines on this order. Our Ops team will check it."
7. State map: rows for retired keys `call.forwarded-after-hangup`, `case.end-call-first`, `call.end-call-first`.
8. `ui-screens/README.md` counts (case 62, Home 22), retired 15b styling and pending-approval text.
9. Project `CLAUDE.md` "Skip HA call" → "Skip HA".
10. `project_truth.md` §3 – 5: A routing, pre-D-80 release wording, Ops escalation for missing records.
11. `open_questions.md` OQ-002 "no hold" vs D-83 pt 6.
12. app-logic §5 row 7f and `data.js` C7f: Pilot route ends on 10b Forwarded to Health Advisor (Q-A answered, D-89).

None of these changes a rule or a picture; each brings a line in line with a decision already taken.
