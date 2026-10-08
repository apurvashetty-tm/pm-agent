# Proposal: sign-in, shift and the doctor's day outside a case

Status: **proposal, partly superseded.** Orders are pulled by the doctor, not pushed (D-31); sign-in is built (D-32). Shift capture is next. From a four-role review on 2026-10-09: Product/Ops, UX/IA, Auth & compliance (with web research) and Prototype engineering. Once agreed, the decisions move to `context/decision_log.md`.

## The model: three different things

| | What it proves | How often |
|---|---|---|
| **Signed in** (OTP) | Who the doctor is | Once a day. Compliance guidance (NIST AAL2) says re-login at least every 24 h |
| **Online until X** (shift) | "I'm ready to take cases until 6 PM" | Every time the doctor starts working |
| **On a case** | Working one patient | One case at a time, pushed to the doctor |

Breaks and going offline never ask for the OTP again. Only a new day, a new device or an expired session does.

## Doctor states

| State | Gets new cases? | Screen |
|---|---|---|
| Signed out | No | Sign-in |
| Offline, signed in | No | Off-duty (summary + **Go online**) |
| Online, waiting | **Yes, only in this state** | Ready |
| On case | No | Case page (exists) |
| On break | No | Break |
| Shift ended | No | Shift-ended sheet → Off-duty |

## Home screen: yes, a minimal "Ready" screen

It is the queue's resting state, not a dashboard. Doctors only see it while waiting, on a break or off duty. While cases are flowing they go straight from one case to the next.

- **Shows:** status ("Ready for cases" / "On break"), "Waiting for the next case…", shift end time with Change, and today's case count (and earnings, if Apurva agrees).
- **Doesn't show:** tabs, charts, history, leaderboards or an exact queue count.
- **Arriving cases:** a case opens on its own, with vibration and sound. That's safe because opening a case starts nothing: Call Patient is still the doctor's own tap.
- **Pinned action:** "Take a break" (secondary).

## First case

The doctor goes online once with "Start taking cases (until 6 PM)". After that, every "Next Order" tap means "I'm ready". The case is assigned at that moment, not preloaded. There is no accept step and no pre-call decline. The existing exits remain: Reject, Mark Unavailable and Schedule Callback.

## Shift capture

- Six end-time chips: the next whole hours, each showing its duration, e.g. "6:00 PM · 4h 20m". The doctor's usual end time is pre-selected. A seventh chip, "Other time", opens the phone's own time picker.
- **Before the end:**
  - A quiet notice on the Ready screen 15 minutes before the end, never on the case page.
  - The system stops assigning new cases about 5 minutes before the end.
- **At the end:** a sheet ("Extend +30m / +1h / +2h" or "Go offline") appears only after the current case is closed. A live call is never interrupted.
- **If the doctor doesn't respond:** they go offline after about 2–10 minutes. They stay signed in.

## Screens to build

1. Splash / session check
2. Sign-in (phone, +91)
3. OTP verify (wrong code, expired, resend countdown, lockout, "Can't log in? Contact Doctor Ops")
4. First-login profile and declarations: name, degree and registration number (read-only, set by ops); terms, a confidentiality undertaking and a telemedicine-guidelines acknowledgement
5. Go online / shift set-up
6. Ready (waiting)
7. Break
8. Shift-ending notice and shift-ended sheet (extend or go offline)
9. Off-duty / shift summary
10. Session expired. During a case, an OTP sheet appears over the case so no notes are lost.
11. Offline band (fixed height, never changes the header height)
12. Profile sheet update: status, shift end with Change, break toggle ("Pause after this case" during a case), help, and Log out. Log out is hidden during a case.
13. Changes to the existing case page: "Next Order" goes to Ready when no case is waiting. A possible consent step (see open questions).

## How to build (prototype)

- **One page.** Keep `index.html`. An app state (`goApp()`) sits above the existing call state, and each screen is a container shown or hidden by that state. Separate pages are rejected: they would copy the phone frame, header and sheets into every file.
- **Saved session.** The prototype keeps the session in `localStorage`, so a page refresh doesn't log the doctor out. Mock OTP rules: any 6 digits work; `000000` shows a wrong code; `111111` shows an expired code; `9000000000` is a number that isn't registered.
- **Demo bar.** New buttons jump between app states and fake the clock ("Shift ends in 2 min").
- **New design-system parts [PROPOSED]:** `.tm-otp` (one input drawn as six boxes, so SMS autofill and paste work), `.tm-field__prefix` (+91) and `.tm-empty` (the empty / waiting layout). Icons to add: wifi-off, coffee, alarm.
- **Phases:**

  | Phase | Scope | Effort |
  |---|---|---|
  | P0 | Scaffolding | 0.5 d |
  | P1 | Ready, Next Order and end shift | 1 d |
  | P2 | Sign-in, OTP and shift set-up | 1–1.5 d |
  | P3 | Clock, shift-ending sheet and break | 1 d |
  | P4 | Session expired and offline | 0.5–1 d |
  | P5 | Docs and renders | 0.5 d |

  About 5 days in all.
- **Risks:**
  - The sticky header jump: shift and offline information must not change the header's height.
  - The patient strip appearing outside a case.
  - Call timers left running when the doctor leaves a case.
  - Keyboard focus when switching screens.
  - Existing tests break unless P0 is built first.

## Open questions (recommended default in brackets)

1. Unlock scope: `project_truth.md` §8 and the PRD currently exclude queue work. [Unlock it, limited to these screens.]
2. How cases are assigned (OQ-003). [Shared pool; one case at a time, given only to doctors online and waiting.]
3. Earnings on the Ready screen? [Yes, as one line. Never on the case page.]
4. Shift limits: shortest and longest shift, extension steps, and an overtime cap. [Extensions in 30/60 min steps; ops sets the cap.]
5. Breaks: reason or limit? [No reason; ops is alerted if a break runs past 30 min.]
6. A case assigned but not opened, or a doctor slow to tap Next Order? [Unopened for 2 min: the case goes back to the pool. Two misses in a row: automatic break. No Next Order tap for 5 min: automatic break.]
7. Phone dies or loses connection mid-call? [Flag the case for ops and return it to the pool. Never decide its outcome automatically.]
8. **Patient consent (legal must confirm).** Under the 2020 Telemedicine Practice Guidelines, a consultation the doctor starts needs *explicit* patient consent, recorded. Our doctor makes the call. Does the patient's order count as starting the consultation? If not, the case page needs an intro line (name, qualification, registration number) and a "Patient consented" tick before Prescribe. [Ask legal; design for explicit consent.]
9. Production sign-in strength: SMS OTP alone is weak for someone who issues prescriptions (SIM swap, shared phones). [Prototype: OTP. Production: OTP + device binding + PIN or biometric for re-entry and shift extension.]
10. OTP values. [6 digits; 5 min expiry; resend after 30 s, then 60 s, then 120 s; 5 wrong tries per code; escalating lockout; the same message whether or not the number is registered.]

## Sources (auth and compliance)

- NIST SP 800-63B-4: https://pages.nist.gov/800-63-4/sp800-63b.html
- OWASP MFA / Session / Authentication cheat sheets: https://cheatsheetseries.owasp.org
- Chrome WebOTP: https://developer.chrome.com/docs/identity/web-apis/web-otp
- Telemedicine Practice Guidelines FAQ: https://medicaldialogues.in/pdf_upload/pdf_upload-126339.pdf
- PSA Legal, Telemedicine Guidelines FAQ: https://psalegal.com/telemedicine-guidelines-2020-faq/
- DPDP Rule 6: https://dpdpa.com/dpdparules/rule6.html
