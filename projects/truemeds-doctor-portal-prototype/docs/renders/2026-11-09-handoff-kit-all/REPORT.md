# Report — native hand-off kit, all journeys (handoff-kit-all)

2026-11-10 · restart 2 (RULINGS 07:58): continued from the uncommitted build; step 0 and the H25+ tests were not redone.

## Screens added
OTP (17 states), Faster sign-in offer (7), Returning unlock (7), Home incl. Profile / Log out (22), Case page incl. leave / release, Rx viewer, closed card, and calling (Cat4, HA skipped, Pilot Fallback B), shown in the viewer as **Case** (12) and **Calling** (49) tabs from one `screens/case.json`, and Prescribe / Disable (23). Sign-in has 12. Total: **7 screen files, 8 viewer tabs, 149 states**, 3 of them version-A states with a picture only (`built: false`). 138 building-block specs, 97 native tokens used, 0 raw values in the built app.

The D-103 viewer is built by `scripts/build-handoff.mjs` (+ `build-handoff.journeys.mjs`, `build-handoff.when.mjs`). It has Start here with downloads (whole-kit zip, tokens.ts, messages.ts, icons.ts, fonts.zip, logo.zip), the "used on" filter in Foundation, "Where it's used" in Building blocks, and a tab per screen with "When this shows" → tapped element → pick from a list.

## §6 checklist per screen (OTP · Offer · Unlock · Home · Case / Calling · Prescribe)
| Item | Result |
|---|---|
| Native token names match `tokens.ts` | Pass, all screens (H02, H18) |
| Every block has a spec (parts × states → token) | Pass (H20; 138 blocks) |
| Every state inspectable at 390; 360 in the approved pictures; tokens used per screen | Pass (H15–H17, H25, H27). Per D-103 the viewer shows the measured 390 phone with the "smallest supported phone: 360 wide" caption; 360 / 390 pictures are in `screens/pictures/` |
| Zero raw values unflagged | Pass (H19; 0 in the built app) |
| Fonts (4 TTF) + setup note | Pass (H08; unchanged from the pilot) |
| Screen file covers every element; copy keys exist | Pass (H17, H18, H03). Copy-key attribution fixed after the fresh-AI test (see below) |
| DECIDED / OPEN cover app-logic rules with decision numbers | Pass (H21; Codex critique fixes applied) |
| Fresh-AI test | **Fail in round 1** (see below); fixes in, not re-tested (brief allows one round) |
| One command regenerates; `--check` fails when stale | Pass (H09, H24, H35; final `--check`: up to date, 629 files) |
| Nothing in `app/`, `ui-screens/`, `docs/context/` changed | Pass (git: no diff since the run started). `design-system/` is outside this session's git access; no edits were made there |
| FE engineer walkthrough | Not done: comes after Apurva's review |
| D-103 "Done when" | Pass for no internal labels (H34), Start fits a laptop (H31), zip equals `handoff/` (H32), all journeys (H25). Downloads checked from disk only; **the deployed-site check waits for a deploy** |

## Codex tests
H01–H35: **written** (H15–H24 before the restart, H25–H35 committed in e10216a); **passing 38 / 38** (`tests-4.log`). **Disputed:** 2 (H18 shadow composite, H23 customer-order wording), both upheld by the main thread, test fixed; marked in `test-disputes.md`.

## Fresh-AI (one round; `fresh-ai/SCORES.md`)
Codex calling: 1 DECIDED question (RN / navigation choice, o23). Codex Prescribe: 0. Claude calling: 3. Claude Prescribe: 4. Code from all four is clean (no hex, sizes from tokens, copy from `messages`; documented exceptions only). **Not passed.** The causes were kit defects, fixed in the generator:
1. capsule / drops dose rows had been filtered out of DECIDED;
2. letter-free templates (`{n} {unit}`, `{slot}: {dose}`) were assigned to names, medicine names and the disabled note;
3. AGENTS.md said the spinner speed had no token, but `tokens.duration.spinner` exists.

I also added a `[MOCK]` answer that Prescribe / Disable don't save to the server. **Method deviations:** the copies were inside the repo, because outside paths were refused; Claude ran as a fresh subagent, because nested `claude` is refused; Codex's first try loaded the repo's root AGENTS.md, so it was re-run with repo docs off.

## Codex critique
Round 1: 2 blockers and 4 should-fix, all valid and all fixed (`codex-response.md`). Round 2 (blockers only): all six confirmed fixed, no new blockers. Sign-in pilot checks pass: `tests/codex/handoff/` 38 / 38, `brand/check_lockup.py` OK, `check-sources.mjs` PASS.

## Foundation changes
None to the token map, screen-file structure, DECIDED / OPEN format or AI pack layout. Sign-in output changed only where a correctness fix applies:
- o01 now gives the prototype's values (10 min code life, not OQ-017's old 5 min);
- o24 and AGENTS.md now point to `tokens.duration.spinner`;
- the copy matcher fix touches only screens with letter-free templates (the Sign-in reference file is unaffected; Sign-in still passes H03 / H04).

## NEEDS-APURVA
1. **Copy conflict in sources:** five strings differ between `docs/feedback-state-map.md` (quoted in DECIDED) and `messages.ts`: `case.confirmFailed`, `case.offlineAction`, `call.resultMissing`, `callback.notReached`, `call.submittedText`. The kit says `messages.ts` wins; the feedback map should be aligned (read-only here).
2. **Scrim token conflict:** `components/overlay.json` uses overlay-subtle and `screens/prescribe.json` uses overlay-default. Not fixed this run.
3. **New design / backend gaps from the fresh-AI round** (not invented; full list in SCORES.md):
   - toast duration token;
   - busy / failure states for Confirm callback, Skip HA and Unavailable;
   - Prescribe defaults (the starting schedule of a Pending medicine, defaults when How often changes, where each medicine's duration default comes from);
   - printed-line glyphs and units;
   - syrup ml label;
   - pressed states for chips and quiet buttons;
   - Android back and scrim tap on Prescribe;
   - viewer loading state;
   - Pilot no-result timeout anchor;
   - the live-call count across backgrounding.

   Per D-101 amended, each should get the prototype's mock answer in the generator. That needs a reading of the build per item, which wasn't possible in one try, so they are listed here.
4. Fresh-AI round 2 (after these fixes) and the deployed-download check are still to do.

## New OPEN items
- **o27** (Home): after "No cases right now", does the app re-check by itself? Product. Assumption: no automatic re-check.
- **o28** (Faster sign-in offer): when is it offered again after Not now? Product. Assumption: never automatically; Profile has the switch.

Both quote `open_questions.md` (fixed: the safe placeholder, not the heading).

## Notes
- Step 1 was committed without `build-handoff.journeys.mjs` / `build-handoff.when.mjs`; they followed in the next commit.
- `docs/context/session_handoff.md` is read-only for this run (brief), so it was not updated. The main thread should record this run there.
