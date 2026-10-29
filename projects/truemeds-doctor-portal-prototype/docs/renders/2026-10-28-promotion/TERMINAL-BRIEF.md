# Terminal brief — promotion into ui-screens/

Owner: main Claude thread · Worker: terminal session · Date: 2026-10-28
Apurva approved the screens on 2026-10-28 (decisions D-58 → D-70). This round moves the approved working copies and pictures into `ui-screens/` and makes the folder consistent. **No design or copy changes** — if something doesn't match the approved pictures, stop and report.

## Read first
`docs/context/decision_log.md` D-61 → D-70 · `docs/context/backlog.md` §2b–2c · `docs/renders/2026-10-27-final-audit/REPORT.md` §6 (promotion map) · `ui-screens/README.md` · `ui-screens/app-logic.md`.

## Sources (approved)
- Code: `docs/renders/2026-10-26-entry-ds-pass/src/` (sign-in, otp, returning-unlock, faster-signin-offer, home + home-reference.js/css, case.html, case-styles.css) and `docs/renders/2026-10-22-calling/src/case.html` (calling recipes 1–17, 7a–7f, 8c, 15b, B1–B3, and the c-* sheets over the new calling screens).
- Pictures (newest wins): `docs/renders/2026-10-27-fix-round/round-2/` → `docs/renders/2026-10-27-fix-round/round-1/` → `docs/renders/2026-10-26-margin-16/round-1/`.

## Steps
1. **One case page file.** Merge the two working `case.html` files into **`ui-screens/case/case.html`**: the entry-pass file as the base; add every calling recipe and helper from the calling file (they replace the old `b-*`/`c-*` recipes, which are removed). Keep one copy of each helper. The c-* recipes use the calling-file versions (over 7a / 12). Every recipe id in the promotion map must still render the same picture (pixel-compare 390 and 360 against the approved pictures; capture-timing noise is fine, real differences stop the round).
2. **Other screens.** Copy the working `sign-in.html`, `otp.html`, `returning-unlock.html`, `faster-signin-offer.html`, `home.html`, `home-reference.js/css`, `case-styles.css` into their `ui-screens/` folders; fix relative paths (design system, brand, `feedback/messages.js`, `app.js`). Open each in a browser at 390: no console errors, logo and icons load.
3. **Pictures.** Put every approved picture (390 and 360) in its folder with the existing naming:
   - `case/` — case page `a-*`, calling (render ids as in app-logic §5, e.g. `t02-calling`, `s7f-submitted`, `t15b-end-call-first`, `g3b-forwarded`), sheets `c-*`, closed `e-callback-scheduled`, `e-availability-ended`, stress `s-*` incl. `s-medicine-disabled`, `a-offline-action`.
   - **`prescribe/` (new)** — all `d-*` incl. `d-alt-days`, `d-monthly`, `d-inhaler`, plus a short `README.md`: what the screen is, how to open a state (`../case/case.html?s=d-…&start=case&capture=1`), decisions.
   - `home/` — add `home_profile`, `home_profile-case-open`, `home_logout-confirm`.
   - `sign-in/`, `otp/`, `returning-unlock/`, `faster-signin-offer/` — the new pictures (incl. `offer_screen-lock`, `offer_enable-failed`, `offer_offline`).
4. **Retire** (delete the pictures and recipes): old `b-*` (all), old `c-*` pictures replaced by the new ones, and `e-prescription-confirmed`, `e-transferred`, `e-forwarded`, `e-patient-unavailable` (now 10a, 14, 10b, 9). Remove the `case.callEndedEarly` key from `ui-screens/feedback/messages.json` + `metadata.json` and rebuild (`node feedback/build-messages.mjs`) — D-69. Nothing else in `messages.json` changes.
5. **Contact sheets:** regenerate `contact-*.png` per folder (390), and `case/contact-call.png` from the calling storyboard groups.
6. **Guards.** Update `ui-screens/feedback/check-locked-specs.py`, `check-sources.mjs` and `docs/layout_check.py` to the approved look: page margin 16 (D-67), sheet inset 16, OTP without Back + logo on entry screens (D-61), unlock order (D-61/D-66), status card tones (D-62/66), new and retired states, `prescribe/` path. **Change a guard only where a decision changed the rule; cite the decision in a comment.** Then run all four guards: they must pass with 0 failures.
7. **README.** Rewrite `ui-screens/README.md` table and "How to open" section for the new set: folders, files, state counts, decisions (D-58 → D-70), the `prescribe/` folder, calling render ids, Profile page states. Keep "Open items" and move done ones out; add the backlog's next design round (Profile redesign, Help, navigation).
8. **Review page:** point `docs/renders/2026-10-26-margin-16/REVIEW.html` at `ui-screens/` (or write `ui-screens/REVIEW.html` the same way) so Apurva can browse the final set.

## Report
`docs/renders/2026-10-28-promotion/REPORT.md`: files added / changed / deleted (lists), pixel-compare result per family, guard changes (rule → decision) and final guard results, anything that didn't match (stop items). Then stop.

## Never
- Change any design, copy or behaviour; touch the design system; edit the decision log, backlog, open questions or project truth.
- `index.html` / `app.js` behaviour changes (path fixes only if a copied file needs them — report them).
- Publish, commit, open or merge pull requests (main thread does it). Git: `git status` only.


---

## Answers to the round-1 stop items (2026-10-29, D-71) — continue from step 1

1. **One `case/case.html`.** Use the **calling file's card markup and CSS** for the live-call card: heading "End-of-call script", label inside the script box hidden (D-58 pts 16, 17, 21). Remove the entry-file "Call" heading.
2. **Ready state shows no script card** (D-58 pt 18). If an `a-*`/`d-*`/`e-*`/`s-*` state shows the card before Call, hide it there.
3. **8px offset:** find the leftover 24px side margin in either stylesheet and set it to `var(--tm-space-page)` (16, D-67). Re-run the DOM probe: every card, notice and button on the 16 edge.
4. **Re-baseline:** a picture that differs **only** because of 1–3 is re-rendered and replaces the approved one (list each in the report with the reason). Any other difference → stop and report.
5. **`c-*` sheets:** use the new renders (over 7a / 12). Intended (D-70 pt 4).
6. **`a-confirm-busy`, `a-releasing`, `a-rx-viewer`:** re-compare with animations frozen (`*{animation:none!important;transition:none!important}` at capture). Spinner-frame-only differences are accepted; anything else → report.
7. **`g3a-connecting-ha`:** not promoted (fallback B transfer reuses 13).

Then carry on with steps 2–8 as written.
