# Fresh-AI test — one round (brief step 5)

Prompts (`prompt-calling.txt`, `prompt-prescribe.txt`): the pilot §9 prompt with "the Sign-in screen" replaced by
"the Case page in its calling states (…)" and "the Prescribe screen".

## Setup and deviations from the pilot method (unattended run)

- **Copy location:** temp folders outside the repo were refused by this session's sandbox, so each tool got its own copy
  of `handoff/` (minus `viewer/downloads/`) in `tmp/fresh/<tool>-<screen>/` (not committed), and was told to read only
  that folder.
- **Codex:** `codex exec --sandbox read-only --skip-git-repo-check --ephemeral -c project_doc_max_bytes=0 -C <copy>`.
  The first try (`*-try1-repo-agents.*`) is kept but **not scored**: because the copy sat inside the repo, Codex also
  loaded the repo's own root `AGENTS.md` (it quoted a workspace rule that isn't in the kit) and wrote no code
  (read-only sandbox). The scored try turns repo docs off and asks for the code in the final message.
- **Claude:** a nested `claude -p` is refused in unattended runs (RULINGS 2026-11-09 20:30), so each Claude run is a
  fresh subagent with no conversation context, told to treat itself as an outside engineer and read only its copy.
  It may still have seen the surrounding workspace's instructions; its answers show it worked from kit ids only.
  Its code is in `tmp/fresh/claude-*/claude-code/` (not committed); its final answers are `round-1/claude-*-final.md`.
- **Timing:** all four runs read the kit **before** the critique and fresh-AI fix pass below.

## Round 1

| Run | Questions asked | In DECIDED (kit failure) | In OPEN | New | Code |
|---|---|---|---|---|---|
| Codex · calling | 6 integration questions | **1**: "React Native version / navigation library" (o23, app team's choice) | 0 | 5: case / calling / callback / confirm / release API contracts; telecom-event → state mapping; where config values come from; journal / idempotency mechanism for unclear confirms; integration points with Prescribe, viewer, Help, Home | Clean: no hex / rgb, no typed sizes, no typed text (scan in this folder) |
| Codex · Prescribe | 2 | 0 | 0 | 2: save / disable API contracts; what shows if a save or disable fails (now answered, see fixes) | Clean (same scan) |
| Claude · calling | 38 (24 answered by the kit with ids) | **3**: spinner speed (kit contradicted itself: AGENTS.md "no token" vs `tokens.duration.spinner`); patient name / order line keys (kit tagged the name `print.amount`); toast max width (in `toast.json` as `100% − 2 × space.xl`; misread) | 0 | 11 (below) + 1 source conflict | No hex; overlay black at `overlayOpacity` (documented exception); toast 4 s typed in a fixture (no token, its question 25); all copy from `messages` |
| Claude · Prescribe | 30 (≈17 fully answered with ids) | **4**: capsule / drops dose lists (dropped from DECIDED by a filter — fixed); `d-disabled` note keyed `prescribe.slotAria` (fixed); header / medicine name keyed `print.amount` (fixed); o23 | 0 | ≈13 (below) + 1 kit conflict | No hex; one documented 1px nudge; typed `-` `½` and a no-break space in the printed line (no keys) |

**Result: not passed** (DECIDED questions > 0 for three of four runs). The brief allows one round; the fixes below are
in the kit but were **not re-tested**.

### Fixes made after this round (in the generator, so they hold on regeneration)
1. Dose table rows kept and labelled: `rx-05`…`rx-11` "What doses can be picked for Tablet / Capsule / Syrup / Drops / Inhaler / Injection / Cream?".
2. Copy matcher: a template with no fixed words (`{n} {unit}`, `{slot}: {dose}`) no longer wins over a real key; on visible text it becomes data (names, medicines) or "a value the app puts together with `print.*`" (doses, durations). The disabled note is `case.disabledMedicine`; the order line is `case.orderMeta`.
3. Spinner: AGENTS.md, the timing note and o24 point to `tokens.duration.spinner` (800 ms).
4. New DECIDED stand-in (Prescribe, `[MOCK]`): Prescribe / Disable make no server call in the prototype; everything goes with the case's confirm (D-69), so there is no save-failure state.

### New questions (not invented; for NEEDS-APURVA)
- **Calling (Claude):** toast duration token (4 s, "about 4 seconds" only); busy / failure states for Confirm callback, Skip HA and Unavailable reasons; what Help opens; Confirm failing on the live Pilot call; does the live-call count survive backgrounding; Pilot 3-min no-result timeout from the tap or the hang-up; status-tag width; arrow position on "Request next case"; what the doctor sees if a submitted prescription is later not confirmed; leave sheet / time grid at 360×640.
- **Calling, source conflict:** five strings differ between `docs/feedback-state-map.md` (quoted in DECIDED) and `messages.ts` (`case.confirmFailed`, `case.offlineAction`, `call.resultMissing`, `callback.notReached`, `call.submittedText`). The kit says `messages.ts` wins; the feedback map should be aligned (read-only for this run).
- **Prescribe (Claude):** ml label for syrup Other (`prescribe.doseIn` unused); the starting schedule of a Pending medicine; defaults when How often changes; SOS add-on with Other / cream SOS print; where each medicine's default duration comes from, number with no unit, does the picker close on pick; a "(optional)" key without the suffix; printed-line glyphs (`-`, `½`) and units for inhaler / injection; the invalid-Other line ("Once a month…"); when errors clear; changing back still "changes" for ✕; where the app goes after Disable; Android back / scrim tap on Prescribe; viewer loading state.
- **Prescribe, kit conflict:** scrim token — `components/overlay.json` overlay-subtle vs `screens/prescribe.json` overlay-default (not fixed this run).
- **Codex:** backend API contracts, telecom-event mapping, config source, unclear-confirm journal — Engineering, outside the kit.
