Session 2 **does not pass yet**. Most previous blockers are fixed, but limit recovery still has blocking defects. Review stayed within the requested session-2 scope; no files were written.

**Blockers**

| Finding | File and line | Checklist |
|---|---|---|
| **The final allowed resend never recovers when the window expires.** `sent-last` hides Resend and shows the cap notice but never sets `m.until`. The expiry ticker requires that deadline, so the running journey stays capped indefinitely. Return the window deadline and apply it to this state. | [otp.js:224](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:224), expiry check at :242; [auth.js:135](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/core/auth.js:135) | **4.1**, recovery §1: per-window caps expire on the clock |
| **Cooldowns are not enforced by the simulated server.** `resendCode()` checks locks and caps but never checks the last-send deadline. Expired verification exposes Resend immediately, allowing another code during the cooldown. A direct read-only reproduction confirmed consecutive sends at the same timestamp succeed. | [auth.js:125](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/core/auth.js:125), [otp.js:203](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:203) | **4.1**, recovery §1: expired-code resend obeys cooldown |
| **Restart changes the meaning of retained deadlines.** Restart clears the fast-forward clock offset while preserving stored OTP deadlines. Fast-forward into a lock, restart, and its remaining duration increases by the discarded offset. Preserve a consistent time base for persisted limits. | [boot.js:97](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/core/boot.js:97) | **4.1, 3.2**, recovery §1: limits survive journey restart |

**Should-fix**

| Finding | File and line | Checklist |
|---|---|---|
| **Verify and Resend can overlap.** Resend remains actionable during verification; Verify remains actionable during resend. Verification reads mutable `m.code` when its delayed callback runs. A resend started first can clear that code before verification evaluates it, incorrectly consuming a wrong attempt. Capture the submitted code and coordinate pending actions. | [otp.js:184](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:184), :215 | **4.1, 6.2**; feedback contract L1 |
| **First-keystroke replacement is absent for the prefilled sign-in value.** Typing into `sign-in_pasted-cleaned` appends and then truncates back to the existing number. Neither real-input nor drawn-keyboard handling replaces it. | [sign-in.js:114](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/sign-in.js:114), :125 | **4.1**, recovery §1: first keystroke replaces pasted/prefilled value |
| **OTP phone Back still returns to sign-in.** This does not resolve the previous critique against the recovery brief’s “sign-in via Change” instruction; the test now asserts the contrary behavior. There is a source conflict: approved `otp.html:8` explicitly mentions the phone-back gesture. Record and resolve that conflict rather than reporting this item fixed. | [otp.js:263](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:263), [entry-journeys.mjs:273](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/tests/entry-journeys.mjs:273) | **4.39**, recovery §1: Phone Back |

**Previous blockers — disposition**

| Previous blocker | Now fixed? |
|---|---|
| Sign-in skips validation/server outcomes | **Yes.** Validation, test-number routing, busy and offline outcomes are implemented. |
| Verify accepts empty/wrong OTP | **Yes.** Validation, code outcomes, attempt counting and successful-auth handoff exist. Pending-action overlap remains above. |
| Resend/limits are display-only | **Partly.** Handlers, ticking countdowns, storage and lock expiry exist; the blocking limit defects above remain. |
| Required markup/CSS recovery missing | **Yes.** Journey stylesheets and approved hierarchy replace inline styling and nested screen padding. |
| Keyboard/focus states missing | **Yes.** Drawn keyboard, arrival focus and current/error slot styling are implemented. |
| OTP copy/recipient bypass registry/data | **Yes.** Copy uses registry keys; live recipient comes from the submitted number. |

The supplied pairs and sheet show substantially restored picture fidelity. The conspicuous remaining notice differences include blue **call Doctor Ops** links, consistent with the recovery brief’s functional-link requirement; they should not be dismissed as antialiasing differences. Final compare-harness acceptance remains outside this session.

**Nice-to-have:** None raised.

Validation: auth checks **A1–A10 passed**, and `check-sources.mjs` passed. Browser journey tests could not run because the sandbox rejected the local server with `listen EPERM`; browser behavior findings above are source-based.