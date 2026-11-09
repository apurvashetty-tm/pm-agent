Session 2 does **not pass**. The sign-in and OTP modules remain static state renderers with placeholder navigation.

Reviewed the current files against both briefs, plan v3.2, applicable checklist lines, and approved picture/source references. No files written. Findings below are source-based; browser journeys and pixel comparisons were not run. Sessions 3–4 deliverables are excluded.

**Blockers**

| Finding | File and line | Checklist |
|---|---|---|
| **Sign-in skips validation and server outcomes.** Any nonempty value—including `1` or an invalid first digit—opens OTP. Test numbers, offline/story choices, sending, inactive and locked-number routing are ignored. Empty input only receives focus. | [sign-in.js:214](app/screens/sign-in.js#L214) | **4.1, 6.2** |
| **Verify accepts an empty or wrong OTP.** The handler goes directly to `home_default`, without reading the entered code. Correct, expired, server-error and wrong-code outcomes never execute; no wrong-attempt accounting or successful-auth handoff exists. | [otp.js:289](app/screens/otp.js#L289) | **4.1, 6.2** |
| **Resend and limits are display-only.** Resend code has no handler; countdowns never tick; lock times are literal strings. No per-number code window, escalating cooldown, lock expiry or restart-persistent limits exist. | [otp.js:338](app/screens/otp.js#L338), [otp.js:349](app/screens/otp.js#L349) | **4.1, 3.2**; plan **B10** |
| **Required markup/CSS recovery was not done.** Both modules still build extensively inline-styled DOM; no journey stylesheets exist. Sign-in moves the fields outside the approved `.login-content` hierarchy. Its rendered section inherits another `.shell-screen` padding inside the host, and lacks the approved tinted screen background. These are structural picture mismatches. | [sign-in.js:29](app/screens/sign-in.js#L29), [sign-in.js:68](app/screens/sign-in.js#L68), [otp.js:61](app/screens/otp.js#L61), [shell.css:35](app/shell/shell.css#L35) | **2.1, 3.4**; recovery brief’s **“No inline styles”** rule |
| **Approved keyboard/focus states are missing.** Neither module draws the keyboard in review/capture. OTP never focuses on arrival or assigns `.is-current`; inline slot borders override central focus/error styling. Slots also override approved digits and spacing with `28px` and `--tm-space-md`. | [otp.js:158](app/screens/otp.js#L158), [otp.js:310](app/screens/otp.js#L310), [sign-in.js:186](app/screens/sign-in.js#L186) | **2.1, 3.4, 4.1**; locked specs **L1, L3** |
| **OTP copy and recipient bypass the registry/data.** Title, Change, consent, buttons and resend text are hard-coded. The recipient is always `+91 90000 00001`, regardless of the submitted number; capture also disagrees with the approved recipient. | [otp.js:91](app/screens/otp.js#L91), [otp.js:261](app/screens/otp.js#L261), [otp.js:283](app/screens/otp.js#L283) | **3.1, 3.7**; plan **B6** |

**Should-fix**

| Finding | File and line | Checklist |
|---|---|---|
| **Editing does not recover error states.** Sign-in input only strips characters and truncates; it neither removes leading `0`/`91` correctly nor clears/rechecks errors. OTP ignores `state.replace`, so the first new keystroke does not replace a wrong code, and the error remains. | [sign-in.js:208](app/screens/sign-in.js#L208), [otp.js:302](app/screens/otp.js#L302) | **4.1, 6.2** |
| **Typed mobile number is lost.** Sign-in does not save it before navigating; every render resets the field from fixtures. Change returns to an empty default instead of retaining the entered number. | [sign-in.js:186](app/screens/sign-in.js#L186), [sign-in.js:219](app/screens/sign-in.js#L219), [otp.js:103](app/screens/otp.js#L103) | **4.1**; recovery §1 **“typed input never replaced by fixtures”** |
| **Phone Back returns OTP to sign-in.** Navigation pushes OTP over sign-in without an OTP-specific Back guard. This contradicts the recovery brief’s “OTP has no Back → sign-in via Change” requirement. | [sign-in.js:219](app/screens/sign-in.js#L219), [nav.js:14](app/core/nav.js#L14) | **4.39** |
| **Required placeholder links are absent.** Terms and Privacy point to `#`. Inactive sign-in’s Call Doctor Ops label executes the ordinary OTP navigation; OTP notices provide no actionable Ops link. | [otp.js:261](app/screens/otp.js#L261), [otp.js:338](app/screens/otp.js#L338), [sign-in.js:214](app/screens/sign-in.js#L214) | **1.6, 4.1**; recovery §1 **Links** |
| **“New code sent” adds an explicitly rejected icon.** The approved rule calls for green text without an icon; this renderer adds `check-circle`. | [otp.js:200](app/screens/otp.js#L200) | **1.5, 2.1**; app-logic §2 **A-21** |
| **The copy guard does not inspect these modules.** `check-sources.mjs` reads approved HTML sources, so passing it cannot validate hard-coded copy in `app/screens/`. No entry journey tests or session-2 screenshot evidence were present in the inspected tree. | [check-sources.mjs:23](ui-screens/feedback/check-sources.mjs#L23), [otp.js:261](app/screens/otp.js#L261) | **2.5, 3.7, 4.1**; session-2 completion gate |

**Nice-to-have**

None raised. The remaining work is required behavior, picture fidelity and verification—not polish.