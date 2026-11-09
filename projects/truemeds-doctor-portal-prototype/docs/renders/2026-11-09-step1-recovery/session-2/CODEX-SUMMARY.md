# Session 2 Codex Critique — Summary

**Status:** Does NOT pass.

The four entry journey renderers (sign-in, OTP, faster-signin-offer, returning-unlock) are built as static state displays but lack:

1. **Live validation** — sign-in accepts any non-empty input; OTP accepts empty or any code
2. **State machine** — no handling of server outcomes, error recovery, or persistence
3. **UI fidelity** — extensive inline styles instead of journey CSS; missing keyboard/focus states
4. **Copy management** — hard-coded text instead of registry/MSG(); OTP recipient fixed to test number
5. **Navigation guards** — missing OTP-specific Back, placeholder links, resend handlers

These are critical blockers per the brief's requirements (§4.1, 6.2, app-logic §2, recovery brief's "No inline styles" rule).

**Actionable next steps:** Implement live validation, state transitions, and CSS recovery before the compare harness can meaningfully validate pixel output.

See `docs/renders/2026-11-09-step1-recovery/session-2/codex-critique.md` for the full table.
