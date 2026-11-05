# Approved Doctor Portal screens (promoted 2026-10-29)

The approved screens for the Truemeds Doctor Portal, with their pictures. Promoted from the working copies after Apurva's approval (decisions D-58 → D-71). Design system: `design-system/` (rules in `design-system/RULES.md` §8–9). Copy registry and checks: `feedback/`. Native handoff: `native/` (native team).

**Read with the screens:** app rules `app-logic.md` · decisions `../docs/context/decision_log.md` (D-58 → D-83) · what we're building and current rules `../docs/context/project_truth.md` · every error, offline and busy state `../docs/feedback-state-map.md` · open questions `../docs/context/open_questions.md` · what is next `../docs/context/backlog.md`.

Each state has a 390-wide and a 360-wide picture (`_w390.png`, `_w360.png`, 2× density). Contact sheets per folder (`contact-*.png`) show the 390 pictures.

## Screens and pictures

| Journey | Screen file | Pictures folder | States | Decisions |
|---|---|---|---|---|
| Sign-in | `sign-in/sign-in.html` | `sign-in/` (`sign-in_<state>_…`) | 12 | D-42 to D-47, D-61, D-65 |
| OTP | `otp/otp.html` | `otp/` (`otp_<state>_…`) | 17 | D-42 to D-47, D-61 (no Back), D-65 |
| Returning unlock | `returning-unlock/returning-unlock.html` | `returning-unlock/` (`unlock_<state>_…`) | 7 | D-45, D-47, D-61, D-66 |
| Faster sign-in offer | `faster-signin-offer/faster-signin-offer.html` | `faster-signin-offer/` (`offer_<state>_…`) | 6 | D-45, D-61, D-64, D-65 |
| Home (availability, add time, end, profile) | `home/home.html` (+ `home-reference.js`, `home-reference.css`) | `home/` (`home_<state>_…`) | 22 | D-36, D-40, D-47, D-53, D-69, D-70 |
| Case page: ready, calling, call outcomes, closed cases, sheets, stress | `case/case.html` (+ `case-styles.css`) | `case/` (`<state>_…`) | 62 | D-48 to D-83 |
| Prescribe (one medicine) | `case/case.html` (`d-*`) | `prescribe/` (`d-<state>_…`) | 23 | D-04, D-06, D-08 to D-30, D-54, D-56, D-68 |

Counts: pictures are 2 per state. Case page: 43 calling and call-outcome states (incl. `s7d-unavailable-sheet`, the callback sheets and the Skip-HA sheet), 16 + 1 stress/action states (`a-*`), 2 closed (`e-*`), 3 stress (`s-*`). Home: 19 states plus 3 Profile pages.

## Case page: calling render ids

The calling states follow app-logic §5 (D-58 points 14–25, D-63, D-64). The render id is the picture name without the size suffix.

| State | Render id | Note |
|---|---|---|
| 1 Ready | `t01-ready` | Call patient; no script card (D-58 pt 18) |
| 2 Calling (7a) | `t02-calling`, `s7a-calling` | Status line only, no Callback (D-83 CW-A1); script under Order details |
| 3 Didn't go through | `t03-not-through` | |
| 4 You didn't answer | `t04-doctor-missed` | |
| 5 Getting call result | `t05-result-wait` | Script hidden (call has ended) |
| 6 Call too short | `t06-ended-early` | Call again · Callback (D-58 pt 23) |
| 7b Still on the call? | `s7b-still-on-call` | Question as plain text, no box (D-62) |
| 7c Checking | `t05-result-wait` | Same screen as 5 (D-91); `s7c-checking` retired |
| 7d Result not received | `s7d-result-missing` | Confirm prescription · Callback · Unavailable |
| 7d Pilot (D-83 K6) | `s7d-result-missing-pilot` | Confirm & forward · Callback · Unavailable; no Skip HA (CW-D2) |
| 7d Unavailable sheet (D-75) | `s7d-unavailable-sheet` | Sheet "Mark patient unavailable" with three reasons; a reason goes to `t09-patient-unavailable` |
| 7e Leave this case? | `s7e-leave-sheet` | Release case / Stay on this case |
| 7f Waiting for the call record | `s7f-submitted` | D-68 wording |
| 8a Valid (Cat4) | `t08a-valid-cat4` | No script (call ended) |
| 8b Valid (forward) | `t08b-valid-forward` | |
| 8c Confirm blocked (Pending medicines) | `t08c-confirm-blocked` | D-64 |
| 9 Patient unavailable | `t09-patient-unavailable` | |
| 10a Prescription confirmed | `t10a-confirmed` | |
| 10b Forwarded to HA | `t10b-forwarded` | |
| 11 Calling (transfer case) | `t11-calling-transfer` | |
| 12 Confirm & transfer | `t12-transfer-ready` | Skip HA full width under it; no Callback (D-83 CW-A1) |
| 13 Transferring | `t13-connecting-ha` | No Callback (D-58 pt 25) |
| 14 Transferred | `t14-transferred` | |
| 15 Health Advisor unavailable (live) | `t15-ha-no-join` | Amber card; bar "Waiting for the call to end…" while live (D-83 CW-E3) |
| 15 after the hang-up (K8) | `t15-after-hangup` | Neutral grey card, title only (MAIN-CHECK 2); Request next case · Back to Home |
| 16 Ended before the transfer | `t16-transfer-missed` (doctor), `t16b-transfer-missed-patient`, `t16c-transfer-missed-unknown` | Skip HA shown (D-58 pt 24) |
| 17 Skip HA, waiting | `t17-skip-ha-wait` | Keeps the script; grey note + "Getting call result…" only (D-85, replaces CW-E2's two-step line) |
| Fallback B = launch Pilot flow (D-83 CW-F1) | `g0-calling-pilot` (B1 before the gate, K12), `g1-generic-confirm`, `g2-checking-ha`, `g3b-forwarded`, `g3b-after-hangup` (K9) | |
| Callback sheet | `c-callback`, `c-callback-error`, `c-callback-failed`, `c-callback-refused` | Over 6 Call too short (D-83 K2); refused: `callback.notReached` (K3) |
| Skip HA reason sheet | `c-skip-ha` | Over 12 Confirm & transfer (D-70 pt 4) |

## Other case-page states

- **Ready and chrome:** `a-top`, `a-loading`, `a-load-failed`, `a-scrolled`, `a-long-content`, `a-no-medicines`, `a-notes-typing`, `a-order-details`, `a-rx-viewer`.
- **Busy, failures and offline:** `a-offline`, `a-offline-action` (one error notice replaces the offline notice), `a-confirm-busy`, `a-confirm-failed`, `a-releasing`, `a-release-failed`.
- **Leaving a case:** `a-leave-sheet`, `a-back-blocked`.
- **Closed cases:** `e-callback-scheduled`, `e-availability-ended` (success tone, D-66 D). The other closed states are the calling pictures 10a, 14, 10b and 9.
- **Stress:** `s-10-medicines`, `s-optional-empty`, `s-medicine-disabled` (struck name and Disabled tag at AA contrast, D-68).
- **Pictures for the whole calling storyboard:** `case/contact-call.png`.

## Prescribe

`prescribe/` holds every Prescribe state (the `d-*` ids). The source stays in `case/case.html`. Open a state with `../case/case.html?s=d-<state>&start=case&capture=1` (add `&w=360` for the 360 width).

- Form and schedule: `d-default` (tablet/capsule daily), `d-syrup`, `d-drops`, `d-injection-default`, `d-cream`, `d-inhaler`.
- How often: `d-every-x-hours`, `d-alt-days`, `d-weekly`, `d-monthly`, `d-sos-only`, `d-sos-on`.
- Dose, duration and food: `d-error-dose`, `d-error-other`, `d-duration-picker`, `d-food-selected`, `d-notes-keyboard`, `d-scrolled`, `d-header-white`.
- Disabled medicine: `d-disabled` ("Disabled: {reason}. Prescribing it will enable it again.", D-81 F17).
- Sheets and failures: `d-disable-sheet` (reasons), `d-discard-sheet`, `d-rx-failed`.

## Home: Profile

Profile is a page (D-70): a task header with Back and the title "Profile", then the name and role, Today's earnings, User manual, Faster sign-in (on/off), and Log out last in the content. States: `home_profile`, `home_profile-case-open` (Log out replaced by the notice that it is available after the case is closed), `home_logout-confirm` (sheet "Log out?" with Stay signed in). The name, role and earnings are prototype data.

## How to open a state

Open the file in a browser. `capture=` (and `?capture=1`) hides the review controls and sets the page to the screen width.

- Sign-in: `sign-in/sign-in.html?capture=<state>` (`default`, `keyboard-open`, `empty-tap`, `too-short`, `wrong-first-digit`, `pasted-cleaned`, `sending`, `not-registered`, `offline`, `couldnt-send`, `too-many-tries`, `inactive`).
- OTP: `otp/otp.html?capture=<state>` (17 states, e.g. `verifying`, `locked`).
- Unlock: `returning-unlock/returning-unlock.html?capture=<fingerprint | face | screen-lock | pending | cancelled | platform-retry | unavailable>`.
- Offer: `faster-signin-offer/faster-signin-offer.html?capture=<fingerprint | face-id | enabling | screen-lock | enable-failed | offline>`.
- Home: `home/home.html?state=<state>&capture=1` (e.g. `active`, `add-wheel`, `profile`, `logout-confirm`).
- Case page and calling: `case/case.html?s=<render id>&start=case&capture=1` (add `&w=360` for the 360 width).

## D-80 and D-81 fix round (2026-11-01)

The screen audit fixes are applied in these pictures (checklist: `docs/renders/2026-11-01-fix-round/CHECKLIST.md`). Calling: no header Back from the call tap on; leave sheet and Releasing… over Ready; empty case → Release case; busy confirm / transfer read-only. Prescribe: SOS total in the medicine's unit, capsule doses without ½, dose error as field text, `d-disabled`, keyboard rule. Entry: terms line during Verifying / Checking, cooldown reads "Checking…", one header spacing for OTP, offer and unlock. Home: busy controls disabled, pinned Set availability, quiet "Stay signed in", 35:00 after adding time.

## Round 4 (2026-11-02) — consistency audit, applied and frozen (D-82)

Round 4 is being applied in lanes (A design system and copy, B entry and Home, C case and Prescribe, D integration). Rules: `design-system/RULES.md` §3, §8.13–8.14, §9.5. Decisions and state changes: `app-logic.md` §13 and `docs/feedback-state-map.md` (Round 4 section). Pinned main actions on Home, the faster sign-in offer and the returning unlock sit in the action bar; result notices sit inside the bar above their button; the logo lockup is 166 px wide with a 16 top offset; cards that stack are 16 apart; the small-phone (360×640) pass is part of the guards. State counts are unchanged by Round 4 (no states added or removed).

## Design rules applied in this set

- **Page margin 16** on every mobile screen, header, panel and sheet; cards keep 16 inner padding; the action bar has 16 on all sides plus the phone's safe area (D-67).
- **Logo** on sign-in, OTP, unlock, offer and Home; not on the case page, Prescribe, sheets or overlays (D-61).
- **No header Back on OTP** (Change and the phone's back gesture cover it) (D-61).
- **Status cards** are tinted by outcome with a 1px edge and no drop shadow: success (green) for 10a, 10b, 14 and availability ended; neutral (grey) for 7f, 9 and callback scheduled; warning (amber) for 15 (D-62, D-66). State 15b is retired (D-83) and has no card.
- **Icons** only on labelled call, callback, view, skip and direction controls, and the phone-off icon on Unavailable (D-66 B). Log out has no icon (D-70 pt 2).
- **Health Advisor** is spelled out everywhere except the Skip HA button (D-58 pt 23, D-70 pt 3).
- **Script card (D-58 pt 18, D-71, Round 3):** the Ready state shows no script card, anywhere on the page. The card belongs to an attempted call (calling, outcome and transfer states).
- **View Rx (D-76, D-51):** the same outlined button on open and closed cases. It stays tappable after close: the case card stays live.
- **Copy** comes from `feedback/messages.json`. Some sheet text (callback and Skip HA titles, options and errors) is typed in the approved sheets and is not in the registry yet (see the NEEDS-APURVA list in the promotion report).

## Open items

- **Native copy:** `native/messages.ts` is regenerated with `feedback/build-messages.mjs`; the native team regenerates from it.
- **Callback and Skip HA sheet copy:** not yet in `feedback/messages.json` (titles, options, field errors). Add keys or accept the typed copy.
- **Log out icon:** removed to match the icon rule (D-70 pt 2); confirm.
- **Calling pictures and the card:** the live-call card follows the calling markup (D-71 pt 1); the ready state shows no script card (D-71 pt 2).
- **Guard 5.12 (no local restyling of central components):** resolved at close-out (D-73): the design-system variants `tm-notice--question` and the compact header are used; no local overrides remain.
- **Profile is a prototype:** name, role, earnings and the User manual link are mock data (D-70 pt 8).
- **Not in these pictures:** Help (what the "?" opens on Home and the case page), the Profile redesign, the cancelled faster sign-in prompt, and the no-screen-lock skip (behaviour only).
- **Retired on 2026-10-29:** `home/availability.html` and `home/add-availability.html`. Their states are in `home/home.html` (`setup-wheel`, `add-wheel`).

## Next design round (logged, not in this release)

- Profile redesign (today: a page with the ported content and the faster sign-in toggle, D-69, D-70); User manual link.
- Help: what the "?" opens on Home and the case page.
- App navigation for future features: a bottom tab bar once a second destination is approved (D-69 pt 7).
