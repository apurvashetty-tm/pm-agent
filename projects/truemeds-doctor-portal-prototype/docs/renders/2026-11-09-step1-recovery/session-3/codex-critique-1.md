Reviewed Session 3 commits `8d7fb23` and `6d97436`, scoped to offer, unlock, D-92, F1–F9 and their evidence. No files changed.

**Blockers:** None found.

**Should-fix**

- **Returning unlock can advertise a method the phone no longer supports.** [app/core/faster-signin.js:25](app/core/faster-signin.js:25) prioritises the stored enrolment method over current phone capabilities. Enable fingerprint, change the mock device to screen-lock-only, then reopen: it still selects `unlock_fingerprint`. Resolve against current capabilities and add this returning-user journey test. **Checklist 4.2, 4.3; app-logic §2 / D-64.**

- **The unavailable-enrolment decision is recorded only in code.** [app/screens/faster-signin-offer.js:7](app/screens/faster-signin-offer.js:7) marks treating `unavailable` as enable failure `[OPEN DECISION]`, but `docs/context/open_questions.md` has no corresponding entry. Report this to the main thread for recording, including the placeholder and source gap. The recovery brief permits this placeholder; the missing durable record is the issue. **Checklist 1.6.**

**Nice-to-have**

- **F8’s comment overstates its coverage.** [tests/entry-journeys.mjs:534](tests/entry-journeys.mjs:534) says “demo always succeeds,” but the test exercises review mode only. Add a demo assertion or narrow the comment. **Plan B14; checklist 4.2–4.3.**

The contact sheet supports the D-92 name/initials-only change. Offer differences remain in the saved diff tables; region explanations and acceptance belong to Session 4’s compare harness, so I have not treated that deferred work as a Session 3 blocker.

Validation was source and saved-evidence review; I did not rerun browser tests or guards in the read-only environment.