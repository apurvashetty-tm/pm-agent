# Terminal brief — fix round D-80 + D-81

Owner: main Claude thread · Worker: terminal session · Date: 2026-11-01
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).

**Read first:** `CLAUDE.md` (project), `docs/context/decision_log.md` **D-80 and D-81**, `docs/context/backlog.md` §2f and §2g, and **`CHECKLIST.md` in this folder** — it is the definition of done. Same capture method and settings as `docs/renders/2026-10-30-status-line/` (fixed clock date, 390 + 360, animations frozen, scratch Playwright venv).

## Round 1

0. **Before changing anything:** render every state as it is now into `docs/renders/2026-11-01-fix-round/before/` (the comparison baseline). Then write the **expected list** into `REPORT.md`: every picture you expect to change, per fix (F1–F28). For F3 list every state whose visible text uses one of these keys: `signin.couldntSend`, `otp.resendFailed`, `home.requestFailed`, `case.noPickup`, `case.didntConnect`, `call.notThrough`, `call.doctorMissed`, `call.resultMissing`, `call.scriptNeutral`, `call.forwardedTell`, `call.scriptCat4`, `call.scriptTransfer`, `call.scriptForward`, `call.transferMissedDoctor`. For F27 list every state with Callback, Skip HA or Unavailable in the bar.
1. Apply **F1–F28** exactly as `CHECKLIST.md` §1 says. Copy goes through `messages.json` → `build-messages.mjs` (no text typed in code for new keys). Add the apostrophe check to `check-sources.mjs`. Add `d-disabled` to the state list, README and the guards' state lists.
2. Update the text files **T1–T4** to match (app-logic, feedback-state-map, RULES §9, README).
3. Re-render the changed and new states (390 + 360) into `ui-screens/`, then rebuild contact sheets, `REVIEW.html` and the calling storyboard with the `_qa/` scripts (**T5**).
4. Run the gates **G1–G6**: pixel-compare every state against `before/`; four guards; copy check; render twice for determinism; `git diff --stat`.
5. Open each changed picture at full size (390 and 360) and check it against its "pass when".
6. Write `REPORT.md` in this folder:
   - table F1–F28 + T1–T5: PASS / FAIL, with one line of evidence each
   - expected list vs actual differences: matched, **unexpected** (with the reason), expected but unchanged
   - guards with counts of states checked; determinism; page errors
   - **NEEDS-APURVA:** anything the checklist doesn't settle (don't decide it yourself — leave it as it was and list it)
   - last line exactly: `ROUND 1 COMPLETE — failures: <n>`
7. **Wait for the next round — don't stop.** The main Claude thread reads `REPORT.md`, checks the pictures, and appends `## Round 2` (then 3, …) to this file. Wait for it with:
   `until grep -q '^## Round 2\|^## DONE' docs/renders/2026-11-01-fix-round/TERMINAL-BRIEF.md; do sleep 60; done`
   (change the number each round). If the command times out, run it again. **There is no time limit and nobody will come to restart you — keep re-running the wait until a new round or `## DONE` appears, however long it takes.** When a new round appears, do it the same way: apply it, re-run the gates, append `## Round <n>` to `REPORT.md` ending with `ROUND <n> COMPLETE — failures: <n>`, then wait for the next one.
8. The loop ends when this file contains `## DONE`. Then stop.

**Unattended:** Apurva is away. Don't stop to ask questions — anything the checklist doesn't settle goes under NEEDS-APURVA in the report (left as it was), and you carry on with the rest.

## Never
Touch anything in `CHECKLIST.md` §3 (Part C, the calling walkthrough, decision log, backlog, open questions, project truth, the old prototype files). Change the design system beyond F27 (and the RULES text in T3). Commit, push, open PRs, or run git commands other than `git status` / `git diff`. Read or print credentials.

## Round 2

Main thread checked Round 1 independently (27 changed pictures at 390 and 5 at 360 opened at full size, against CHECKLIST §1): F1, F3–F5, F7–F9, F11–F15, F17–F28 confirmed. Your NEEDS-APURVA points 2, 3, 4, 5, 6, 7, 8, 9 are accepted as done by the main thread (they go to Apurva in the summary); do nothing more on them.

Two items left:

1. **F10 — Profile earnings (main-thread decision, mock data).** Use `[MOCK ASSUMPTION]` ₹150 per confirmed prescription: with 3 prescriptions today, **Earned ₹450.00 · Incentive ₹0.00**. Write it in `ui-screens/app-logic.md` §11 (mock data) as "illustrative only; real amounts come from the backend (D-73: earnings count once a case is confirmed)". Re-render the states that show the Profile card (`home_profile`, `home_profile-case-open`, `home_logout-confirm`, any other).
2. **F16 — scroll to the first error (not measured in Round 1).** Probe it: open the Prescribe screen for a tablet with dose 0-0-0, scroll to the bottom (as `d-scrolled`), tap **Prescribe**, and record whether the dose error line ends up inside the visible scroll area (between the pinned band and the bar). If it doesn't, make the existing scroll target the first field error (dose grid error, or the Other field error) and probe again. Record the before/after scroll position in the report. No picture should change; if one does, list it.

Then the gates again for what changed (pixel compare against Round 1's output: only the Profile pictures differ; four guards; determinism for the re-rendered ones), append `## Round 2` to REPORT.md ending with `ROUND 2 COMPLETE — failures: <n>`, and wait for Round 3 / DONE as before.

## DONE

Main thread verified Round 2 (Profile ₹450.00 · ₹0.00 checked at full size; F16 probe accepted). All fixes F1–F28, T1–T5 and gates G1–G6 pass with 0 failures. Stop now — no commits; Apurva reviews next.

## Round 3 (2026-11-02 — reopened after DONE, by Apurva's decisions)

A new session may start here: read the whole brief and CHECKLIST.md for method, then do only this round. Rounds 1–2 are done and verified; don't redo them.

1. **Button icon size steps with the button size (Apurva).** The main thread already changed the design system (don't edit it): `components.css` sets icons inside **56px action buttons (`.tm-btn--lg`, 18px label) to 20px** and inside **48px compact buttons (16px label) to 16px**, overriding any size in the markup; `truemeds.css` rebuilt; RULES §9.1 and `beyond-salt.md` updated. **Check every button that carries an icon:** if a 56px action button is 56px through other CSS but lacks `tm-btn--lg`, add `tm-btn--lg` in the markup (no other visual change) so it gets 20px; if a compact 48px button got 20px, it should now be 16px. Expected: View Rx stays 16px (unchanged); 56px buttons whose icon was 16px (e.g. the → on Request next case, the full-width Callback, Skip HA) become 20px; buttons already at 20px unchanged. Icons outside buttons unchanged.
2. **Profile earnings ₹20 per prescription (Apurva).** Main thread already changed `home-reference.js` (rxToday × 20) and app-logic §11. Expect Earned **₹60.00** · Incentive ₹0.00.
3. Before rendering, write the expected list: every state with a button icon whose rendered size changes under the new rule (derive from the DOM before and after) + the three Profile states. Then re-render all states (390 + 360) into `after-r3/`, compare against the current `ui-screens/` pictures: only expected pictures differ. Probe: on every state, every icon inside a button that is 56px tall is 20×20, inside a 48px button 16×16; any other icon size unchanged.
4. Promote the changed pictures to `ui-screens/`, rebuild contact sheets, `REVIEW.html` and the calling storyboard with the `_qa/` scripts. Four guards 0 failures; determinism for the re-rendered set; page errors 0; `git diff --stat` in scope.
5. Append `## Round 3` to REPORT.md ending with `ROUND 3 COMPLETE — failures: <n>`, then wait for `## Round 4` or `## DONE (round 3)` as before (`until grep -q '^## Round 4\|^## DONE (round 3)' …`). No commits.

## Round 4 (2026-11-02 — Apurva's decisions after the consistency audit)

**First** finish Round 3: write its report (`## Round 3` … `ROUND 3 COMPLETE — failures: <n>`). Then do this round straight away — don't wait for `## DONE (round 3)`.

Read `CONSISTENCY-AUDIT.md` (this folder) and the renders in `docs/renders/2026-11-02-home-action-bar/` (`C1–C3` = the agreed action bar; `notice-in-tray-options.png` column 3 = the agreed notice band). Use only design-system components; for the three design-system changes below you may edit `design-system/src/components.css` (then `scripts/build.py`; revert date-only changes in `native/` and `preview.html`), `RULES.md` and `beyond-salt.md` — nothing else in the design system.

1. **Pinned action bar on Home, faster sign-in offer and returning unlock.** Their footers become the real `.tm-actionbar` (no local restyle; the bar spans the panel edge to edge like the case page). Applies to every Home state with bottom buttons (≈15; the add-time / end / log-out sheets keep their own buttons), all offer states, all unlock states. The content above the bar **scrolls** on short phones (today the timer and the wheel are clipped at 360×640). Toasts sit above the bar.
2. **Notice placement rule (A-19):** a notice that is the **result of an action** sits **inside the bar**, above its button (Home "ending soon", setup / add / request failures, offer "Couldn't turn on…", the case and calling bar notices). A notice that describes a **standing state** stays at the top of the panel (unlock "isn't available"). Write the rule in RULES §9.5 and `feedback-state-map.md`.
3. **Notice inside the action bar = band (design system):** `.tm-actionbar > .tm-notice` becomes an edge-to-edge band on the bar's top edge — no side / top border, top corners follow the bar's radius, a 1px bottom edge in the tone colour, full tint, padding 12 / 16, same icon and text as today. All three tones (warning, error, neutral). Notices in page content keep their box. Record in RULES §9.5 and `beyond-salt.md`.
4. **OTP terms line** centred in the panel, balanced wrap, "Terms & Conditions" never split (A-01, A-02).
5. **Consistency audit:** apply **every `bug`** and **every `question` with Claude's recommendation** in `CONSISTENCY-AUDIT.md`. Keep as they are: A-18, B-23, B-25 (no change) and the five "No change (recorded)" items; A-19 is item 2 above. Specifics:
   - **A-07 logo:** one lockup size and one top offset (16) on every screen with the logo. Use the largest size that fits Home at 360 wide with 16 to the first header icon; if that's smaller than today's entry size, list it under NEEDS-APURVA with before/after.
   - **B-05:** card-to-card gap **16** on the case page and Prescribe (and the same everywhere cards stack).
   - **B-01 / B-02:** busy states keep the bar's height and the button's place (secondary row kept, greyed, in Transferring…; status line takes the buttons' row in 7c and B2).
   - **B-18:** text keyboard drawing for notes fields; Other dose keeps the number pad with a decimal key and an error that can really happen on it.
6. **Small-phone check (new, not promoted):** render at **360×640** Home (every state), Prescribe `d-default`, case `t01-ready`, `s7d-result-missing`, `t12-transfer-ready`, offer, unlock. Pass = nothing the doctor needs is hidden without a scroll cue; the bar never covers the last content when scrolled to the end. Save them in `small-phone/` in this folder and report.
7. **Texts:** app-logic (Home / offer / unlock bar, notice rule, scroll), `feedback-state-map.md`, RULES (§8 gaps 16 incl. cards, logo size, §9.1 icons unchanged from Round 3, §9.5 notice band + placement, action bar on every pinned main action), `beyond-salt.md`, README counts.
8. **Gates as before:** expected list written before rendering (it will be large — every state with a bar notice, every case / Prescribe state for B-05, Home / offer / unlock for the bar, plus each audit item's states); re-render everything into `after-r4/`; compare against current `ui-screens/`; only expected pictures differ; probes for each item; four guards 0 failures (update guards that lock the old notice / footer / gap with a citation to this round); determinism; page errors 0; `git diff --stat` in scope. Promote, rebuild contact sheets, `REVIEW.html`, calling storyboard. Build `before-after-r4/` sheets (before left, after right, 390) for every changed state.
0. **Main-thread fix from the Round 3 report (already in the design system, don't edit):** icon-only buttons (`.tm-btn--icon`: Back, Help, bell, Profile, close ×, viewer controls) keep a **20px** icon — Round 3's compact-button rule had shrunk them to 16. `truemeds.css` is rebuilt. Your Round 4 render must show these at 20px again (probe them); the labelled-button sizes from Round 3 stay (56px → 20, 48px → 16).
10. **Small phones as a permanent guard:** add a short-screen pass to `docs/layout_check.py` (or the locked-specs guard) at **360×640** for every state: fails when content the doctor needs is clipped with no way to scroll to it, or the pinned bar covers the last content at the end of the scroll. Report how many states it checks.
11. **Regression gate (every round from now on) — against everything agreed, not only recent rounds:**
   - **All standards:** the four guards over every state (they encode RULES §8 locked specs L1–L9, §9 components, the layout rule, copy sources, the logo) — 0 failures, and no guard loosened without citing the decision that changed it.
   - **The final decisions only:** for every state that changed, check it against the decisions that govern it **as they stand now** — the latest entry or update wins; anything marked replaced, superseded, reverted or changed by a later decision does not count (`ui-screens/README.md` lists them per screen; `decision_log.md` is the source) and against `app-logic.md`, `docs/feedback-rules.md` and `docs/feedback-state-map.md`. Report any state that now contradicts one.
   - **All fix rounds:** F1–F28 (CHECKLIST §1), Round 3 icon sizes by button type (56 → 20, 48 → 16, icon-only → 20), Profile ₹60, and each later round's items.
   - **Unchanged screens stay approved:** pixel-identical to the approved pictures unless on the expected list (G2).
   - A new change may never break a standard or a final decision. If one conflicts, keep the standing one, leave the change out, and list it under NEEDS-APURVA with both references.
   Report all of this under "Regression".
9. Append `## Round 4` to REPORT.md — item-by-item PASS / FAIL with evidence, expected vs actual, guards, small-phone results, NEEDS-APURVA — ending `ROUND 4 COMPLETE — failures: <n>`. Then **stop** — don't wait for another round (Apurva asked to end the polling; she will tell the main thread when the report is in). No commits.

## Round 4 — split into lanes (2026-11-02, replaces running Round 4 as one session)

Round 4's content is unchanged (items 0–11 above; `CONSISTENCY-AUDIT.md`). It now runs as **three parallel edit lanes (A, B, C)** and **one integration lane (D)** afterwards. Item 0 is already done and verified.

**File ownership — edit only your own files.** If a fix needs a change in a file another lane owns, don't touch it: add a line to `LANE-REQUESTS.md` (this folder): `<from lane> → <owner lane>: <file> — <exact change> — <audit id>`. Owners pick requests up before they finish; lane D resolves any left over.

| Lane | Owns (only these) | Does |
|---|---|---|
| **A — design system, copy, texts** | `design-system/**` (then `scripts/build.py`; revert date-only changes in `native/` and `preview.html`), `ui-screens/feedback/messages.json` + `metadata.json` (then `build-messages.mjs` → `messages.js`, `native/messages.ts`), `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, `ui-screens/README.md` | Item 3 (notice band in the bar); item 2 rule text; item 7 texts (incl. RULES §8 gaps 16, logo size rule, §9.5 band + placement, action bar on every pinned main action, small-phone rule); every audit item whose fix is a shared component, token or copy (e.g. A-08 spinner gap, A-17 / A-22 wrapping in copy and notices, B-05 card gap if set centrally, B-07 header / sheet icon positions, B-14 sheet labels, B-15 / B-20 / B-21 / A-06 wording). |
| **B — entry and Home** | `ui-screens/sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/`, `home/` (html, js, css only) | Item 1 (action bar on Home / offer / unlock, content scrolls, toasts above the bar, notices placed per item 2); item 4 (OTP terms centred, A-01 / A-02 / A-03); every A-item fixed in these files (A-04, A-05, A-07, A-09…A-16, A-21 …). |
| **C — case page and Prescribe** | `ui-screens/case/case.html`, `ui-screens/case/case-styles.css` | Every B-item fixed in these files (B-01…B-04, B-06, B-08…B-13, B-16…B-19, B-22, B-24, and B-05 if the gap is local); case and calling bar notices placed per item 2. |
| **D — integration (after A, B and C are done)** | `docs/layout_check.py`, `ui-screens/feedback/check-*.{py,mjs}`, capture / compare scripts, every picture in `ui-screens/`, contact sheets, `REVIEW.html`, calling storyboard, `REPORT.md` | Resolve leftover `LANE-REQUESTS.md`; item 10 (permanent 360×640 guard); item 6 (small-phone renders); item 8 (expected list → full render into `after-r4/` → compare → probes → guards → determinism → promote → sheets → `before-after-r4/`); item 11 (regression gate G7 against all standards, final decisions and every fix round). Report `## Round 4` ending `ROUND 4 COMPLETE — failures: <n>`, then stop. |

**Rules for lanes A, B, C:** no rendering into `ui-screens/` and no promotion; to self-check you may screenshot your own states into `lane-<x>-preview/` in this folder. Keep every earlier standard and final decision (G7) — if a Round 4 item conflicts with one, leave it out and note it. When finished, append to `LANES.md` (this folder): `## Lane <X> — DONE` with a list of items done / left out (with reason) and files changed. Then stop. No commits.
