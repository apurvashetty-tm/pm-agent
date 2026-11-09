**One blocker and one should-fix. Step 1 is not ready to pass.**

**Blocker — restarting sign-in bypasses the OTP resend cooldown.**  
[app/core/auth.js:89](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/core/auth.js:89) appends a new send without checking the existing cooldown. Reproduction: Send OTP → Change → Send OTP again on the same number before the wait ends. The server mock sends another code. I reproduced this directly against the auth module. Apply the same per-number cooldown across sign-in and resend, and add a journey test for this route. **Checklist 4.1; recovery brief §1, limits surviving journey restart.**

**Should-fix — the fourth code sent through sign-in shows the wrong OTP state.**  
[app/screens/sign-in.js:162](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/sign-in.js:162) always opens `otp_default` after a successful send. [app/screens/otp.js:63](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/app/screens/otp.js:63) then uses its normal countdown without reading the remaining-code count. When that send exhausts the window, the screen should show the approved “too many resends” state with Resend hidden; instead, it eventually offers Resend and rejects the tap. Initialise OTP from the server’s remaining allowance. **Checklist 4.1, 6.2; app-logic §2.**

**Nice-to-have:** none.

D-93’s notice, single Continue action, offered/not-enabled handling, and journey coverage are present. The saved comparison reports zero changed pixels at both widths; I inspected the 360-wide comparison. The new picture correctly remains pending approval in [session-5/d93/README.md:1](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/docs/renders/2026-11-09-step1-recovery/session-5/d93/README.md:1). Hero removal is explicitly identified there as a judgement for approval.

Validation limits: auth unit checks A1–A11 passed. Browser journeys stopped because the sandbox rejected server binding (`EPERM`); browser guards and captures were not independently rerun. Saved visual evidence was reviewed selectively, so this is not a full visual pass. D-94’s repeatable-capture work belongs to session 6.

No files changed.