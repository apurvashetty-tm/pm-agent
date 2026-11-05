# Step 0 report — shell, staleness fixes, state map

Brief: `docs/renders/2026-11-06-step0/BRIEF.md` · Plan v3.2 §5 step 0 · Checklist v3.2 lines with Step 0.
Status: **built, checked, not committed or pushed** (main thread commits). Codex critique received; valid blockers fixed; gaps below are stated, not hidden.

## Part A — staleness fixes (MERGE.md §4)

| # | File | Old | New | Decision it matches |
|---|---|---|---|---|
| 1 | app-logic §4 "Leaving a case" + feedback-state-map `case.back-before-call` | "From the Call patient / Call again tap the header Back is hidden for the rest of the case" | "Header Back is on 1, 3 and 4 only, while the patient has never been reached. Hidden from the Call tap … never returns once the patient answered, also on a later 3 / 4" | D-80 pt 1, D-81 F21 |
| 2 | app-logic §5 bullets | "Transfer cases (Pilot, Value Meds): … Confirm & transfer appears on the live call" / "All other cases (Cat4, Pilot Non-Value Meds, HA skipped)" | "Launch B, Pilot live call: Confirm prescription (B1) at the gate"; transfer cases marked version A (later); "All other cases" = Cat4, HA skipped, and Pilot calls that end before the gate or have no result | D-83 CW-F1, D-85, D-87 |
| 3 | app-logic §4 scripts | Transfer and Forward scripts only | `call.scriptNeutral` added for launch B, B1 only (after critique: not 17); Transfer and Forward marked version A | D-85 (17 uses `call.scriptCat4`), B1 neutral script |
| 4 | app-logic §12 / §13 | "transfer-failed screen (OQ-021 note)" in open list; "Flags 2, 3, 5, 6 above"; Transferring "keeps the Callback and Skip HA row" | OQ-021 reference and the Flags reference removed; Transferring keeps the Skip HA row, greyed and disabled, **no Callback** | D-83 K13, D-58 pt 25; resolved flags |
| 5 | app-logic §7 | button "📅 Callback" | button "Callback", icon from the design system | D-54 |
| 6 | feedback-state-map `case.no-medicines` | "This order has no medicines. Release it — our Ops team will check it." | "No medicines on this order. Our Ops team will check it." (`case.noMedicines`) | D-84 |
| 7 | feedback-state-map retired rows | rows for `case.end-call-first`, `call.end-call-first`, `call.forwarded-after-hangup` | rows removed; generator's `RETIRED` list excludes them from the state map | MERGE §4 item 7; D-83, D-85 |
| 8 | ui-screens/README.md | "warning (amber) for 15 and 15b"; heading "pending approval" | "for 15 … 15b is retired (D-83) and has no card"; heading "applied and frozen (D-82)". Counts checked: Home 22, case 62 — already right | D-82, D-83 |
| 9 | CLAUDE.md (project) | "Skip HA call" | "Skip HA" | D-70 |
| 10 | project_truth §3–5 | Confirm & transfer as the Pilot route; "Release case before first attempted call" wording; "goes to Ops after 30 minutes" | Confirm & transfer marked version A, launch = Confirm prescription then HA check; Non-Value Meds launch route added; Back rule per D-80 pt 1; unproven confirm → not confirmed, hold and retry, nothing to Ops (D-83 CW-D3/D4) | D-80, D-83 |
| 11 | open_questions OQ-002 | "no hold" | Superseded: patient unavailable = hold, retried by the system (D-83 pt 6, CW-B2) | D-83 pt 6 |
| 12 | app-logic §5 row 7f, `calling-flow/data.js` C7f, E10b | Pilot 7d confirm → "Prescription confirmed" | Cat4 → 10a; Pilot route → **10b Forwarded to Health Advisor**; new edge J2 → E10b; E10b and C7f cite D-89 | D-89 Q-A |

Verification: `node calling-flow/check-coverage.mjs` PASS (44 states, 56 arrows). Calling page opened locally in Chrome, no console errors; the 7f panel shows the Pilot-route ending; the 10b box renders. Visual zoom of the J2 → E10b arrow not confirmed by eye (see gaps). Picture: `docs/renders/2026-11-06-step0/calling-flow-pilot-7d.png`.

## Files created

- `app/`: `index.html`, `manifest.webmanifest`, `robots.txt`, `netlify.toml`, `icons/icon-{180,192,512}.png`, `shell/shell.css`, `core/` (boot, modes, settings, msg, storage, clock, store, nav, unlock, call-sim, mock-server, play-link), `review/` (panel, drawer, qr, labels, `vendor/qrcode-generator.js` MIT 2.0.4), `shell/screen-host.js`, `data/` (scenarios, test-numbers, story-schema), `screens/.gitkeep`, `state-map.js` (generated).
- Generated copies inside `app/` (git-ignored): `design-system/`, `brand/`, `feedback/`, `pictures/`.
- `scripts/`: `copy-shared.sh`, `build-state-map.mjs`, `check-state-map.mjs`, `make-icons.mjs`.
- `tests/`: `package.json` (Playwright 1.58.2, own `node_modules`, git-ignored), `run-checks.mjs`, `scan.mjs`.
- `docs/state-map.md` (generated: 149 picture rows, 20 behaviour / calling boxes, 230 transitions), `docs/guides/preview-site-setup.md`.
- `docs/layout_check.py`: `--app` added (default run for `index.html` unchanged).
- Screenshots: `docs/renders/2026-11-06-step0/` — `review-desktop-1280.png`, `phone-390-drawer-closed.png`, `phone-390-drawer-open.png`, `review-test-on-phone-qr.png`, `play-link-390.png`, `calling-flow-pilot-7d.png`.
- `docs/context/session_handoff.md`: step 0 entry appended.

Edited: `.gitignore`, `CLAUDE.md`, `calling-flow/data.js`, `docs/feedback-state-map.md`, `docs/context/open_questions.md`, `docs/context/project_truth.md`, `ui-screens/README.md`, `ui-screens/app-logic.md`.

Untouched (verified): `index.html`, `app.js`, `styles.css` (`git diff --stat` empty); no file in `ui-screens/` changed except README and app-logic text.

## Checklist Step-0 results

Pass / fail / pending with evidence. "Pending site" = needs the Netlify site Apurva creates.

| Line | Check | Result | Evidence |
|---|---|---|---|
| 1.1 | 149 pictures in the map, one owner, open with `?s=` | PASS | S1 drift check; R-tests open 10 states at 390, 360, 1280 |
| 1.2 | behaviour-only states with IDs and steps; retired not carried | PASS (name matching reviewed by eye only) | `docs/state-map.md` section 2; `RETIRED` excluded (S1) |
| 1.3 | calling rows match data.js; drift check; map vs app-logic §5 by eye | PARTIAL | S1 PASS; transitions generated (230 rows). The by-eye comparison with app-logic §5 is **not done**; doubts listed below |
| 1.4 | MERGE §4 stale lines fixed before map generated | PASS | Part A table |
| 2.3 | `layout_check.py --app` ALL PASS | PASS | 6 widths: 1280, 1440, 1024, 430, 390, 360 × 640 (frame 9:16, centred, panel beside frame and on screen, drawer not over header or notice, no sideways scroll, no page errors) |
| 2.5 | four guards 0 failures | PASS, locked-specs re-run in progress at report time | check-sources PASS (660 strings); check_lockup OK; layout ALL PASS; locked-specs 149 × 3 PASS earlier (first run) — re-run result in the final message |
| 3.2 | every B10 value from one settings file; nothing hard-coded; demo scales time values by one factor | PASS | `core/settings.js`; scan S2 (no hard-coded time values); U2, U7 |
| 3.4 | tokens only, no hex, no emoji | PASS | scan S2; install metadata colours exempt (must equal `--tm-surface-primary` #FFFFFF) |
| 3.7 | copy-rule checks on `app/` | PENDING | `check-sources.mjs` still reads `ui-screens/`; running it on `app/` is not built yet |
| 5.3 | review panel beside the frame, never inside; never a scroll container (desktop) | PASS | layout check; phone drawer scrolls internally so every control stays reachable (exception stated) |
| 5.4 | demo, review, capture never share stored data; capture writes nothing; Reset clears | PASS | B6 (capture 0 keys), T1 (review reset keeps demo) |
| 5.5 | manifest and icons 180/192/512 load on the deployed link | PASS locally; deployed PENDING SITE | D3; icon files; run after deploy |
| 5.10 | preview site deploy gate both ways; `docs/` not served | gate PASS (D1); site PENDING SITE | D1 (commit unmarked → skipped; `[deploy]` → built); `publish = "."` in `app/` |
| 5.11 | phone drawer: handle, no control over header, action bar or notice; opens; closes on tap outside; no handle in demo or capture | PASS | H1–H4; layout handle checks at 390 and 360; B2 |
| 5.12 | play link covers every journey and every choice; scanned on a phone gives the same end state; unreadable → review with notice; QR vendored | PARTIAL | U4 (300 random stories incl. per-attempt calls round-trip), U5, Q1–Q5 (panel story = play-link story). Scanned on a real phone: **device check pending (Apurva)**. No journey screens yet, so "end state" is the story values, not a screen |
| 6.4 | synthetic data only | PASS | scan S2 (phone pattern check, allowlist = test numbers) |
| 7.2 | session_handoff updated | PASS | step 0 entry |

Test results: `node tests/run-checks.mjs` → **65/65 PASS** (unit U1–U9, drift and scan S1–S2, deploy gate D1–D5, browser B1–B6, R-tests for 30 `?s=` views, H1–H4, Q1–Q5, T1, N1–N3).

## Codex critique (read-only, `codex-critique.md`) — verdict "not ready"

| # | Codex point | Action |
|---|---|---|
| 1 | No transition graph; drift check misses routing change; `c-skip-ha` on launch B | **Adopted.** Map now carries 230 normalised transitions (joins resolved to their box, Pilot retries kept on the Pilot route, route tag per arrow). Drift check compares the full generated file, so a changed arrow in `data.js` fails. `c-skip-ha` stays owner 6 with a flag: the picture is version A, re-render is a step-6 task (plan §5 note), not step 0 |
| 2 | Verification harness missing (approved-image compare, 2× capture, spinner masks, generated edge tests) | **Partly adopted.** Edge-test list is generated (in the map). Approved-image compare harness **deferred to step 1**: at step 0 a picture compared with itself proves nothing; the harness must compare built screens |
| 3 | Story cannot hold per-attempt sequences, selectable durations, record delay, staged offline | **Partly adopted.** Per-attempt calls: 1–3 attempts per story, each with its own choices, played in order; talk-time boundaries (just under / at / over the gate). **Not adopted yet:** free-text durations and record delay in seconds (the choices are the B9 options); staged offline moments per journey step (offline is one story switch until journeys exist, step 7) |
| 4 | `call.scriptNeutral` wrongly on state 17 | **Adopted.** Launch B, B1 only |
| 5 | Stale text: Flags list, retired rows, Non-Value launch route | **Adopted.** All three fixed |
| 6 | Decoded play story does not initialise consumers; invalid link keeps play storage | **Adopted.** Effective mode resolved first; storage, unlock, scenario, offline hydrated from the story in one path |
| 7 | Restart does nothing | **Adopted.** Restart clears pending events, replaces server and poller, resets the clock, returns to the start placeholder |
| 8 | Jump bypasses navigation; picture layout not set on bare shell | **Adopted.** Jump goes through `push()`; `picture-only` set on every render. Test N1 |
| 9 | Polling uses a quarter of the setting with a floor; older unseen sequences accepted | **Adopted.** Polling interval is the setting (no floor, demo-scaled); the poller is monotonic (never applies a sequence not newer than the last applied; stale and foreign counted); foreground return re-reads. Tests U8, U9 |
| 10 | Review controls bypass central components; 32px targets | **Adopted.** Buttons use `.tm-btn` (central); phone drawer targets 48px. Monospace font removed. Native select kept (no central select component in the design system yet — flagged to the design system, not invented here) |
| 11 | Handle-overlap check cannot prove the guarantee; 430 viewport missing | **Partly adopted.** 430 × 932 added (checked). Header controls, action bar and sheets do not exist at step 0; the overlap check against them is deferred to steps 1–3 |

Codex was **not re-run** after the fixes. The fixes were verified by the suite above.

**Bug found while fixing:** the call-section buttons lost their listeners after the attempt select re-rendered them (add / remove / run). Found by a reproduction in Chrome; now delegated on the panel root. Test N3.

## Known gaps (stated, not hidden)

- No journey screens (by design). `?s=` shows approved pictures with the label "Not built yet"; behaviour-only states show a card.
- Approved-image compare harness (2× capture, spinner mask, pixel diff): not built (step 1).
- Copy-rule check on `app/` (checklist 3.7): not run; `check-sources.mjs` reads `ui-screens/`.
- Feedback-state-map ↔ picture matching is by name; the 20 behaviour-only rows were not checked one by one against the feedback map.
- The map's app-logic §5 comparison "by eye" (checklist 1.3) is not done. Doubt: the Pilot-route retries are shown as map notes plus Pilot-route transitions; a real Pilot B0 path for 6 → Call again and 7b → Still talking is in the transitions list, not drawn.
- Calling-page J2 → E10b arrow: confirmed in data and coverage check and by DOM; not confirmed by eye at zoom.
- Phone: device scan of the play link pending (Apurva). Netlify site not created (guide only, no deploy).
- Drawer: sections show controls only at step 0; each screen reads story values in its own step.
- Staged offline moments and free-text call durations: not in the story (see Codex 3).
- `project_truth.md` is locked by CLAUDE.md; §3–5 were edited under MERGE §4 item 10 (see NEEDS-APURVA).

## NEEDS-APURVA

1. **`docs/context/project_truth.md` is locked**, and I edited §3–5 (version-A marking, launch route, Back wording, no Ops escalation) because MERGE §4 item 10 lists it. Please confirm that this lock-free edit is what you approved, or tell me to revert it.

## Concurrent edits (not mine, not reverted)

While working, these files changed on disk from another session and were then edited by me with targeted replacements: `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, `docs/context/project_truth.md`, `scripts/build-state-map.mjs`, `app/core/settings.js`, `app/core/boot.js`, `app/review/panel.js`. Also modified in git but not touched by me: the plan v3, the checklist v3, the brief, `docs/context/decision_log.md`, and an untracked `docs/renders/2026-11-06-phone-testing-concept/`. Check the diff before committing.

## Next step

Main thread: review this report, check the concurrent diffs, commit on the project branch (`app/` copies stay ignored). Then step 1 brief (sign-in, OTP, offer, unlock), which also builds the approved-image compare harness.
