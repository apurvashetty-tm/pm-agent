**No blockers found. One should-fix remains.**

The original cooldown blocker is fixed in `requestCode`; the sign-in route also correctly passes the last-code flag into OTP. Auth tests A1–A12 passed independently.

**Should-fix — returning unlock drops the last-code flag.**  
[app/screens/returning-unlock.js:111](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/returning-unlock.js:111) forwards `resendAt` and `until`, but omits `lastCode: !!r.last`.

When **Use OTP instead**—including the failed-unlock fallback—issues the window’s last permitted code, OTP opens with a normal countdown. It later offers Resend even though the server refuses it. The correct notice and hidden Resend depend on `params.lastCode` at [app/screens/otp.js:70](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:70).

Forward the flag as sign-in now does, and add journey coverage for the unlock fallback issuing the last code. **Checklist 4.1, 4.3, 6.2; plan §5 Step 1; app-logic §2.**

**Nice-to-have:** none.

D-93’s notice and single Continue action match the saved comparison inspected. Its picture approval remains pending; D-94 baseline refresh remains session 6 work.

Validation: copy checks, state-map drift, synthetic-data scan and logo lock passed independently. Browser journeys stopped at server binding (`EPERM`); browser-based guards and fresh captures could not run in this sandbox. Saved visual evidence was inspected selectively, so this is not an exhaustive visual pass.

No files changed.