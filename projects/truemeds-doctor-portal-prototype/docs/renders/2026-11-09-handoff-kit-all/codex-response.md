# Response to the Codex critique (`codex-critique.md`)

All six findings checked against the sources and adopted. Fixed in the generator, so they hold on regeneration.

| # | Finding | Verdict | Fix |
|---|---|---|---|
| B1 | Dose rows (Tablet, Capsule, Drops) dropped from DECIDED by the 12-letter filter | Valid (app-logic §8 table) | Table rows are no longer dropped; the dose table's rows are labelled with their column headers: `rx-05`…`rx-11` "What doses can be picked for <form>?" (`build-handoff.journeys.mjs`) |
| B2 | `c-skip-ha` said the ending becomes Prescription confirmed | Valid (app-logic §6 line 190) | Now: on a call with a result the main button becomes Confirm prescription; on a live call the case first waits for the call result (`build-handoff.when.mjs`) |
| S1 | Resend waits cut to `[30 s` | Valid (settings parser stopped at the first comma) | Parser reads arrays; DECIDED shows "30 s → 60 s → 120 s" |
| S2 | o01 quoted OQ-017's old 5 min code life; the prototype uses 10 min | Valid (D-101 amended: the prototype's value) | o01 now states the prototype settings: 10 min code life / window, 15 min lock after the 5th wrong code, resend 30 s → 1 min → 2 min, 4 codes per window. This changes Sign-in's DECIDED text for o01 only (a correctness fix) |
| S3 | Flag 5 / Flag 6 review history ("Original flag", options, "please confirm") in DECIDED | Valid | The `*Original flag:*` tail is stripped; only the answer is exported |
| S4 | `a-release-failed` said Back works again even after the patient answered | Valid (app-logic §4 line 103) | Now: Back works again only if the patient was never reached; once answered it stays hidden until the case is closed |

Not adopted: none. The critique's note on E-checks (manual) and the missing fresh-AI evidence is covered by `fresh-ai/SCORES.md` and the report.
A second review (`codex-critique-2.md`) was run because the first raised blockers.
