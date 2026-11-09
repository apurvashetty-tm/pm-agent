# Session 2 — response to Codex

Critique 1 (`codex-critique-1.md`, on the session-1 scaffolds) and critique 2 (`codex-critique-2.md`, on the rebuild) are answered here.
Critique 3 (`codex-critique-3.md`) is the re-run after these fixes.

## Critique 1 — all six blockers and six should-fix

| # | Point | Done |
|---|---|---|
| B1 | Sign-in skips validation and server outcomes | Fixed: `app/core/auth.js` (cleaning, checks, test numbers §11, forced story answers, offline), `app/screens/sign-in.js` |
| B2 | Verify accepts any code | Fixed: empty / short checks, 1234 / 0000 / 9999 / wrong, wrong-try count, sign-in handoff (`auth.signIn`, nav reset) |
| B3 | Resend and limits display-only | Fixed: Resend handler, ticking countdown on the app clock, 30 / 60 / 120 s waits, 4 codes per window, lock 15 min (mock), all in settings, stored per number |
| B4 | Inline styles; no journey CSS | Fixed: markup lifted from the approved files; `app/screens/sign-in.css`, `otp.css`; `dom.js` refuses inline styles; test B1 asserts 0 `[style]` |
| B5 | Keyboard / focus states | Fixed: drawn keyboard (review / capture), OTP focused on arrival, `.is-current`, central slot / error / disabled styles |
| B6 | Copy hard-coded; recipient fixed | Fixed: every word via `MSG()` (19 approved labels added to the registry, plan B6); recipient = submitted number |
| S1 | Editing does not recover errors | Fixed: leading 0 / 91 dropped; errors re-check per keystroke (app-logic §2); OTP replace on first keystroke |
| S2 | Typed number lost | Fixed: kept in the store and through Change / Back |
| S3 | Phone Back on OTP | See critique 2, S3 |
| S4 | Placeholder links | Fixed: Terms / Privacy → "Link pending"; Call Doctor Ops (button and notice links) → placeholder page; Sign up → onboarding URL, new tab; OQ-021 note added |
| S5 | "New code sent" icon | Fixed: text only (A-21) |
| S6 | Copy guard misses app/ | Fixed: `check-sources.mjs` now reads the built screen modules (MSG keys exist; no typed copy; negative-tested) |

## Critique 2

| # | Point | Done |
|---|---|---|
| B1 | Last resend never recovers at window end | Fixed: `resendCode` returns the window end with `sent-last`; OTP sets it; test B5e |
| B2 | Cooldown not enforced by the server | Fixed: `resendCode` refuses inside the wait (`cooldown`); an expired code shows Resend at once only if the wait is over, else "Resend in m:ss" (recovery brief §1 "expired-code resend obeys the cooldown"; app-logic "Resend available at once" read as "no extra wait for expiry"); tests A11, B5 |
| B3 | Restart changes retained deadlines | Fixed: story restart keeps the app clock (fast-forward included); only Reset clears both; test B4c fast-forwards 5 min, restarts, sees ~10:00 left |
| S1 | Verify and Resend overlap | Fixed: one server action at a time; Verify uses the code as submitted; test B5f |
| S2 | Sign-in pre-filled value not replaced | Fixed: the first typed digit replaces a pasted or pre-filled number (pasted picture, back from Change); Backspace edits instead; test B6 |
| S3 | OTP phone Back goes to sign-in | **Not changed — reason.** The approved file `ui-screens/otp/otp.html` (line 8) says "no Back (Change and the phone back gesture cover it)", and the recovery brief says "OTP has no Back → sign-in via Change". Read together: OTP has no Back control; phone Back does what Change does (sign-in, number kept, no extra history). That is what is built (`setScreenBack(goChange)`), tested in B6. The brief's wording is met (no Back control; Change is the way to sign-in, and phone Back performs Change). *(Corrected after critique 3: the latest instruction outranks the approved file; the point is that the two agree, not that the file wins.)* |

Picture differences that are not anti-aliasing: `otp_locked`, `otp_too-many-resends`, `otp_expired-and-resend-limited` show "call Doctor Ops" as a blue link. The approved file styles `.note a` as a link but its phrase search missed (the registry text uses non-breaking spaces, A-17), so the pictures show plain text. The link is required (recovery §1 Links); listed for the session 4 compare as an explained region.

## Critique 3 (re-run after fixes)

All critique-2 blockers and should-fix confirmed fixed; S3 rationale accepted (wording corrected above). New points:

| # | Point | Done |
|---|---|---|
| S1 | Leaving for a placeholder did not end the old screen's timers / late answers | Fixed: every screen-host transition sets a new host life (`screen-host.js` renderState); test B5h (Verify answer after opening Terms stays on the placeholder) |
| S2 | Back from a placeholder rebuilt OTP from its arrival params | Fixed: `nav.saveCurrent` stores the screen's state in its history step before leaving; OTP and sign-in restore it (a pending answer is dropped, its action can be retried); test B5g (cap notice, hidden resend, typed digits restored) |
| N1 | CODEX-SUMMARY.md stale | Marked superseded |

No further Codex run: the brief asks for one re-run after blockers; critique 3 raised none.
