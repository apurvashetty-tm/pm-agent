# project_truth.md — Truemeds Doctor Portal

**Status:** Approved by Apurva, 2026-10-16 (v2.0 — rewritten; replaces v1.0 of 2026-06-09, kept in git history)
**Changes:** Apurva only; every change is recorded in `docs/context/decision_log.md`. Detail lives in `ui-screens/` and `ui-screens/app-logic.md`.

---

## 1. What we're building

A mobile app for Truemeds doctors to take a case, call the patient, and confirm the prescription for that order — from sign-in to the next case.

Out of scope: admin, pharmacy operations, ordering, the customer app.

**Later (not in this version):** earnings (Wallet in Profile), pushed cases, calling inside the app.

## 2. Who uses it

Freelance doctors working with Truemeds, each on their own phone.

- They choose when to work: they set how long they're available and request cases one at a time. Today cases are not pushed to them; pushing cases may be explored later.
- How many cases a doctor handles depends on how long they're available. Today roughly 12,000 orders are handled by about 300 active doctors `[APPROX — Apurva to confirm both numbers and the period]`.
- They can see how many prescriptions they've confirmed today, on Home.
- In each case the doctor calls the patient, reviews every medicine on the order, and either confirms the prescription or ends the case another way (callback, patient unavailable).
- A good session: sign in fast, request a case, get through it without confusion, move straight to the next one.

## 3. The doctor's day

1. **Sign in** with mobile number and OTP. Fingerprint / Face ID can be turned on for faster sign-in.
2. **Home:** set availability (minimum 15 minutes), then request a case. Home shows the time left and prescriptions confirmed today.
3. **Open the case:** patient and order details, the prescription if attached, the medicines.
4. **Call the patient** from the app.
5. **Review each medicine:** prescribe it or disable it.
6. **Finish the case**, in one of these ways:
   - **Confirm prescription:** Cat4 cases, and Pilot cases where HA is skipped.
   - **Confirm & transfer:** Pilot, Value Meds, HA required. The prescription is confirmed and the patient is handed to an HA on the same call. If the transfer fails, the case is forwarded instead.
   - **Confirm & forward:** Pilot, Non-Value Meds, HA required. The prescription is confirmed and an HA calls the patient back separately.
   - **Skip HA:** the doctor decides HA isn't needed; the button then becomes Confirm prescription.
   - **Callback** or **Patient unavailable:** the case ends without a prescription.
7. **Next:** request the next case, or go back to Home.

## 4. Current rules

These rules apply until Apurva changes them. Every change is recorded in the decision log.

- **50-second call gate:** the final buttons appear only after the backend confirms a valid call — total talk time on the case of at least 50 seconds (a setting), adding up across calls on the same case. An **attempted call** = the patient answered (D-58).
- **Final button by case type:**

| Case type | HA status | Final button |
|---|---|---|
| Cat4 | — | Confirm prescription |
| Pilot | HA skipped (by customer, system or doctor) | Confirm prescription |
| Pilot | Value Meds + HA required | Confirm & transfer |
| Pilot | Non-Value Meds + HA required | Confirm & forward |

  Skip HA appears only for Pilot cases where HA is required and not yet skipped. Cat4 cases never show anything HA-related. Each of the four rows is a separate outcome in analytics.
- **No unreviewed medicines:** Confirm is blocked while any medicine is still Pending.
- **Leaving a case:** before the first attempted call, Back offers "Release case"; once a call is attempted, the case can only end through the flow (confirm, callback, patient unavailable) (D-58).
- **The doctor can't add medicines or change quantity.** Quantity is shown on the case, read-only.

## 5. Calling

Click-to-call through one telecom partner per flow: **Knowlarity** for Cat4 (one result after the call ends) and **Ozonetel** for Pilot transfer calls (live events). The doctor taps Call patient; the doctor's phone rings first, then the patient's; the doctor ends the call on the phone (no End call button). The app learns the call status by **polling** the backend (working assumption until Engineering confirms, OQ-030). If no call result arrives, the doctor is asked "Are you still on the call?" and can still confirm; the case then waits for the call record and goes to Ops after 30 minutes (D-58, D-73). Full flow: `ui-screens/app-logic.md` §4–§6.

## 6. Where the detail lives

- Screens: `ui-screens/` (final pictures of every state)
- Rules per screen: `ui-screens/app-logic.md`
- Why things are the way they are: `docs/context/decision_log.md`
- Still undecided: `docs/context/open_questions.md`
