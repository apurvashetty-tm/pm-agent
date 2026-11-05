#!/usr/bin/env python3
"""Build map for plan v3 (review aid, read-only over ui-screens/).

Run from the project folder (needs Pillow; on this Mac use /usr/bin/python3):
    /usr/bin/python3 ui-screens/_qa/build-map.py

Reads the step -> picture list from docs/proposals/2026-11-05-prototype-build-plan-v3.md section 5,
expands it against the approved 390-wide pictures in ui-screens/, and writes
  docs/reviews/2026-11-05-plan-v3-review/build-map/step-<n>.png   (steps 1-6 and 9)
  docs/reviews/2026-11-05-plan-v3-review/build-map/index.md

Labels come from ui-screens/README.md, calling-flow/data.js, app-logic.md and feedback-state-map.md.
Pictures are not re-rendered; only approved pictures are used.
"""
import pathlib
import re
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path('.')
PLAN = ROOT / 'docs/proposals/2026-11-05-prototype-build-plan-v3.md'
OUT = ROOT / 'docs/reviews/2026-11-05-plan-v3-review/build-map'
UI = ROOT / 'ui-screens'
FOLDERS = ['sign-in', 'otp', 'faster-signin-offer', 'returning-unlock', 'home', 'prescribe', 'case']

SCALE = 0.4
TW, TH = int(390 * 2 * SCALE), int(844 * 2 * SCALE)   # 312 x 675 px thumbnails (2x density)
COLS = 5
PAD = 20
F_TITLE = ImageFont.load_default(size=44)
F_HEAD = ImageFont.load_default(size=30)
F_LABEL = ImageFont.load_default(size=22)
F_FLOW = ImageFont.load_default(size=26)

# ---------------------------------------------------------------- labels (render id -> one short line)
LABELS = {
    # sign-in
    'sign-in/sign-in_default': 'Mobile number entry, neutral SMS helper',
    'sign-in/sign-in_sending': 'Send pending, duplicate send disabled',
    'sign-in/sign-in_pasted-cleaned': 'Pasted +91 / spaces cleaned to 10 digits',
    'sign-in/sign-in_keyboard-open': 'Keyboard open, partial number, no early error',
    'sign-in/sign-in_empty-tap': 'Send with empty field: "Enter your mobile number."',
    'sign-in/sign-in_too-short': 'Under 10 digits: "Enter all 10 digits."',
    'sign-in/sign-in_wrong-first-digit': 'First digit not 6-9: "Mobile numbers start with 6, 7, 8 or 9."',
    'sign-in/sign-in_not-registered': 'Not registered (9000000001): sign-up route',
    'sign-in/sign-in_inactive': 'Inactive account (9000000002): Call Doctor Ops',
    'sign-in/sign-in_too-many-tries': 'Too many attempts (9000000003): countdown on button',
    'sign-in/sign-in_couldnt-send': 'Send failed (9000000004): number kept, retry',
    'sign-in/sign-in_offline': 'Offline notice, number kept',
    # otp
    'otp/otp_default': 'Code entry, keyboard open, resend timer running',
    'otp/otp_verifying': 'Verifying: terms line stays, Verify does not move',
    'otp/otp_wrong-code': 'Wrong code (any other OTP): digits stay, red borders',
    'otp/otp_two-tries-left': '"Wrong code. 2 tries left."',
    'otp/otp_too-short': 'Under 4 digits: input kept, edit',
    'otp/otp_empty-tap': 'Verify with no code: focus back to the boxes',
    'otp/otp_code-expired': 'Code expired (OTP 0000): resend available at once',
    'otp/otp_couldnt-verify': 'Server error (OTP 9999): code kept, resend line shown',
    'otp/otp_locked': 'Number locked after 5 wrong codes: Change still available',
    'otp/otp_too-many-resends': 'Resend limit reached: resend line hidden',
    'otp/otp_expired-and-resend-limited': 'Expired code and resends used up',
    'otp/otp_resend-available': '"Resend code" link under the notice',
    'otp/otp_resending': 'Resend in progress',
    'otp/otp_resend-failed': 'Resend failed: notice, retry',
    'otp/otp_new-code-sent': '"New code sent." in green, countdown restarts',
    'otp/otp_cooldown-reconciling': 'Cooldown line "Checking..." alone, boxes stay focused',
    'otp/otp_offline': 'Offline notice on OTP',
    # faster sign-in offer
    'faster-signin-offer/offer_fingerprint': 'Offer with fingerprint: Turn on / Not now',
    'faster-signin-offer/offer_face-id': 'Offer with Face ID wording',
    'faster-signin-offer/offer_screen-lock': 'Offer with screen-lock fallback (no biometrics)',
    'faster-signin-offer/offer_enabling': 'Turn on tapped, phone prompt pending',
    'faster-signin-offer/offer_enable-failed': 'Enable failed: "Couldn\'t turn on faster sign-in."',
    'faster-signin-offer/offer_offline': 'Offline: "You\'re offline. Check your connection."',
    # returning unlock
    'returning-unlock/unlock_fingerprint': 'Open with fingerprint (phone prompt)',
    'returning-unlock/unlock_face': 'Open with Face ID (phone prompt)',
    'returning-unlock/unlock_screen-lock': 'Open with screen lock (phone prompt)',
    'returning-unlock/unlock_pending': 'Phone prompt open, waiting',
    'returning-unlock/unlock_cancelled': 'Prompt cancelled: back to unlock, no message',
    'returning-unlock/unlock_platform-retry': 'Failed prompt: retry, "Not you? Switch account"',
    'returning-unlock/unlock_unavailable': '"Faster sign-in isn\'t available" -> Use OTP instead',
    # home
    'home/home_setup-wheel': 'Set availability: presets and wheel, 15-min steps',
    'home/home_setting': 'Setting availability, controls disabled',
    'home/home_setup-failed': 'Setup failed notice in the bar',
    'home/home_active': 'Timer running, Request a case',
    'home/home_requesting': 'Requesting a case, one request in flight',
    'home/home_request-failed': 'Request failed notice in the bar',
    'home/home_no-cases': '"No cases right now. Try again in a minute."',
    'home/home_unknown-result': 'Request result unclear: reconcile, no invented result',
    'home/home_offline': 'Offline: End availability greyed, notice in bar',
    'home/home_near-expiry': 'Near expiry: Add time shown on the value row',
    'home/home_add-wheel': 'Add time sheet, same duration controls',
    'home/home_adding': 'Adding time, sheet controls disabled',
    'home/home_add-failed': 'Add-time error above its button',
    'home/home_added': '"Time added" toast, 5:00 + 30 min = 35:00',
    'home/home_end-confirmation': 'End availability sheet',
    'home/home_stop-pending': 'Ending availability with a request pending',
    'home/home_expired-pending': 'Availability ended while a request is pending',
    'home/home_idle-expired': 'Availability ended while idle (top notice)',
    'home/home_manually-ended': 'Ended by the doctor (top notice)',
    'home/home_profile': 'Profile page: name, earnings, faster sign-in, Log out',
    'home/home_profile-case-open': 'Profile with a case open: Log out replaced by text',
    'home/home_logout-confirm': 'Log out sheet: Log out / Stay signed in',
    # prescribe
    'prescribe/d-default': 'Prescribe one medicine: schedule, dose, On prescription line',
    'prescribe/d-every-x-hours': 'Every X hours: 4 / 6 / 8 / 12 h',
    'prescribe/d-alt-days': 'Alt days schedule',
    'prescribe/d-weekly': 'Weekly schedule',
    'prescribe/d-monthly': 'Monthly schedule',
    'prescribe/d-sos-only': 'SOS only: dose and max doses a day',
    'prescribe/d-sos-on': 'Optional as-needed (SOS) dose with its daily max',
    'prescribe/d-syrup': 'Syrup form: ml doses and Other',
    'prescribe/d-drops': 'Drops form: dose choices',
    'prescribe/d-inhaler': 'Inhaler form: puffs',
    'prescribe/d-injection-default': 'Injection form: units',
    'prescribe/d-cream': 'Cream form: Apply only',
    'prescribe/d-duration-picker': 'Duration picker: numbers, unit chips, Ongoing',
    'prescribe/d-food-selected': 'Food chosen: After / Before / Empty stomach',
    'prescribe/d-notes-keyboard': 'Additional instructions focused, keyboard open',
    'prescribe/d-scrolled': 'Prescribe scrolled, bar pinned',
    'prescribe/d-header-white': 'Compact task header, Back and title',
    'prescribe/d-error-dose': '"Choose a dose for at least one time of day." under grid',
    'prescribe/d-error-other': '"Enter the dose in ml/units." (Other dose)',
    'prescribe/d-disabled': 'Disabled medicine: "Prescribing it will enable it again."',
    'prescribe/d-disable-sheet': 'Disable sheet with reasons',
    'prescribe/d-discard-sheet': '"Discard changes?" sheet',
    'prescribe/d-rx-failed': 'Rx viewer failed to load: notice and Try again',
    # case page (non-calling, then calling)
    'case/a-top': 'Case page top: Order details, View Rx, medicines, notes',
    'case/a-order-details': 'Order details expanded (created, delivery, payment)',
    'case/a-scrolled': 'Case scrolled to Medicines and Notes',
    'case/a-long-content': 'Long patient and medicine names (wrap at 360)',
    'case/a-notes-typing': 'Notes typing, kept until Confirm',
    'case/a-rx-viewer': 'View Rx opened full screen (zoom, rotate)',
    'case/a-loading': 'Loading skeleton shaped like the page',
    'case/a-load-failed': '"Couldn\'t load this case." -> Try again',
    'case/a-offline': 'Offline notice in the bar',
    'case/a-offline-action': 'Action tried offline: one error notice, nothing lost',
    'case/a-no-medicines': 'Empty case: amber notice, Release case, no Call patient',
    'case/s-10-medicines': 'Stress: 10 medicines',
    'case/s-medicine-disabled': 'Stress: a disabled medicine on the case',
    'case/s-optional-empty': 'Stress: optional notes empty',
    'case/s7e-leave-sheet': 'Leave this case? sheet over Ready: Release / Stay',
    'case/a-leave-sheet': 'Leave sheet (approved picture of the same sheet)',
    'case/a-releasing': 'Releasing... behind the sheet',
    'case/a-release-failed': '"Couldn\'t release this case. You\'re still on it."',
    'case/a-back-blocked': 'Phone back during a call: "Finish this case first..." toast',
    'case/a-confirm-busy': 'Confirming...: rows muted, one submit only',
    'case/a-confirm-failed': '"Couldn\'t confirm. Nothing was lost." above the button',
    'case/t01-ready': 'Ready: Call patient only, no script card',
    'case/t02-calling': 'Calling: script under Order details, status line only',
    'case/t03-not-through': 'Didn\'t go through (3): red notice, Call again',
    'case/t04-doctor-missed': 'You didn\'t answer (4): amber notice, Call again',
    'case/t09-patient-unavailable': 'Patient unavailable (9): grey card, Request next case',
    'case/s7a-calling': 'Calling, Cat4 / HA skipped (7a): no Callback',
    'case/t05-result-wait': 'Getting call result (5): status line only, Ozonetel only',
    'case/t06-ended-early': 'Call too short (6): Call again, Callback',
    'case/t08a-valid-cat4': 'Valid call (8a): Confirm prescription only',
    'case/t08c-confirm-blocked': 'Confirm with a Pending medicine (8c): red line',
    'case/t10a-confirmed': 'Prescription confirmed (10a): green card',
    'case/e-availability-ended': 'Availability ended: Back to Home only',
    'case/c-callback': 'Callback sheet: pick a date and time',
    'case/c-callback-error': 'Callback sheet: field error',
    'case/c-callback-failed': 'Callback save failed: choices kept',
    'case/c-callback-refused': '"Couldn\'t schedule the callback. The patient wasn\'t reached."',
    'case/e-callback-scheduled': 'Callback scheduled: card with the time',
    'case/s7b-still-on-call': 'Still on the call? (7b): Still talking / Call ended',
    'case/s7d-result-missing': 'Result not received (7d, Cat4): Confirm / Callback / Unavailable',
    'case/s7d-unavailable-sheet': 'Mark patient unavailable: three reasons',
    'case/s7f-submitted': 'Waiting for the call record (7f)',
    'case/s7d-result-missing-pilot': 'Result not received (7d, Pilot): Confirm & forward',
    'case/t16-transfer-missed': 'Ended before transfer, doctor ended (16): Confirm & forward',
    'case/t16b-transfer-missed-patient': 'Ended before transfer, patient ended (16b)',
    'case/t16c-transfer-missed-unknown': 'Ended before transfer, unknown who (16c)',
    'case/t10b-forwarded': 'Forwarded to HA (10b): green card',
    'case/g0-calling-pilot': 'B1 before the gate: neutral script, Calling...',
    'case/g1-generic-confirm': 'B1: Confirm prescription and Skip HA, neutral script',
    'case/g2-checking-ha': 'B2: "Checking for a Health Advisor...", Skip HA greyed',
    'case/t13-connecting-ha': 'Transferring... (13): Skip HA greyed, no Callback',
    'case/t14-transferred': 'Transferred to HA (14): green card',
    'case/t15-ha-no-join': '15 HA unavailable, live: amber card and script',
    'case/t15-after-hangup': '15 after hang-up: grey card, title only',
    'case/g3b-forwarded': 'B3 forwarded, live: "Waiting for the call to end..."',
    'case/g3b-after-hangup': 'B3 after hang-up: grey card, title only',
    'case/c-skip-ha': 'Skip HA reason sheet',
    'case/t17-skip-ha-wait': 'Skip HA on a live call (17): grey note, "Getting call result..."',
    'case/t11-calling-transfer': 'Calling, transfer case (11): version A',
    'case/t12-transfer-ready': 'Confirm & transfer with Skip HA (12): version A',
    'case/t08b-valid-forward': 'Valid call, forward (8b): version A',
}

# ---------------------------------------------------------------- flow order and sections
# Each step: list of (section title, [picture keys in flow order]).
SECTIONS = {
    1: [
        ('Sign-in', ['sign-in/sign-in_default', 'sign-in/sign-in_pasted-cleaned', 'sign-in/sign-in_sending',
                     'sign-in/sign-in_keyboard-open', 'sign-in/sign-in_empty-tap', 'sign-in/sign-in_too-short',
                     'sign-in/sign-in_wrong-first-digit', 'sign-in/sign-in_not-registered',
                     'sign-in/sign-in_inactive', 'sign-in/sign-in_too-many-tries', 'sign-in/sign-in_couldnt-send',
                     'sign-in/sign-in_offline']),
        ('OTP', ['otp/otp_default', 'otp/otp_verifying', 'otp/otp_wrong-code', 'otp/otp_two-tries-left',
                 'otp/otp_too-short', 'otp/otp_empty-tap', 'otp/otp_code-expired', 'otp/otp_couldnt-verify',
                 'otp/otp_locked', 'otp/otp_too-many-resends', 'otp/otp_expired-and-resend-limited',
                 'otp/otp_resend-available', 'otp/otp_resending', 'otp/otp_resend-failed',
                 'otp/otp_new-code-sent', 'otp/otp_cooldown-reconciling', 'otp/otp_offline']),
        ('Faster sign-in offer (once)', ['faster-signin-offer/offer_fingerprint', 'faster-signin-offer/offer_face-id',
                                         'faster-signin-offer/offer_screen-lock', 'faster-signin-offer/offer_enabling',
                                         'faster-signin-offer/offer_enable-failed', 'faster-signin-offer/offer_offline']),
        ('Returning unlock', ['returning-unlock/unlock_fingerprint', 'returning-unlock/unlock_face',
                              'returning-unlock/unlock_screen-lock', 'returning-unlock/unlock_pending',
                              'returning-unlock/unlock_platform-retry', 'returning-unlock/unlock_cancelled',
                              'returning-unlock/unlock_unavailable']),
    ],
    2: [
        ('Availability', ['home/home_setup-wheel', 'home/home_setting', 'home/home_setup-failed', 'home/home_active']),
        ('Request a case', ['home/home_requesting', 'home/home_request-failed', 'home/home_no-cases',
                            'home/home_unknown-result', 'home/home_offline']),
        ('Add time', ['home/home_near-expiry', 'home/home_add-wheel', 'home/home_adding', 'home/home_add-failed',
                      'home/home_added']),
        ('End or expiry', ['home/home_end-confirmation', 'home/home_stop-pending', 'home/home_expired-pending',
                           'home/home_idle-expired', 'home/home_manually-ended']),
        ('Profile and Log out', ['home/home_profile', 'home/home_profile-case-open', 'home/home_logout-confirm']),
    ],
    3: [
        ('Case page', ['case/a-top', 'case/a-order-details', 'case/a-scrolled', 'case/a-long-content',
                       'case/a-notes-typing', 'case/a-rx-viewer', 'case/a-loading', 'case/a-load-failed',
                       'case/a-offline', 'case/a-offline-action', 'case/a-no-medicines']),
        ('Stress', ['case/s-10-medicines', 'case/s-medicine-disabled', 'case/s-optional-empty']),
        ('Leaving the case', ['case/s7e-leave-sheet', 'case/a-leave-sheet', 'case/a-releasing',
                              'case/a-release-failed']),
        ('Side panels whose trigger is in steps 5-6', ['case/a-back-blocked', 'case/a-confirm-busy',
                                                       'case/a-confirm-failed']),
        ('Rx viewer', ['prescribe/d-rx-failed']),
    ],
    4: [
        ('Schedule', ['prescribe/d-default', 'prescribe/d-every-x-hours', 'prescribe/d-alt-days',
                      'prescribe/d-weekly', 'prescribe/d-monthly', 'prescribe/d-sos-only', 'prescribe/d-sos-on']),
        ('Dose by form', ['prescribe/d-syrup', 'prescribe/d-drops', 'prescribe/d-inhaler',
                          'prescribe/d-injection-default', 'prescribe/d-cream']),
        ('Duration, food, notes, header', ['prescribe/d-duration-picker', 'prescribe/d-food-selected',
                                           'prescribe/d-notes-keyboard', 'prescribe/d-scrolled',
                                           'prescribe/d-header-white']),
        ('Errors', ['prescribe/d-error-dose', 'prescribe/d-error-other']),
        ('Disable, discard, disabled', ['prescribe/d-disabled', 'prescribe/d-disable-sheet',
                                        'prescribe/d-discard-sheet']),
    ],
    5: [
        ('Shared start (every case)', ['case/t01-ready', 'case/t02-calling', 'case/t03-not-through',
                                       'case/t04-doctor-missed', 'case/t09-patient-unavailable']),
        ('Cat4 / Pilot HA skipped: happy path', ['case/s7a-calling', 'case/t05-result-wait', 'case/t08a-valid-cat4',
                                                 'case/t08c-confirm-blocked', 'case/t10a-confirmed',
                                                 'case/e-availability-ended']),
        ('Cat4 / HA skipped: too short (6) and callback', ['case/t06-ended-early', 'case/c-callback',
                                                           'case/c-callback-error', 'case/c-callback-failed',
                                                           'case/c-callback-refused', 'case/e-callback-scheduled']),
        ('Cat4 / HA skipped: no result (7)', ['case/s7b-still-on-call',
                                              'case/s7d-result-missing', 'case/s7d-unavailable-sheet',
                                              'case/s7f-submitted']),
    ],
    6: [
        ('Pilot, HA free (happy path)', ['case/g0-calling-pilot', 'case/g1-generic-confirm', 'case/g2-checking-ha',
                                         'case/t13-connecting-ha', 'case/t14-transferred']),
        ('Pilot, no HA free', ['case/g3b-forwarded', 'case/g3b-after-hangup']),
        ('Pilot, Skip HA on the live call', ['case/c-skip-ha', 'case/t17-skip-ha-wait']),
        ('Pilot, transfer could not start (15)', ['case/t15-ha-no-join', 'case/t15-after-hangup']),
        ('Pilot, ended before the transfer (16)', ['case/t16-transfer-missed', 'case/t16b-transfer-missed-patient',
                                                  'case/t16c-transfer-missed-unknown', 'case/t10b-forwarded']),
        ('Pilot, no result (7d)', ['case/s7d-result-missing-pilot']),
    ],
    9: [
        ('Version A (later), route known at call start', ['case/t11-calling-transfer', 'case/t12-transfer-ready',
                                                          'case/t08b-valid-forward']),
    ],
}

FLOW = {
    1: 'Sign-in -> Send OTP -> OTP -> Verify & sign in -> faster sign-in offer (once) -> Home. Returning doctor: Unlock -> Home.',
    2: 'Home -> set availability -> Active -> Request a case -> Requesting... -> case (step 3). Add time and End availability sheets. Profile -> Log out.',
    3: 'Case opened -> Ready (Call patient starts step 5). Back -> Leave this case? -> Release case -> Home. Empty case -> Release case.',
    4: 'Case -> tap a medicine -> Prescribe (schedule, dose) -> Prescribed. X with changes -> Discard changes? Disable -> reason -> removed from the order.',
    5: 'Call patient -> Calling... -> result -> Confirm prescription -> Prescription confirmed -> Request next case. Too short -> Call again or Callback. No result -> 7b / 7c -> 7d -> Confirm -> Waiting for the call record.',
    6: 'Pilot: Calling (B1, before gate) -> gate -> Confirm prescription -> Checking for an HA -> free: Transferring -> Transferred; none: Forwarded (after hang-up: title only). Ended early: 16 -> Confirm & forward or Skip HA.',
    9: 'Calling (transfer case) -> Confirm & transfer -> Transferring -> Transferred. Non-value forward -> Confirm & forward -> Forwarded.',
}

TITLES = {
    1: 'Sign-in, OTP, faster sign-in, returning unlock',
    2: 'Home, availability, Profile, Log out, Help / bell placeholder',
    3: 'Case page (incl. empty case, leave sheet, release failed, Rx failed)',
    4: 'Prescribe and Disable',
    5: 'Calling - Cat4 and Pilot with HA skipped',
    6: 'Pilot - Fallback B (launch)',
    9: 'LATER - Version A (not in the first build)',
}

BEHAVIOUR_ONLY = [  # feedback-state-map keys with no picture (behaviour rows only)
    ('offer.cancelled', 1), ('offer.not-now', 1), ('offer.unsupported', 1), ('offer.enabled', 1),
    ('rx.load-failed', 3), ('case.reopened', 7),
]


# ---------------------------------------------------------------- plan parsing and matching
def load_pictures():
    pics = {}
    for f in FOLDERS:
        for p in sorted((UI / f).glob('*_w390.png')):
            stem = p.name[: -len('_w390.png')]
            pics[f'{f}/{stem}'] = p
    return pics


def plan_steps():
    text = PLAN.read_text(encoding='utf-8')
    sec = text.split('## 5. Build order', 1)[1].split('## 6.', 1)[0]
    rows = []
    for line in sec.splitlines():
        if not re.match(r'\|\s*\d+', line):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        num = int(re.match(r'(\d+)', cells[0]).group(1))
        rows.append((num, cells[1], cells[2]))
    return rows


def tokens(cell):
    out = []
    for a, b in re.findall(r'`([^`]+)`\s*–\s*`([^`]+)`', cell):
        out.append(('range', a, b))
    rest = re.sub(r'`([^`]+)`\s*–\s*`([^`]+)`', '', cell)
    for t in re.findall(r'`([^`]+)`', rest):
        out.append(('tok', t))
    return out


def match_token(t, pics):
    """Return {key: specificity}. 3 = exact id, 2 = id with suffix (or folder), 1 = wildcard."""
    res = {}
    if t.endswith('/'):
        for k in pics:
            if k.startswith(t):
                res[k] = 2
        return res
    folder, pat = (t.split('/', 1) if '/' in t else (None, t))
    for k in pics:
        kf, stem = k.split('/', 1)
        if folder and kf != folder:
            continue
        if '*' in pat:
            if stem.startswith(pat.split('*')[0]):
                res[k] = 1
        elif stem == pat:
            res[k] = 3
        elif stem.startswith(pat + '-'):
            res[k] = 2
    return res


def match_range(a, b, pics):
    ra = re.match(r'([a-z]+)(\d+)([a-z]?)$', a)
    rb = re.match(r'([a-z]+)(\d+)([a-z]?)$', b)
    lo = (int(ra.group(2)), ra.group(3))
    hi = (int(rb.group(2)), rb.group(3))
    res = {}
    for k in pics:
        stem = k.split('/', 1)[1]
        m = re.match(r'([a-z]+)(\d+)([a-z]?)(?:-|$)', stem)
        if not m or m.group(1) != ra.group(1):
            continue
        key = (int(m.group(2)), m.group(3))
        if lo <= key <= hi:
            res[k] = 1
    return res


def assign(pics):
    steps = plan_steps()
    cands = {k: [] for k in pics}
    unmatched = []
    plan_names = {}
    for num, journey, cell in steps:
        for tok in tokens(cell):
            if tok[0] == 'range':
                m = match_range(tok[1], tok[2], pics)
                desc = f'{tok[1]}-{tok[2]}'
            else:
                m = match_token(tok[1], pics)
                desc = tok[1]
            if not m:
                unmatched.append((num, desc))
            plan_names.setdefault(num, []).append(desc)
            for k, spec in m.items():
                cands[k].append((spec, num, desc))
    chosen, dups = {}, []
    for k, lst in cands.items():
        if not lst:
            continue
        best = sorted(lst, key=lambda x: (-x[0], x[1]))[0]
        chosen[k] = best[1]
        steps_named = sorted({(n, s) for s, n, _ in lst})
        if len({n for n, _ in steps_named}) > 1:
            dups.append((k, steps_named, best[1]))
    unplaced = [k for k in pics if k not in cands or not cands[k]]
    return chosen, dups, unplaced, unmatched, steps


# ---------------------------------------------------------------- drawing
def wrap_px(text, font, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = (cur + ' ' + w).strip()
        if font.getlength(trial) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or ['']


def draw_step(num, pics_for_step, out_path):
    """pics_for_step: list of (section title, [keys]) in flow order."""
    cell_w = TW + PAD
    width = COLS * cell_w + PAD
    flow_lines = wrap_px(FLOW[num], F_FLOW, width - 2 * PAD)
    heading = f'Step {num} - {TITLES[num]}' if num != 9 else f'Step 9 (LATER) - {TITLES[num]}'
    y = PAD
    layout = []  # (kind, y, payload)
    layout.append(('title', y, heading))
    y += 60
    for ln in flow_lines:
        layout.append(('flow', y, ln))
        y += 34
    y += 14
    for sec_title, keys in pics_for_step:
        if not keys:
            continue
        layout.append(('section', y, f'{sec_title}  ({len(keys)})'))
        y += 40
        for i in range(0, len(keys), COLS):
            row = keys[i:i + COLS]
            label_h = 0
            wrapped = []
            for k in row:
                rid = k.split('/', 1)[1].replace('_w390', '')
                text = f'{rid} - {LABELS[k]}'
                lines = wrap_px(text, F_LABEL, TW)
                wrapped.append(lines)
                label_h = max(label_h, len(lines) * 28)
            layout.append(('row', y, (row, wrapped)))
            y += TH + 10 + label_h + PAD
        y += 10
    width_px, height_px = width, y + PAD
    img = Image.new('RGB', (width_px, height_px), (244, 246, 248))
    d = ImageDraw.Draw(img)
    for kind, yy, payload in layout:
        if kind == 'title':
            d.text((PAD, yy), payload, fill=(20, 24, 31), font=F_TITLE)
        elif kind == 'flow':
            d.text((PAD, yy), payload, fill=(40, 70, 130), font=F_FLOW)
        elif kind == 'section':
            d.text((PAD, yy), payload, fill=(20, 24, 31), font=F_HEAD)
        elif kind == 'row':
            row, wrapped = payload
            for c, (k, lines) in enumerate(zip(row, wrapped)):
                x = PAD + c * cell_w
                im = Image.open(pics_path[k]).convert('RGB').resize((TW, TH), Image.LANCZOS)
                img.paste(im, (x, yy))
                d.rectangle([x - 1, yy - 1, x + TW, yy + TH], outline=(190, 196, 206))
                ty = yy + TH + 8
                for ln in lines:
                    d.text((x, ty), ln, fill=(55, 61, 71), font=F_LABEL)
                    ty += 28
    img.save(out_path)
    return img.size


pics_path = {}


def main():
    global pics_path
    pics_path = load_pictures()
    if not pics_path:
        sys.exit('No approved 390 pictures found. Run from the project folder.')
    chosen, dups, unplaced, unmatched, plan = assign(pics_path)
    missing_labels = [k for k in pics_path if k not in LABELS]
    if missing_labels:
        sys.exit(f'No label for: {missing_labels}')

    OUT.mkdir(parents=True, exist_ok=True)
    placed = []
    rows_index = []
    for num in [1, 2, 3, 4, 5, 6, 9]:
        sections = []
        used = set()
        for title, keys in SECTIONS[num]:
            keep = [k for k in keys if chosen.get(k) == num]
            used.update(keep)
            sections.append((title, keep))
        # any picture the plan puts in this step but no section lists (should be none)
        extra = sorted(k for k, s in chosen.items() if s == num and k not in used)
        if extra:
            sections.append(('Other (not in a section, check)', extra))
            used.update(extra)
        for _, keys in sections:
            placed.extend(keys)
        out_path = OUT / f'step-{num}.png'
        size = draw_step(num, sections, out_path)
        count = sum(len(k) for _, k in sections)
        rows_index.append((num, count, size, out_path.name))

    # --- index.md
    dup_lines = []
    for k, named, chosen_step in dups:
        rid = k.split('/', 1)[1]
        where = ', '.join(f'step {n} ({"exact" if s == 3 else "range/wildcard" if s == 1 else "id/folder"})'
                          for n, s in named)
        dup_lines.append(f'`{rid}` named in {where}; shown once, at step {chosen_step}.')
    behaviour = [f'`{k}` (step {s})' for k, s in BEHAVIOUR_ONLY]
    total_placed = len(placed)
    lines = []
    lines.append('# Build map - plan v3 section 5')
    lines.append('')
    lines.append('Review aid for Apurva (approve from screens, not state names). Each image: approved 390-wide '
                 'pictures in flow order, labelled `render id - what the doctor sees or does`. No new renders, no mock-ups. '
                 'Built by `ui-screens/_qa/build-map.py` from plan v3 section 5.')
    lines.append('')
    lines.append('| Step | Journey | Pictures | Flow | Image |')
    lines.append('|---|---|---|---|---|')
    lines.append('| 0 | Shell | none (no screens) | - | - |')
    for num, count, size, fname in rows_index:
        title = TITLES[num]
        lines.append(f'| {num}{" (LATER)" if num == 9 else ""} | {title} | {count} | {FLOW[num].split(".")[0]}. | [{fname}]({fname}) |')
    lines.append('| 7 | Across journeys: availability ends mid-case, reopen into an open case, app backgrounded during a call | none (app-logic 3 - 4) | - | - |')
    lines.append('| 8 | Final pass: copy parity with native, G7 over everything | all (no new picture) | - | - |')
    lines.append('')
    lines.append('## Gaps')
    lines.append('')
    lines.append(f'- Pictures in ui-screens/ that no step uses: {len(unplaced)}' + (f' ({", ".join(unplaced)})' if unplaced else ' (none).'))
    lines.append(f'- Plan section 5 tokens that match no picture: {len(unmatched)}' + (f' ({unmatched})' if unmatched else ' (none).'))
    lines.append('- Named twice in plan section 5 (shown once, at the step that names it exactly): ' + ' '.join(dup_lines) if dup_lines else '- Named twice in plan section 5: none.')
    lines.append('- Behaviour-only states (in feedback-state-map, no picture, not on the map): ' + ', '.join(behaviour) + '.')
    lines.append('- Picture triggers that live in a later step (picture shown in step 3, trigger in steps 5-6): `case/a-back-blocked`, `case/a-confirm-busy`, `case/a-confirm-failed`. `home/home_profile-case-open` needs an open case.')
    lines.append('')
    lines.append('## Self-check')
    lines.append('')
    lines.append(f'- Every approved picture in this map appears once: {total_placed} placed, {len(set(placed))} unique, pictures on disk {len(pics_path)}.')
    lines.append('- Labels: taken from ui-screens/README.md, calling-flow/data.js, app-logic.md and feedback-state-map.md. Readable at phone width: checked by eye only at the sizes built (see note below).')
    lines.append('- No screen cropped: thumbnails are the full 390 x 844 picture scaled to 40 %.')
    lines.append('- Note: the labels and flow lines were written from the sources above; if a source changes, rerun the script after editing LABELS / FLOW.')
    lines.append('')
    (OUT / 'index.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    print('pictures on disk:', len(pics_path), '| placed:', total_placed, '| unique:', len(set(placed)))
    print('unplaced:', unplaced, '| unmatched tokens:', unmatched)
    for n, c, s, f in rows_index:
        print(f'step {n}: {c} pictures, image {s[0]}x{s[1]} -> {f}')
    for line in dup_lines:
        print('dup:', line)


if __name__ == '__main__':
    main()
