# Prototype review feedback: Apurva's log (from 2026-11-09)

Apurva's observations from playing the built prototype (desktop and phone). The main thread vets each one and gives a verdict:
- **BUG:** the build doesn't match an approved screen, rule or decision. Fixed where it occurs, at the start of the next terminal run.
- **NEXT VERSION:** a new idea for frozen screens. Logged in `docs/context/backlog.md` §4b, not applied now.
- **NO CHANGE:** the build is right as approved; the reason is given.

| # | Date | Where | Observation | Verdict | Status |
|---|---|---|---|---|---|
| F-01 | 2026-11-09 | Sign-in, "Couldn't send the code." (test number 9000000004) | Should the button read "Try again" instead of "Send OTP"? | **NO CHANGE.** The approved screen and app-logic §2 keep "Send OTP". The button acts on the number in the field, which the doctor can still edit, so "Send OTP" stays true whether they retry or fix the number; "Try again" would be wrong after an edit. Buttons change label only where the action changes: "Try again in m:ss" while blocked, and "Call Doctor Ops" when the account is inactive. The faster sign-in offer uses "Try again" because it has nothing to edit, so the only thing the button can do is retry. | Closed |
| F-02 | 2026-11-09 | OTP on a phone (play link in Chrome) | After typing the code, the screen doesn't move up, so **Verify & sign in** is hidden behind the keyboard. (The desktop is fine: it shows the drawn keyboard, and the layout sits above it.) | **BUG, small fix only (Apurva: don't sink time).** The phone's real keyboard covers the page instead of resizing it. Fix: add `interactive-widget=resizes-content` to the viewport meta in `app/index.html`, which makes Android Chrome resize the page so the pinned button sits on the keyboard. Check once on a phone-sized Playwright run. **Time box: 15 minutes.** If that doesn't solve it (e.g. iOS Safari), stop and mark it "for Engineering": the native app handles the keyboard itself, so this prototype fix doesn't carry over anyway. | Open |
