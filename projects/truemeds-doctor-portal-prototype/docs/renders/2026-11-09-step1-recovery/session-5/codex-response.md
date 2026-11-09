# Session 5 — response to Codex (whole-step critique, `../codex-critique.md`)

| # | Point | Verdict | What was done |
|---|---|---|---|
| B1 | Blocker: Send OTP → Change → Send OTP again during the resend wait sent a new code (`app/core/auth.js` `requestCode`) | Adopted | `requestCode` now applies the per-number resend wait: during it, no new code is sent and OTP opens on the running wait (`reused: true`). `[MOCK ASSUMPTION]` — app-logic §2 does not say what the server answers here; the code already sent stays valid. Tests A12 (unit) and B6c (journey). |
| S1 | Should-fix: the window's 4th code sent from sign-in opened OTP with a normal countdown, then refused Resend | Adopted | `requestCode` returns `last: true` + window end when it used the last code; `sign-in.js` passes `lastCode`; `otp.js` opens with the too-many-codes notice and Resend hidden (same as a resend that used the last code, `sent-last`). Tests A12 and B6c. |

Codex noted it could not run the browser tests in its sandbox (server binding `EPERM`); all browser tests and guards were run here (`checks/`).

## Re-run (`../codex-critique-2.md`) — 0 blockers, 1 should-fix

| # | Point | Verdict | What was done |
|---|---|---|---|
| S2 | Should-fix: returning unlock → **Use OTP instead** (and the 3-failure fallback) dropped the last-code flag, so the window's last code opened OTP with a normal countdown | Adopted | `returning-unlock.js` `toOtp` passes `lastCode: !!r.last`, as sign-in does. Journey test F7f (unlock → Use OTP instead for codes 2–4; the 4th opens with Resend hidden and the too-many-codes notice). |

No third Codex run: the re-run raised no blocker (brief §4: re-run once only if it raised blockers).
After the fixes: `entry-journeys.mjs` 60/60; every other check as in `checks/` (run-all).
