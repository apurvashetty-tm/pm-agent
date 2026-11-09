**The critique-2 blockers are fixed. Session 2 still has two should-fix navigation defects.** No new blockers found within this scope. No files written.

| Critique-2 point | Disposition | Evidence / checklist |
|---|---|---|
| B1 — Final resend never recovers | **Fixed.** `sent-last` returns the window deadline; OTP stores it and clears the cap notice when it expires. | `auth.js:137`, `otp.js:228`, `otp.js:247` · **4.1** |
| B2 — Server ignores cooldown | **Fixed.** Resend refuses an early request; expired verification retains the remaining cooldown. The response’s interpretation—expiry adds no extra wait—holds against the recovery brief. | `auth.js:134`, `otp.js:204` · **4.1** |
| B3 — Restart changes retained deadlines | **Fixed.** Restart preserves the clock offset; Reset clears clock and storage together. | `boot.js:97` · **4.1, 3.2** |
| S1 — Verify/Resend overlap | **Fixed.** Both handlers reject overlapping actions, and verification captures the submitted code. | `otp.js:185`, `otp.js:189`, `otp.js:220` · **4.1, 6.2** |
| S2 — Prefilled sign-in value appends | **Fixed.** Real and drawn keyboard paths replace the prefilled value on the first digit; Backspace edits it. | `sign-in.js:59`, `sign-in.js:127`, `sign-in.js:135` · **4.1** |
| S3 — OTP phone Back | **Response’s functional interpretation is reasonable:** no visible Back control; phone Back performs Change. The approved `otp.html:8` explicitly mentions that gesture. However, the response’s claim that approved source outranks the brief is incorrect—the latest instruction wins. I would retire the behavior finding, with that rationale corrected. | `otp.js:267`, `nav.js:41` · **4.39** |

The six earlier blockers recapped in critique 2 remain resolved: validation/server outcomes, OTP verification, live limits, approved markup/CSS, keyboard/focus, and registry copy/live recipient.

**Should-fix**

| Finding | File and line | Checklist |
|---|---|---|
| **Leaving for a placeholder does not invalidate the previous screen’s callbacks.** `newLife()` checks the host’s marker and connection, but placeholder rendering clears only its children. Reproduction path from source: submit correct OTP, open Terms while verification is pending; the old callback remains “alive” and can navigate away from the placeholder. Invalidate screen life on every host transition. | [entry-ctx.js:25](app/screens/entry-ctx.js:25), [screen-host.js:64](app/shell/screen-host.js:64), callback at [otp.js:191](app/screens/otp.js:191) | **6.2, 4.39** |
| **Back from a placeholder reconstructs OTP from its arrival parameters, losing its current state.** Enter digits → Terms → phone Back clears the digits. More significantly, exhaust resends → Call Doctor Ops → Back reconstructs live `otp_default`, losing the cap notice and current resend presentation. Server limits survive, but the displayed state no longer reflects them. Preserve the journey model or reconcile it when restoring. Existing tests check the placeholder text, not restored OTP state. | [nav.js:44](app/core/nav.js:44), [otp.js:61](app/screens/otp.js:61), [otp.js:72](app/screens/otp.js:72) | **4.1, 4.39, 6.2** |

**Nice-to-have**

The [session summary](docs/renders/2026-11-09-step1-recovery/session-2/CODEX-SUMMARY.md:5) still describes the obsolete scaffolds and links to a nonexistent `codex-critique.md`. Mark it superseded or update it so reviewers do not mistake it for the current verdict. **Checklist 7.4 — evidence clarity.**

The supplied picture pairs show restored layout fidelity. The blue Doctor Ops links are real, explained visual differences required by the recovery brief; they are not antialiasing differences. Formal pixel acceptance remains Session 4.

Validation: auth tests **A1–A11 passed**, and `check-sources.mjs` passed. Browser journey tests could not run: the sandbox rejected the local server with `listen EPERM`. The two navigation findings are source-based. Offer, unlock, panel, compare harness and D-92 were excluded.