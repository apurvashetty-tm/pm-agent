# Run signin-d101 — report (2026-11-10, unattended)

Brief: `TERMINAL-BRIEF.md` (this folder). Rulings read first. Applies D-101 o04, o10, o11, o25 to the prototype. `handoff/` not touched (next run).

## What changed
| D-101 | Change | Files |
|---|---|---|
| o04 | More than 10 digits left after +91 / 0 cleaning → field error **"That’s more than 10 digits. Check the number."** (`signin.long`, F1), shown as soon as it's typed, in the helper slot with the same error style as `signin.short`. Digits are kept, never cut. +91 / 0 cleaning unchanged. | `app/core/auth.js`, `ui-screens/feedback/messages.json` + `metadata.json` (regenerated `messages.js`, `native/messages.ts`), `app/screens/sign-in.js` |
| o10 | Back from OTP (Change / phone back) keeps the number and it edits normally; the first typed digit no longer replaces it. | `app/screens/sign-in.js` |
| o11 | OTP Terms → `https://www.truemeds.in/legal/terms-and-conditions`, Privacy → `https://www.truemeds.in/legal/privacy-policy`, new tab; each read from one config value (`TERMS_URL`, `PRIVACY_URL` in `app/data/links.js`). | `app/data/links.js`, `app/screens/otp.js` |
| o25 | `signin.signup` = "New to Truemeds? {link}"; `signin.signupLink` ("Sign up") kept as its own key for the link text. Screen identical (compare: exact). | copy registry, `app/screens/sign-in.js` |
| docs | `ui-screens/app-logic.md` §2 and sign-in rows of `docs/feedback-state-map.md` (new behaviour rows `signin.too-long`, `signin.back-from-otp`); `app/state-map.js` + `docs/state-map.md` regenerated; jump-list names (`app/review/state-names.js`) and jump targets (`app/core/boot.js`) for the two new rows. | |

## Readings taken (unattended)
- **o10 scope:** only the return from OTP changed. The approved `sign-in_pasted-cleaned` picture's "first typed digit replaces a pasted number" behaviour is kept — D-101 speaks only about Change.
- **o04 order:** "more than 10 digits" is checked before the first-digit rule, so `12345678901` shows the D-101 message (Codex should-fix; D-101 says any over-10 entry that isn't a +91 / 0 prefix). A 10-digit number starting 1–5 still gets "Mobile numbers start with 6, 7, 8 or 9."
- **o04 with a 91 start:** an 11-digit entry starting with 91 is still read as a +91 prefix (cleaning unchanged, as the brief says).
- **o04 picture:** captured from the live screen (too-short moment + "109" on the drawn keyboard), not added as a new `?s=` fixture, so the 149-picture set and `ui-screens/` stay unchanged.
- **Link placeholders:** `placeholder.terms` / `privacy` entries removed from `PLACEHOLDER` (no longer used); the `placeholder.linkPending` copy key stays (Help / bell / manual still use it).

## Checks (final run, after the fix pass — `checks-summary.log`, logs in `checks/`)
- `tests/signin-d101.mjs` **10/10** (new: o04 unit + live, o10, o11, o25, captures, 0 console errors).
- `entry-journeys` **61/61** (A1, B5g, B5h, B6 updated for D-101: no cutting; placeholder-return checks now use the Doctor Ops link; B6 expects the number kept and Terms / Privacy URLs).
- `run-checks.mjs` **95/95** · step-1 compare **86 pictures: exact 80, accepted 6, failed 0** (the same 6 accepted as before this run) · `check-sources` PASS · `layout_check.py` and `--app` ALL PASS · `check-locked-specs` 0 failures / 149 states · `check_lockup` OK · token check clean · `scan` PASS · `check-state-map` 0 drift · old `index.html` / `app.js` / `styles.css` unchanged.
- First full run: `run-checks` stopped on state-map drift (map not regenerated after the feedback-map edit), then P2 / P2b (no jump-list names for the two new rows). Both fixed; final run above.

## Review (D-100: one Codex review, one fix pass)
`codex-review.log`: one **should-fix** (o04 order, above) — fixed and tested. No blockers; no other findings. No second review needed.

## For Apurva's phone walkthrough
New state o04: `sign-in_too-long_w360.png`, `sign-in_too-long_w390.png` (this folder). Not promoted to `ui-screens/`.

## Not done / next
- `handoff/` still shows the old o04 / o10 / o25 code and copy — the kit run regenerates it (o10's kit line in `scripts/build-handoff.mjs` matches a code comment that this run reworded; the kit run will need to point it at the new comment).
- o07, o08, o17, o26 are native-only (D-101); nothing to build here.
