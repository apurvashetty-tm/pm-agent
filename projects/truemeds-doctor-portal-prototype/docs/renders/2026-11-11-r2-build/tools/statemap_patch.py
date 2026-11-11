"""R2: docs/feedback-state-map.md rows for D-106 – D-109 (one-off patch, kept for the record). Run from the project folder."""
import pathlib
p = pathlib.Path('docs/feedback-state-map.md'); s = p.read_text()


def rep(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b)


rep('''| signin.default | None | Entry; neutral SMS helper | Existing |''',
    '''| signin.default | None | Entry; neutral SMS helper "We’ll send you an OTP by SMS." (D-109); field + helper → 32 → Send OTP (D-108); "Sign up" a real link, 48 hit area, no added height | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| signin.couldnt-send | F2 | Confirmed send failure; retain number and retry | R03 sibling + layout QA |''',
    '''| signin.couldnt-send | F2 | Confirmed send failure; retain number and retry. Copy "Couldn’t send the OTP." (D-109). Every sign-in notice: 16 under the field, 32 above Send OTP (D-108) | R03 sibling + layout QA |''')
rep('''| otp.default | None | Keyboard open on load; box 1 focused; resend timer running (D-44) | Superseded: layout v2 capture pending |''',
    '''| otp.default | None | Keyboard open on load; box 1 focused; resend timer running (D-44). Boxes → 32 → resend line → 32 → legal → 8 → Verify; the empty message line holds no space (D-108); "Change" an inline link (D-107) | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| otp.new-code-sent | S1 | Confirmed resend; restart countdown | Existing; reposition only through review |''',
    '''| otp.new-code-sent | S1 | Confirmed resend; restart countdown. Copy "New code sent." (D-109), 8 under the boxes | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| otp.locked | W1 | Keyboard closed; boxes and Verify disabled; resend and consent lines hidden; authoritative cooldown recovery (D-44) | R04 |''',
    '''| otp.locked | W1 | Keyboard closed; boxes and Verify disabled; resend and consent lines hidden; authoritative cooldown recovery (D-44). Boxes → 16 → notice → 32 → Verify (D-108) | R04 |''')
rep('''| otp.code-expired | F1 | Code stays visible; "Resend code" available at once; Verify of the same code blocked | R02 |''',
    '''| otp.code-expired | F1 | Code stays visible; "Resend code" available at once; Verify of the same code blocked; the legal line is hidden and keeps no height (D-108, replaces Round 5 B) | R02 |''')
rep('''| offer.shown | None | After an OTP sign-in on a supported device where faster sign-in is off; at each OTP sign-in until turned on, at most `fasterOfferMax` (3) times (D-104) |''',
    '''| offer.shown | None | After an OTP sign-in on a supported device where faster sign-in is off; at each OTP sign-in until turned on, at most `fasterOfferMax` (3) times (D-104). Title "Skip OTPs next time" (D-107); point 1 "Sign in with one touch" / "No SMS to wait for." (Face ID "with a glance", screen lock "with your PIN or pattern"); point titles semibold; hero → 32 → points, 16 apart (D-108, D-109) |''')
rep('''| unlock.pending | L1 + OS prompt | No concurrent authentication request | Fixture |''',
    '''| unlock.auto-prompt | L1 + OS prompt | The app opens on unlock → the phone's prompt opens by itself, once (D-109 §3, amends D-38 / D-105); the screen shows `unlock.pending` meanwhile. Re-renders, Back from Sign-in and picture states never prompt again; the automatic prompt counts as a try | Same picture as `unlock_pending` |
| unlock.pending | L1 + OS prompt | No concurrent authentication request (on arrival, or after Unlock) | Fixture |''')
rep('''| unlock.cancelled | None | Return to unchanged screen; cancellation is not failure | Fixture |''',
    '''| unlock.cancelled | None | Return to unchanged screen (today's screen, no new prompt; Unlock stays for a retry, D-109 §3); cancellation is not failure | Fixture |''')
rep('''| home.setup | None | Wheel + presets, minimum reminder once | Existing wheel |''',
    '''| home.setup | None | "Start taking cases" / "You can add time or stop anytime." · "Quick picks" → 32 → "Custom" (wheel 0–10 h; at 10 h minutes 0; at 0 h 15 / 30 / 45) · "Available until {time}" 8 above Set availability; no range text, no "Minimum 15 minutes" (D-106) | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| home.active | None | Timer and Request a case | Existing |''',
    '''| home.active | None | "You can take cases" / "Request a case now, or whenever you’re ready." (D-107); one card: Time remaining (+ Add time always shown, greyed offline) · Prescriptions written today → Profile (D-106); Request a case | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| home.near-expiry | W1 | Keep Add time placement; last-second requests valid | Existing draft requires corrected layout; later review |''',
    '''| home.near-expiry | W1 | "Availability ends soon…" in the bar; Add time in its usual place (always shown, D-106); last-second requests valid | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| home.add-open | None | Wheel sheet; same duration controls, no repeated helper | Existing wheel sheet |''',
    '''| home.add-open | None | Sheet "Add time" (D-109) with the subtitle in the header; same Quick picks / Custom picker; the wheel tops out at what is left of 10 hours, hint "Up to 10 hours in total"; button "Add 30 min" / "Add 9 h 45 min" (D-106) | Re-rendered 2026-11-11 (r2-build) |''')
rep('''| home.add-failed | F2 | Keep sheet/selection and original deadline; retry confirmed failure | R07 |''',
    '''| home.add-failed | F2 | Keep sheet/selection and original deadline; retry confirmed failure. The error sits in the pinned actions, 16 above Add (D-106) | R07 |''')
rep('''| home.expired-pending | N1 + L1 | Honour request already submitted; do not interrupt case | Same pending layout; fixture |''',
    '''| home.expired-pending | N1 + L1 | Honour request already submitted; do not interrupt case. Title "Availability ended" (D-107); time 0:00, no Add time | Same pending layout; fixture |''')
rep('''| home.idle-expired / manually-ended | N1 + setup | Reuse setup; keep prescription count; no giant0-minute error screen | Existing setup integration QA |''',
    '''| home.idle-expired / manually-ended | N1 + setup | Reuse setup; the notice at the top, 32 to the content; "Prescriptions written today" as one row above the picker when above 0 (D-106); no giant 0-minute error screen | Re-rendered 2026-11-11 (r2-build) |''')
p.write_text(s)
print('ok')
