# A · checklist results, round 16

Source: `guard-round-16.json` (check-locked-specs.py at 390, 360, 430) plus the 8.1 coverage check. Auto lines are machine-checked on every state. **Eye lines** (1.2, 1.5–1.6, 2.5, 2.8, 3.3, 3.8, 4.4, 4.8, 5.2, 5.7, 5.9, 5.10, 5.13, 5.14, 7.x, 7b.x, 8.3 guards only) are judged on the contact sheets and in `changes.md`; they are not marked here.

`pass` = no failure on that line at that width. `FAIL` lists the failing lines. 430 runs guards only (8.3).

| Phase · state | 390 | 360 | 430 |
|---|---|---|---|
| A · sign-in/default | pass | pass | pass |
| A · sign-in/keyboard-open | pass | pass | pass |
| A · sign-in/empty-tap | pass | pass | pass |
| A · sign-in/too-short | pass | pass | pass |
| A · sign-in/wrong-first-digit | pass | pass | pass |
| A · sign-in/pasted-cleaned | pass | pass | pass |
| A · sign-in/sending | pass | pass | pass |
| A · sign-in/not-registered | pass | pass | pass |
| A · sign-in/offline | pass | pass | pass |
| A · sign-in/couldnt-send | pass | pass | pass |
| A · sign-in/too-many-tries | pass | pass | pass |
| A · sign-in/inactive | pass | pass | pass |
| A · otp/default | pass | pass | pass |
| A · otp/empty-tap | pass | pass | pass |
| A · otp/too-short | pass | pass | pass |
| A · otp/verifying | pass | pass | pass |
| A · otp/wrong-code | pass | pass | pass |
| A · otp/two-tries-left | pass | pass | pass |
| A · otp/resend-available | pass | pass | pass |
| A · otp/new-code-sent | pass | pass | pass |
| A · otp/code-expired | pass | pass | pass |
| A · otp/couldnt-verify | pass | pass | pass |
| A · otp/too-many-resends | pass | pass | pass |
| A · otp/locked | pass | pass | pass |
| A · otp/resending | pass | pass | pass |
| A · otp/resend-failed | pass | pass | pass |
| A · otp/offline | pass | pass | pass |
| A · otp/cooldown-reconciling | pass | pass | pass |
| A · otp/expired-and-resend-limited | pass | pass | pass |

