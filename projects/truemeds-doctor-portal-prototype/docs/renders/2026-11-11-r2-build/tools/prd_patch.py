"""D1: docs/prd/PRD.md §5.1 – 5.5 for D-106 – D-109 (lean PRD: what and why; one-off patch, kept for the record).
PRD.confluence.md is regenerated / mirrored by the same edits (Confluence push only on "sync")."""
import pathlib, sys

EDITS = [
    # 5.1 sign-in
    ('- Send OTP sits right under the field, so the field and its action stay together above the keyboard.',
     '- Send OTP sits right under the field, so the field and its action stay together above the keyboard.\n- Sign-in, OTP, the offer, unlock and Home share one header band and one spacing standard (gaps measured on what the eye sees), so sibling screens look the same.'),
    ('**What the doctor can do:** enter a mobile number and tap Send OTP; tap Sign up (opens Truemeds\' existing doctor sign-up form).',
     '**What the doctor can do:** enter a mobile number (helper: "We’ll send you an OTP by SMS.") and tap Send OTP; tap Sign up (opens Truemeds\' existing doctor sign-up form).'),
    ('- Code couldn\'t be sent → "Couldn’t send the code."', '- OTP couldn\'t be sent → "Couldn’t send the OTP."'),
    # 5.2 OTP
    ('- Verify & sign in never moves for one-line messages, so the doctor\'s thumb finds it in the same place every time.',
     '- No reserved empty space: a one-line message under the code (wrong code, new code sent) moves the lines below it down by one line, so the screen never shows a gap that looks like a missing message.'),
    ('- New code sent → "New code sent".', '- New code sent → "New code sent."'),
    # 5.3 offer
    ('**Job to be done:** skip the OTP next time.', '**Job to be done:** skip OTPs next time.'),
    ('- It can be turned on or off any time in Profile. The phone\'s back gesture means Not now.',
     '- It can be turned on or off any time in Profile. The phone\'s back gesture means Not now.\n- The screen is titled "Skip OTPs next time"; its first point reads "Sign in with one touch" (Face ID "with a glance", screen lock "with your PIN or pattern") / "No SMS to wait for."'),
    # 5.4 unlock
    ('- It\'s the first screen when the app opens for a doctor with faster sign-in on, so it greets them by name and has one main action.',
     '- It\'s the first screen when the app opens for a doctor with faster sign-in on, so it greets them by name and has one main action.\n- The phone\'s fingerprint / Face ID / screen-lock prompt opens by itself when the app opens, as banking and payment apps do, which saves a tap every time.'),
    ('- Two buttons only: Unlock (main) and Use OTP instead. There is no separate Switch account.',
     '- The phone\'s prompt opens by itself once when the app opens here. Cancelling it leaves the screen as it is, with no new prompt; Unlock stays for a retry. The automatic prompt counts as a try.\n- Two buttons only: Unlock (main) and Use OTP instead. There is no separate Switch account.'),
    ('- Prompt cancelled → back on the screen, no message.', '- Prompt cancelled (on arrival or after Unlock) → back on the screen, no message, no new prompt.'),
    # 5.5 Home
    ('**What the doctor can do:** set how long they\'re available (quick picks 15, 30 and 45 minutes, 1, 2 and 3 hours, or a wheel in 15-minute steps); Request a case; Add time when time is running low; End availability; open Profile, Help and notifications.',
     '**What the doctor can do:** set how long they\'re available ("Start taking cases": Quick picks 15, 30 and 45 minutes, 1, 2 and 3 hours, or Custom, a wheel in 15-minute steps up to 10 hours, with "Available until {time}" above Set availability); Request a case ("You can take cases"); Add time at any point while available; tap Prescriptions written today to open Profile; End availability; open Profile, Help and notifications.'),
    ('- Availability has a minimum length (§7), any start time, no maximum.',
     '- Availability is 15 minutes to **10 hours in total** (§7), any start time. Add time tops out at what is left of the 10 hours ("Up to 10 hours in total"); the button names the time ("Add 30 min", "Add 9 h 45 min").'),
    ('- Home shows time remaining and prescriptions confirmed today (a count only, no earnings). A case counts once its prescription is confirmed.',
     '- Home shows one card: time remaining, with Add time always on its line (greyed offline), and prescriptions written today (a count only, no earnings), which opens Profile. A case counts once its prescription is confirmed. After availability ends, the count shows as one row above the picker when it is above 0.'),
    ('- Ending soon → "Availability ends soon. You can still request a case." with + Add time.',
     '- Ending soon → "Availability ends soon. You can still request a case." (Add time is always there).'),
    ('- End availability → confirmation sheet; with a request pending', '- End availability → confirmation sheet ("You won’t get new cases after this…"); with a request pending'),
    ('- Ended with a request still out → "Your last request is still active."', '- Ended with a request still out → title "Availability ended", "Your last request is still active.", time 0:00.'),
]

for f in ['docs/prd/PRD.md', 'docs/prd/PRD.confluence.md']:
    p = pathlib.Path(f); s = p.read_text(); n = 0; miss = []
    for a, b in EDITS:
        if a in s: s = s.replace(a, b); n += 1
        else: miss.append(a[:60])
    p.write_text(s)
    print(f, 'edits', n, 'missing', len(miss), miss[:4])
