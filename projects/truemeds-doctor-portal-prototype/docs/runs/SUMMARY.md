# Build chain summary (2026-11-09 → 2026-11-11)

**Queue finished:** 18 runs, all DONE and reviewed (rails → token pass → build-fast A1 / A2 / B → signin-d101 → hand-off kit → d104 → wheel-keyboard → d105 → Home round → band / screens audits → r1-rules → r2-build → r3-rest-audit). Two restarts (usage limit, Wi-Fi), both finished from where they stopped.

## Built and playable end to end (`app/`)
- **Entry:** sign-in (one band, D-107; field errors D-101) → OTP → faster sign-in offer → returning unlock (two buttons, prompt on arrival, D-105 / D-109).
- **Home v3** (D-106): setup with the swipe wheel, 10-hour cap, Add time, end / log-out sheets, Profile.
- **Case:** case page → calling for Cat4 / Pilot (launch A with HA skipped, launch B fallback incl. transfer, missed, skip HA) → Prescribe / Disable → Prescription confirmed → next case.
- **Hand-off kit** (`handoff/`, D-103 viewer): 7 screens, 149 states, tokens / messages / icons downloads, generated from `scripts/build-handoff.mjs`.

## Check results (last full pass, r2-build, all exit 0)
Entry journeys 61 / 61 · run-checks 95 / 95 · Codex run A 303 / 303, run B 99 / 99, A0 happy path · r2 27 / 27 · wheel-keyboard 15 / 15 · build-fast 15 + 26 + 23 · visible gaps 126 / 126 (entry + Home) · reference vs app 130 / 130 · picture compare 86 exact, 132 / 0 over 1 % · locked specs 0 failures · kit `--check` + 38 / 38 · PRD 17 / 17. Evidence: `docs/renders/2026-11-11-r2-build/logs/final-checks.txt`.

**Not yet on the new spacing rule:** case page, Prescribe, sheets, Profile, Rx viewer — r3 found 24 drift fixes (`docs/renders/2026-11-11-r3-rest-audit/CONCLUSION.md`); the fix run waits for your answers below.

## Open NEEDS-APURVA (10 yes / no, in `docs/runs/CHECKIN.md`)
Approve r2 pictures · Add time greyed < 15 min / none when ended · duration option set · Prescriptions count on Profile · ended-case reason line · tags 12 vs 14 · callback 3 columns · callback copy · Rx header gap · calling-flow page scope.

## Your next step
1. Answer the 10 questions (yes / no is enough).
2. ~10-minute phone walkthrough per journey: on the Mac run `bash scripts/serve.sh` from the project folder, scan the QR in the review panel, then play: sign-in → OTP → offer; returning unlock; Home set / add time / end; one Cat4 case to Prescription confirmed; one Pilot B case with transfer. Check the keyboard at the OTP and Prescribe fields.
3. Not done by the chain: no deploy, no merge, no PR (GitHub connector signed out) — the design-system commit (RULES + gap checker) needs its PR.
