| Row | Verdict |
|---|---|
| F01 | OK — exact D-84 wording. |
| F02 | OK — exact D-84 wording; owner remains unresolved. |
| F03 | OK. |
| F04 | OK. |
| F05 | OK. |
| F06 | OK. |
| F07 | OK — status fragment; “toast” classification is inaccurate. |
| F08 | OK for idle-expired; exclude pending-request state. |
| F09 | OK for manually-ended; exclude pending-request state. |
| F10 | OK — removes false confirmation from `s7f`. |
| F11 | OK. |
| F12 | OK. |
| F13 | Copy OK. Capture list omits changed 360 picture: unchanged layout still means changed text. D-84 amendment requires affected pictures updated. |
| F14 | OK — callback time survives in title. |
| F15 | OK — title supplies waiting context; body promises no confirmation. |
| F16 | OK. |
| F17 | OK. |
| F18 | OK. |
| F19 | OK. |
| F20 | OK. |
| F21 | OK. |
| F22 | Incomplete: preserves “shortly” in `forwardedTell`/`scriptForward`. No agreed callback timing supports that promise (rule 6). Remove “shortly” unless timing is confirmed. |
| F23 | OK. |
| F24 | OK. |
| F25 | Incomplete: blanket “Edit…” includes closed/read-only rows. Use medicine name + strength without action wording there; app-logic §8 prohibits editing. |
| F26 | Fit unproven. Non-breaking spaces prevent wrapping but can cause overflow; verify actual chip width at 360 with enlarged text before passing rule 24. |
| F27 | OK. |
| F28 | OK — associate callback error with both affected groups. |

Important omissions:

- **No unsuccessful-record outcome copy:** D-83 §9 covers insufficient duration, unanswered patient and record timeout. F15 fixes waiting only. Eventual failure needs explicit “not confirmed” outcome; never leave indefinite waiting or show success.
- **`call.notThrough`:** “Call didn’t go through.” still breaks rule 8’s failed-operation pattern. Use “Couldn’t connect the call.”
- **Deferred failures remain failures:** “Unavailable” overflow still violates rule 24, even if granted fixed-name status. Split resend text still violates whole-string requirement; timer-format disagreement needs resolution.
- **Annex authority statement is stale:** opening says annex overrides frozen pictures. D-84 amendment makes updated pictures authoritative.

Fit assessment uses existing audit evidence; no fresh rendering performed.