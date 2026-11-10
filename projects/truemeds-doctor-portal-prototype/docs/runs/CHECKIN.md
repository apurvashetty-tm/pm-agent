# Main-thread check-ins (scheduled)

One dated line per firing that did something. Reviewed runs are listed so the next firing knows where to start.

- 2026-11-09 20:57 IST — First scheduled check-in. Reviewed: rails, token-pass (both already ruled by the main thread, see RULINGS 20:30 and 20:45). A1 running since 20:28 IST, files changing in the last 15 min; not stalled. No NEEDS-APURVA.

- 2026-11-09 21:50 IST — Main thread (chat) reviewed run A1: passed; 4 test disputes ruled and fixed; rulings in RULINGS.md; OQ-037 and session handoff written. Reviewed: rails, token-pass, A1. A2 running since 21:36.
- 2026-11-09 23:05 IST — Main thread (chat, new thread) reviewed run A2: passed; A0-happy-path test fixed; D-101 recorded; queue + signin-d101 and handoff-kit-all after B. Reviewed: rails, token-pass, A1, A2. B running.
- 2026-11-10 00:35 IST — Scheduled check-in reviewed run B: passed; dispute #1 test fixed (textContent); t13 @390 diff ruled (neutral script is right in launch B); OQ-038, D-102. Reviewed: rails, token-pass, A1, A2, B. signin-d101 running since 00:12.
- 2026-11-10 00:50 IST — Main thread (chat) reviewed signin-d101: passed (its four readings accepted: o10 limited to Change, pasted-number behaviour unchanged; o04 checked before the first-digit rule; 91-start still a prefix; o04 picture captured live, no new fixture). D-103 agreed (kit viewer redesign); ruling 00:46 + kit-redesign follow-up queued. handoff-kit-all running since 00:42.

- 2026-11-10 07:58 IST — Scheduled check-in: handoff-kit-all STOPPED twice (00:42 = Apurva's intentional stop for D-103; the 00:51 start hit the 5-hour usage limit at ~01:29 IST). Restart ruling written (continue from the uncommitted kit build); H18 + H23 test disputes upheld and test fixed (2 / 2 pass). Runner has exited; Apurva told to restart. Reviewed: rails, token-pass, A1, A2, B, signin-d101.

## NEEDS-APURVA
(none)
