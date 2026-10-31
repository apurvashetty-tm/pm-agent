# Promotion into ui-screens/ — report (2026-10-29)

**Status: promoted, with one guard failure and one picture discrepancy open.** Steps 1–8 are done in `ui-screens/`. Nothing published, committed or merged. Two items need a decision before sign-off (below): guard 5.12 (4 items), and the Profile pictures, which differ from the round-2 pictures. The stop-item rule (D-71 pt 4) applies to the second.

## Round-1 stop items: answers applied (D-71)

1. **One case page.** Calling card markup and CSS used for the live-call card: heading "End-of-call script", label inside the script box hidden (`#pcb-label`). The entry "Call" heading is removed.
2. **Ready state shows no script card.** `a-top` and `t01-ready` checked: no script card before Call.
3. **8px offset.** Traced to the card heading and calling CSS (item 1). No leftover 24px side margin remains in the promoted stylesheets, except the toast (out of scope) and the desktop layer. The comment at `case.html` line 104 still said 24px; updated to D-67. DOM probe after the change: every card, notice and button on the 16 edge on all 79 case ids at 390 and 360 (the action bars are full width at 0 by design).
4. **Re-baseline** (pictures that differ only because of items 1–3, replaced by the re-rendered one): `a-back-blocked`, `a-confirm-busy`, `a-confirm-failed`, `a-no-medicines`, `a-scrolled` (card heading, verified by the round-1 test, where these were identical), and `s7b-still-on-call` (the question icon takes the calling CSS colour). Any other difference stops the round; see the list below.
5. **`c-*` sheets** replaced with the new renders over 7a and 12 (D-70 pt 4).
6. **Busy and spinner states** compared with animations frozen. Accepted as spinner-frame-only: `g2-checking-ha`, `s7a-calling`, `s7c-checking`, `t02-calling`, `t05-result-wait`, `t11-calling-transfer`, `t13-connecting-ha`, `t17-skip-ha-wait`, and the `a-confirm-busy`/`a-releasing` busy frames. Also accepted: family spinners `sign-in/sending` (390), `otp/verifying` (390), `home/adding`, `unlock/pending`, `offer/enabling`, which match at 700 ms. Not a spinner: `a-rx-viewer` and `a-releasing` show the clock date (the date changed between runs); accepted as date text.
7. **`g3a-connecting-ha`** not promoted.

Also accepted: `s7e-leave-sheet` differs by at most 1 level of brightness (anti-aliasing, 530 pixels).

## Steps

1. **One case file.** `ui-screens/case/case.html`: the entry-pass file as base, plus the calling file's card markup and CSS (answer 1), `MSG`, `TITLE` and `closeCase` from the calling file, 18 calling helpers, 35 calling recipes (t01–t17 incl. t08c and t15b; s7a–s7f; g1, g2, g3b; c-callback, c-callback-error, c-callback-failed, c-skip-ha). Removed: all `b-*`, the old `c-*`, `e-prescription-confirmed`, `e-transferred`, `e-forwarded`, `e-patient-unavailable`. Not added: `n*`, `a1*`, `s2`, `s4`, `g3a`, `t07`. 79 promotion-map ids. Syntax checked.
2. **Other screens copied** into `ui-screens/`: `sign-in/sign-in.html`, `otp/otp.html`, `returning-unlock/returning-unlock.html`, `faster-signin-offer/faster-signin-offer.html`, `home/home.html`, `home/home-reference.js`, `home/home-reference.css`, `case/case-styles.css`. Relative paths rewritten for the new folders (8 + 5 + 4 + 4 + 3 + 1 refs). Every referenced file exists. Opened at 390 in a browser: 0 console errors on every family; logo and icons render.
3. **Pictures** in `ui-screens/`, 390 and 360, rendered from the promoted files:
   - `sign-in/` 12 states, `otp/` 17, `returning-unlock/` 7, `faster-signin-offer/` 6 (incl. `offer_screen-lock`, `offer_enable-failed`, `offer_offline`), `home/` 22 (incl. `home_profile`, `home_profile-case-open`, `home_logout-confirm`),
   - `case/` 57 (calling 31, `c-*` 4, `a-*` 17 incl. `a-offline-action`, `e-callback-scheduled`, `e-availability-ended`, `s-*` 3 incl. `s-medicine-disabled`),
   - `prescribe/` 22 (new folder, `README.md` added).
4. **Retired:** the 18 `b-*` pictures; the 4 retired `e-*` pairs (8 files); the 22 `d-*` pictures moved to `prescribe/`; the old `c-*` pictures replaced. `case.callEndedEarly` removed from `messages.json` and `metadata.json`; `node feedback/build-messages.mjs` ran (validation OK, 80 keys, `native/messages.ts` regenerated).
5. **Contact sheets** regenerated at 390: `sign-in/contact-sign-in.png`, `otp/contact-otp.png`, `returning-unlock/contact-returning-unlock.png`, `faster-signin-offer/contact-faster-signin-offer.png`, `home/contact-home.png`, `case/contact-case.png` (a, c, e, s), `case/contact-call.png` (the calling storyboard, 31 states incl. 8c and 15b), `prescribe/contact-prescribe.png`.
6. **Guards** (details below).
7. **README** rewritten: `ui-screens/README.md` (folders, states, counts, decisions D-58 → D-72, calling render ids, Profile states, open items, next design round). `prescribe/README.md` added.
8. **Review page:** `ui-screens/REVIEW.html` links all 143 pictures by folder and state, with the 360 toggle.

## Pixel-compare per family (promoted render vs newest approved picture)

| Family | Result |
|---|---|
| Sign-in | 24 of 24 identical |
| OTP | 32 of 34 identical; `verifying` 390/360: spinner frame (accepted) |
| Returning unlock | 14 of 14 identical |
| Faster sign-in offer | 12 of 12 identical |
| Home | 35 of 44 identical; `requesting` 360: anti-alias (1 level); `adding`: spinner (accepted); **Profile ×3 (6 pictures): differ from round 2 — see Decisions** |
| Case (incl. calling, sheets, Prescribe) | 116 of 158 identical at the first comparison; the rest explained: item 1 heading (`a-back-blocked`, `a-confirm-busy`, `a-confirm-failed`, `a-no-medicines`, `a-scrolled`, `s7b`), `c-*` (item 5), spinner frames, clock date (`a-releasing`, `a-rx-viewer`), anti-alias (`s7e`) |

Comparison files: `docs/renders/2026-10-28-promotion/candidate/` (scripts and JSON; they use scratch paths).

## Guards

| Guard | Result | Changes (rule → decision) |
|---|---|---|
| `check-locked-specs.py` | **FAIL: 4** (line 5.12, all four source items) | Changed: rule 1.1 side margin 24 → 16 (D-67); rule R3 side margin 24 → 16 (D-67); rule 5.1 sheet inset 24 → 16 (D-67); rule 2.4 proper nouns: "Health", "Advisor" (D-58 pt 23, D-70 pt 3). Before these changes: 1417 failures (1206 margin, 165 R3, 39 sheet, 3 sentence-case, 4 restyle). |
| `check-sources.mjs` | PASS (80 registry IDs) | none |
| `docs/layout_check.py` | ALL PASS | none |
| `brand/check_lockup.py` | OK | none |

**Open guard failures (5.12, no local restyling of a central component):**
1. `case/case.html` line 70: `.tm-notice.concept-question` restyles the central notice (the 7b question as plain text, D-62 pt 2).
2. `case/case-styles.css` line 718: `#case-head.tm-header-task--compact` padding (the compact header edge, from the margin round).
3. `case/case-styles.css` line 724: `#case-head .tm-header-task__meta` margin.
4. `case/case-styles.css` line 725: `#case-head.tm-header-task--no-back` title/meta margin.

The guard has no exemption for these, and no decision changed rule 5.12. I did not change the guard or rewrite the selectors to avoid the scan. Fix options: add a `tm-notice--question` variant and a compact-header edge variant to the design system (Apurva/design team), or accept them as documented exceptions with a decision. Also not flagged but the same kind: `#case-head #ch-back` and `#case-head #ch-help` margins (-14px) in the same CSS.

## Decisions needed

1. **Guard 5.12:** the four items above. Design-system variant, or documented exception.
2. **Profile pictures (6):** the promoted Profile differs from the round-2 pictures in small details: card gaps, and the Incentive column sits 2px further right. The code is the D-70 page; the round-2 pictures were made earlier. Which is the approved look? I promoted the render of the current code.
3. **Callback and Skip HA sheet copy** is typed in the approved sheets, not in `messages.json` (titles, options, field errors). Add keys, or accept.
4. **Log out icon** removed to match the §9.1 list (D-70 pt 2). Confirm.
5. **Old reference files** `home/add-availability.html` and `home/availability.html` are not in the state set; kept until decided.
6. **`a-releasing` and `a-rx-viewer`** pictures show the clock date; they will change daily. Use a fixed date in the capture, or accept.

## Files

- **Added:** `ui-screens/prescribe/` (22 states ×2, `contact-prescribe.png`, `README.md`); `ui-screens/REVIEW.html`; `ui-screens/case/contact-call.png`, `contact-case.png`; `docs/renders/2026-10-28-promotion/REPORT.md`; `docs/renders/2026-10-28-promotion/candidate/` (scripts, comparison results, candidate files).
- **Changed:** `ui-screens/case/case.html`, `ui-screens/case/case-styles.css`, `ui-screens/sign-in/sign-in.html`, `ui-screens/otp/otp.html`, `ui-screens/returning-unlock/returning-unlock.html`, `ui-screens/faster-signin-offer/faster-signin-offer.html`, `ui-screens/home/home.html`, `ui-screens/home/home-reference.js`, `ui-screens/home/home-reference.css`, `ui-screens/README.md`, `ui-screens/feedback/messages.json`, `ui-screens/feedback/metadata.json`, `ui-screens/feedback/messages.js` (rebuilt), `ui-screens/native/messages.ts` (rebuilt), `ui-screens/feedback/check-locked-specs.py` (guard edits with decisions cited); the pictures listed above in each folder; the contact sheets.
- **Deleted:** the 18 `b-*` pictures, the 8 retired `e-*` files, the 22 `d-*` pictures from `case/` (now in `prescribe/`), and the old `case/contact*.png` and folder contact sheets (regenerated).
- **Not touched:** design system, decision log, backlog, open questions, project truth. Backup of the approved folder: scratch `backup-ui/`.

## Close-out (D-73) — stopped at step 1 (stop item)

**Status: stopped.** Step 1 passed except for one picture (`s7b-still-on-call`). Steps 2–6 are not done. No commits.

1. **Guard 5.12 — done.** Removed the four local overrides: the `.tm-notice.concept-question` rule in `case/case.html`; the `#case-head` compact padding, `#ch-back`/`#ch-help` margins, meta margin and no-back rules in `case/case-styles.css`. The 7b question now uses `tm-notice--question` (design system). Pixel compare of all case and Prescribe states at 390 and 360 (158 renders): **154 identical**. Remaining:
   - `a-releasing` (390, 360): the clock date in the header. Fixed in step 5, not yet done.
   - `s7b-still-on-call` (390, 360): **stop item.** The promoted picture shows the question icon in grey. The approved margin-16 calling picture shows it in brand blue, and the new render is identical to that approved picture (0 pixel difference). So the promoted `s7b` picture is the wrong one: it was captured from an earlier stylesheet state during promotion. Recommended fix: replace `ui-screens/case/s7b-still-on-call_w390.png` and `_w360.png` with the new render (identical to the approved margin-16 picture). Not replaced here, because the brief says stop on any difference.
2. **Profile pictures** — not done (step 2 follows the stop).
3. **Sheet labels** — left as typed (rebuild item), as the brief says.
4. **Retire `home/availability.html` and `home/add-availability.html`, and update READMEs** — not done.
5. **Fixed clock** for `a-releasing`, `a-rx-viewer` and any other date-showing state — not done.
6. **Guards — 0 failures.** Run after the close-out changes: `check-locked-specs.py` PASS (0 failures, 114 states × 3 widths); `check-sources.mjs` PASS (80 registry IDs); `docs/layout_check.py` ALL PASS; `brand/check_lockup.py` OK. `REVIEW.html` not updated (step 6 follows the stop).

Files changed in this round: `ui-screens/case/case.html` (override rule removed; 7b class), `ui-screens/case/case-styles.css` (compact-header overrides removed). Backup before the round: scratch `pre-closeout/`.

## Close-out — completed (2026-10-29, after Apurva's approval)

Approved: `s7b` replacement; `a-releasing` as a date-only difference fixed by step 5.

1. **Guard 5.12 and the promoted `s7b`** (from the stop above): `ui-screens/case/s7b-still-on-call_w390.png` and `_w360.png` replaced with the new render. The new render is identical (0 pixels) to the approved margin-16 calling picture.
2. **Profile pictures** (`home/home_profile`, `home_profile-case-open`, `home_logout-confirm`, 390 and 360): re-rendered from the promoted code (D-70) with the fixed clock. They match the pre-clock pictures, which were already renders of the promoted code. The round-2 pictures (fix round) are superseded and not copied.
4. **Retired** `home/availability.html` and `home/add-availability.html`. Updated `home/README.md`, `home/NATIVE-HANDOFF.md` and `ui-screens/README.md` to point to the `home.html` states (`setup-wheel`, `active`, `add-wheel`, `profile`, `profile-case-open`, `logout-confirm`). No other file referenced them.
5. **Fixed clock:** Playwright clock set to 2026-10-28 15:00 (IST). All 286 pictures (sign-in 12, OTP 17, unlock 7, offer 6, Home 22, case 57, Prescribe 22; both widths) re-rendered with it.
   - Changed against the pre-clock pictures: `a-releasing` and `a-rx-viewer` (date text: now "Wednesday, 28 October"). No other date-showing state was found.
   - Other changed files are run-to-run noise, accepted under item 6: `otp/otp_verifying` (spinner frame), `home/home_adding` (360, spinner), `faster-signin-offer/offer_enabling` (390, anti-alias, 2 levels), `home/home_requesting` (360, anti-alias, 1 level). Sign-in, unlock and the other Home states are identical.
   - **Pixel compare after step 5:** a second fixed-clock render of all 158 case and Prescribe pictures matches the promoted pictures exactly (158 of 158).
6. **Guards: 0 failures.**
   - `check-locked-specs.py`: PASS (0 failures, 114 states × 3 widths).
   - `check-sources.mjs`: PASS (80 registry IDs).
   - `docs/layout_check.py`: ALL PASS.
   - `brand/check_lockup.py`: OK.
   - `ui-screens/REVIEW.html` regenerated: links all 143 states by folder, with the 360 toggle.

Still open (not part of this round): sheet labels typed in the approved sheets (rebuild item, left as typed); Log out icon removed to match the §9.1 icon list (confirm); the 2px Profile column difference is resolved in favour of the promoted code (D-70).

No commits.
