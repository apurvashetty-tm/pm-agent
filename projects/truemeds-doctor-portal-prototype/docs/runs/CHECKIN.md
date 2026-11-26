# Main-thread check-ins (scheduled)

One dated line per firing that did something. Reviewed runs are listed so the next firing knows where to start.

- 2026-11-09 20:57 IST — First scheduled check-in. Reviewed: rails, token-pass (both already ruled by the main thread, see RULINGS 20:30 and 20:45). A1 running since 20:28 IST, files changing in the last 15 min; not stalled. No NEEDS-APURVA.

- 2026-11-09 21:50 IST — Main thread (chat) reviewed run A1: passed; 4 test disputes ruled and fixed; rulings in RULINGS.md; OQ-037 and session handoff written. Reviewed: rails, token-pass, A1. A2 running since 21:36.
- 2026-11-09 23:05 IST — Main thread (chat, new thread) reviewed run A2: passed; A0-happy-path test fixed; D-101 recorded; queue + signin-d101 and handoff-kit-all after B. Reviewed: rails, token-pass, A1, A2. B running.
- 2026-11-10 00:35 IST — Scheduled check-in reviewed run B: passed; dispute #1 test fixed (textContent); t13 @390 diff ruled (neutral script is right in launch B); OQ-038, D-102. Reviewed: rails, token-pass, A1, A2, B. signin-d101 running since 00:12.
- 2026-11-10 00:50 IST — Main thread (chat) reviewed signin-d101: passed (its four readings accepted: o10 limited to Change, pasted-number behaviour unchanged; o04 checked before the first-digit rule; 91-start still a prefix; o04 picture captured live, no new fixture). D-103 agreed (kit viewer redesign); ruling 00:46 + kit-redesign follow-up queued. handoff-kit-all running since 00:42.

- 2026-11-10 07:58 IST — Scheduled check-in: handoff-kit-all STOPPED twice (00:42 = Apurva's intentional stop for D-103; the 00:51 start hit the 5-hour usage limit at ~01:29 IST). Restart ruling written (continue from the uncommitted kit build); H18 + H23 test disputes upheld and test fixed (2 / 2 pass). Runner has exited; Apurva told to restart. Reviewed: rails, token-pass, A1, A2, B, signin-d101.
- 2026-11-10 13:50 IST — Main thread reviewed d104: passed (61/61, 95/95, kit 38/38, PRD 17/17, calling-flow temp-site check 0×404; Codex no blockers). Readings accepted: once turned on the offer never returns (even if Profile turns it off later); a showing counts when shown. Reviewed: rails, token-pass, A1, A2, B, signin-d101, handoff-kit-all, d104. Queue empty; next: deploy 2 after Apurva approves.

- 2026-11-11 18:10 IST — Scheduled check-in reviewed r2-build (passed; 29/29 final checks, 126/126 gaps, Codex 0 blockers) and r3-rest-audit (report accepted; fix run waits for Apurva's answers). Queue finished; SUMMARY.md written. Reviewed: all runs to r3-rest-audit.

## NEEDS-APURVA
From r2-build (`docs/renders/2026-11-11-r2-build/REPORT.md`):
1. Approve the new entry + Home pictures (`all-screens.png`, `before-after/`)?
2. ~~Add time greyed under 15 min~~ — answered 2026-11-26 (D-115): always tappable, the tap says why; shift hours when sent.
From r3-rest-audit (`docs/renders/2026-11-11-r3-rest-audit/CONCLUSION.md` §2):
3. ~~Q1 Duration~~ — answered 2026-11-25 (D-110): 1–12 for every unit; numbers first.
4–10. ~~Q2–Q4, Q6–Q9~~ — approved 2026-11-26 (D-111, "Approve all").

From the overnight build (2026-11-25, `docs/renders/2026-11-25-r4-rest-build/REPORT.md`):
11. ~~"Time remaining 0:00"~~ — answered 2026-11-26 (D-113): hidden; ended notices reworded.
12. Case loading: the old approved picture showed Back; the app hides it ("no actions until loaded"). Keep hidden?
13. ~~Backend duration above 12~~ — closed 2026-11-26 (Apurva): cannot happen; without a valid prescription nothing is pre-filled, the doctor sets the duration in the 1–12 picker. No app change.
