"""R1: ui-screens/app-logic.md §1–3 for D-106 – D-109 (one-off patch, kept for the record). Run from the project folder."""
import pathlib
p = pathlib.Path('ui-screens/app-logic.md'); s = p.read_text()


def rep(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b)


rep('''Order on first use: Sign-in → OTP → (offer, at most 3 times — D-104) → Home → Case. Returning doctor with faster sign-in on: Unlock → Home. A doctor with a case open goes straight back into the case (D-48).''',
    '''Order on first use: Sign-in → OTP → (offer, at most 3 times — D-104) → Home → Case. Returning doctor with faster sign-in on: Unlock → Home. A doctor with a case open goes straight back into the case (D-48).

**One band and one screen standard (D-107, D-108, 2026-11-11).** Sign-in, OTP, the offer, unlock and Home share one band (logo 16 from the top · logo → title 16 · title → subtitle 8 · subtitle → panel 32; the panel top lands at 173) and one screen standard below it, with gaps measured between **visible** edges: 8 joins parts of one thing, 16 separates items in one group, 32 separates different things. Tap areas and reserved message lines add no visible space. Spec: `design-system/RULES.md` "Entry and home screens"; the visible-gap check stops the build. Words: **OTP** outside the OTP screen, **code** on it; **faster sign-in**; **availability** (the window), **time** (its length), **case**, **get** (new cases) (D-109).''')

# §2 sign-in
rep('''- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**).''',
    '''- Helper under the field: "We’ll send you an OTP by SMS." Field and helper → 32 → **Send OTP** (D-108, D-109).
- After sending, server results show as a notice 16 under the field and 32 above Send OTP (D-108): not registered (with the sign-up route), offline, "Couldn’t send the OTP." (D-109), too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**).
- "Sign up" is a real link with a 48 hit area that adds no height (D-108).''')

# §2 OTP
rep('''- **Verify never moves (Round 5 B, Round 6 item 3):** one line is reserved under the code boxes. Every state with a one-line message (wrong code, tries left, new code sent, code expired, empty or too short, resend, cooldown) shows its message there, or nothing; Verify & sign in keeps the same place. Notice-box states (offline, locked, couldn't verify, resend failed, too many codes) may move it; accepted.
- Waiting text ("Resend in 0:30") and the Resend code link share one height, so Verify & sign in never moves when the link appears (A-03). The terms line is centred and "Terms & Conditions" never splits (A-01, A-02). "Doctor Ops" and the timer never split across lines (A-17). "New code sent." is green text with no icon, like the errors (A-21).''',
    '''- **Layout (D-108, replaces Round 5 B "Verify never moves"):** code boxes (+ the message line, 8 under them) → 32 → "Didn’t receive it? Resend" → 32 → the legal line → 8 → **Verify & sign in**. The message line holds **no space when empty** (reserved lines add no visible space), so a one-line message (wrong code, tries left, "New code sent.", code expired, empty or too short) moves the lines under it down by one line. Locked / expired-and-limited: boxes → 16 → notice → 32 → Verify. Other notices (offline, couldn't verify, resend failed, too many codes): 16 under the boxes, 32 to the next thing. An expired code hides the legal line (it no longer keeps its height).
- "Change" in the subtitle and "Resend code" are inline links with a 48 hit area that adds no height (D-107 variant 3, D-108). The terms line is centred and "Terms & Conditions" never splits (A-01, A-02). "Doctor Ops" and the timer never split across lines (A-17). "New code sent." is green text with no icon, like the errors (A-21).''')

# offer
rep('''- Offered on its own screen after an OTP sign-in''', '''- Title "Skip OTPs next time" (D-107). Points: "Sign in with one touch" (Face ID "with a glance", screen lock "with your PIN or pattern") / "No SMS to wait for." · the trust point · "Change it any time"; point titles semibold; hero tile → 32 → points, 16 apart (D-108, D-109).
- Offered on its own screen after an OTP sign-in''')

# unlock
rep('''- Returning unlock: two buttons (D-105), **Unlock** (primary) · **Use OTP instead** (quiet); no "Switch account". The phone's own prompt; 3 failed tries `[MOCK]` → the same as Use OTP instead.''',
    '''- Returning unlock: two buttons (D-105), **Unlock** (primary) · **Use OTP instead** (quiet); no "Switch account". **The phone's prompt opens by itself once when the app opens on this screen (D-109 §3, amends D-38 / D-105)**; cancelling shows the screen as it is, with no new prompt; **Unlock** stays for a retry. The automatic prompt counts as a try: 3 failed tries `[MOCK]` → the same as Use OTP instead. A picture or a jump to an unlock state never prompts. Tile → 16 → "Ready when you are" (D-108); a greeting with a long name may wrap to two lines (D-107 variant 2).''')

# §3 Home
rep('''## 3. Home and availability `[LOCKED]` (D-36, D-40, D-47, D-53)''', '''## 3. Home and availability `[LOCKED]` (D-36, D-40, D-47, D-53, D-106)''')
rep('''- **Set availability:** quick picks 15 / 30 / 45 min, 1 / 2 / 3 hours, plus the wheel (hours and minutes, 15-minute steps). The wheel behaves like a phone's own time wheel (F-04): swipe it, it carries on with momentum and snaps to one row (minutes in 15-minute steps); a tap on the row above or below moves one step; the value is set when the wheel comes to rest, and Set availability / Add tapped while it still moves use the value in the band. Minimum **15 minutes**, any start time, no maximum (24/7). Confirm starts the countdown.
- **Time remaining:** h:mm:ss from one hour up (1:00:00), m:ss below (9:42). Shows 0:00 when it has ended (D-53, 2026-10-15). The label and the timer do not move when **+ Add time** appears; Add time sits on the value row (A-09). Labels are 14 px grey (A-10).''',
    '''- **Setup (D-106):** title "Start taking cases" · subtitle "You can add time or stop anytime." · **"Quick picks"** (15 / 30 / 45 min, 1 / 2 / 3 hours) → 32 → **"Custom"** (the wheel, always shown: hours and minutes, 15-minute steps) · "Available until {time}" 8 above **Set availability**. No range text and no "Minimum 15 minutes": the wheel itself stops at 15 min and 10 h. The wheel behaves like a phone's own time wheel (F-04): swipe it, it carries on with momentum and snaps to one row; a tap on the row above or below moves one step; the value is set when the wheel comes to rest, and Set availability / Add tapped while it still moves use the value in the band. Confirm starts the countdown.
- **10 hours in total (D-106, replaces D-36 "no maximum"):** the setup wheel goes 0–10 h (at 10 h minutes 0 only; at 0 h 15 / 30 / 45). Setting `availabilityMaximum`.
- **Available (D-106, D-107):** title "You can take cases" · subtitle "Request a case now, or whenever you’re ready." · one card (as on the case page) with two rows of one anatomy (grey icon · 16/24 regular label · L9 value): **Time remaining** with **+ Add time always shown** (compact secondary, on the value line; greyed offline) and **Prescriptions written today**, which opens Profile (chevron; Back returns to Home). Replaces A-09 ("Add time near expiry only") and A-10 (labels 14 grey).
- **Time remaining:** h:mm:ss from one hour up (1:00:00), m:ss below (9:42). Shows 0:00 when it ran out with a request still open (D-53; no Add time then, the window has ended). Ending availability (stop-pending) has no time row (D-47).
- **Titles by state (D-107):** setup, idle-expired and manually ended: "Start taking cases"; available (incl. requesting, no cases, failures, offline, near expiry, the sheets, unknown result): "You can take cases"; stop-pending: "Ending availability" / "You won’t get new cases."; ran out with a request open: **"Availability ended"** / "You won’t get new cases."''')
rep('''- **Add time:** shown when time is running low (near expiry, `[MOCK]` 5 min); same picker in a sheet; "Time added" toast. An error in the add-time sheet sits 16 above its button, as on the page (A-12).''',
    '''- **Add time (D-106):** always shown while available (greyed offline, and greyed when less than 15 minutes fit under the 10-hour total — `[MOCK ASSUMPTION]`, D-106 is silent). Sheet title "Add time", subtitle "Choose how much time to add." (8 under the title, inside the header, D-109); the same Quick picks / Custom picker; the wheel tops out at what is left of the 10 hours (rounded down to 15 minutes), hint "Up to 10 hours in total" on the Custom line; quick picks above that are greyed. Button "Add 30 min", "Add 1 h", "Add 9 h 45 min" (hours and minutes from 60 min up). "Time added" toast. The error ("Couldn’t add time.") sits **in the pinned actions, 16 above Add**, so it shows on arrival at 360 × 640.''')
rep('''- **End availability:** confirmation sheet. If a request is pending''', '''- **End availability:** confirmation sheet, "You won’t get new cases after this. A case already assigned to you stays with you." (D-109). If a request is pending''')
rep('''- **Prescriptions today:** a count only, no earnings. A case counts when its prescription is confirmed. It stays visible after availability ends.''',
    '''- **Prescriptions written today:** a count only, no earnings. A case counts when its prescription is confirmed. On the available card it opens Profile (D-106). Not on fresh setup; on ended Home (idle-expired, manually ended) it shows as one row above the picker when the count is above 0 (D-106).''')
rep('''Screen-wide standing notices (idle-expired, manually ended, expired-pending, stop-pending) stay at the top of the panel.''',
    '''Screen-wide standing notices (idle-expired, manually ended, expired-pending, stop-pending) stay at the top of the panel, 32 above the content (D-108).''')
p.write_text(s)
print('ok')
