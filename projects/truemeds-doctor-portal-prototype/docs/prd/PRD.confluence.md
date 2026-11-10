# Truemeds For Doctors - App_PRD

| | |
|---|---|
| Status | Draft for review · v0.6 · 10 Nov 2026 |
| Owner | Apurva Shetty (Product) |
| Release | Launch release (first version of the doctor app) |
| Calling flow, every state | [Calling-flow page](https://doctor-portal-prototype.netlify.app/calling-flow/) |
| Approved screens | [Every screen state in the hand-off kit](https://truemeds-doctor-app-preview.netlify.app/kit) |
| Prototype | [Phone demo](https://truemeds-doctor-app-preview.netlify.app/?demo=1) (app only, plays from sign-in) · [With the review panel](https://truemeds-doctor-app-preview.netlify.app/) (jump to any state, run call scenarios) |
| Hand-off kit | [Every screen and state](https://truemeds-doctor-app-preview.netlify.app/kit) — tap any part to see how it's built; downloads for the app team |

## 1. Executive summary

Truemeds doctors are freelance doctors who call patients who ordered prescription medicines, review each medicine and issue the prescription. Today they do this on a portal page that also carries pricing, substitutes, billing and cross-selling, and the call itself happens outside the page with no status inside it. The doctor app gives the doctor one job per screen: say when they're available, request a case, call the patient, prescribe or disable each medicine, and close the case the one right way for its case type. The system, not the doctor, decides which final button appears, and a prescription only counts once the call is proven to be a real consultation. Open items are mainly with Engineering (live call events, call-record timing, releasing and restoring cases) and a few product calls, listed in §10.

## 2. The problem

Today's portal (version 3.48.0) is one long page per order. From the top it shows the doctor's earnings and incentive, a Call Patient button, patient and delivery address, order details, a choice between the original medicines and substitutes with prices and discounts, "Subs taken" and savings figures, quantity steppers, Add another medicine, a cross-selling section, the full bill, and finally Confirm Order, Cancel Order and Hold Order. A Health Advisor transfer warning stays pinned over the page on transfer cases.

This causes three problems for the doctor and for Truemeds:

- **The doctor's screen does other teams' work.** Prices, substitutes, quantities, cross-selling and the bill belong to pricing and customer service. A price beside each medicine invites cost-based clinical choices and can look like selling, on the same page where the doctor approves the prescription.
- **The call has no status on the page.** The doctor taps Call Patient and the call happens outside the page. Nothing on it shows whether the patient was reached or how long they talked.
- **Handing the patient to a Health Advisor often fails.** Cat4 cases need only the doctor's call; Pilot cases also need a Health Advisor (HA) call, ideally on the same call. Of the Pilot cases meant to end in one call, about 35% end as two separate calls today `[APPROX (Apurva)]`.

Scale: roughly 12,000 orders handled by about 300 active doctors `[NEED: confirm both numbers and the period, OQ-029 (Apurva)]`.

## 3. What we're building

A mobile app for Truemeds doctors, built in React Native for Android and iOS by the app team, that takes a doctor from sign-in to the next case. The clickable prototype and the approved screens are the reference for how it looks and behaves. These choices shape it:

- **Doctors request cases; nothing is pushed.** Freelance doctors choose when they work, so they set how long they're available and pull one case at a time.
- **Click-to-call through a telecom partner, ended on the doctor's phone.** The partner rings the doctor's phone first, then the patient. Truemeds uses Knowlarity for Cat4 cases and Ozonetel for Pilot cases. There is no End call button in the app, because the app doesn't control the call.
- **A prescription counts only after a proven call.** This keeps every prescription tied to a real conversation with the patient (rules in §5.7).
- **The case type picks the final button, never the doctor.** Each case type has one right ending, so the doctor can't route a case the wrong way.
- **One flow for every Pilot case.** The doctor confirms the prescription on the live call, then the system checks for a free Health Advisor and transfers the patient or forwards the case. The doctor never has to know which Pilot variant a case is.
- **The doctor prescribes or disables; nothing else.** No adding medicines, no quantity, no prices, no substitutes. Quantity and price are the backend's and other teams' work.
- **Mobile number and OTP, then fingerprint, Face ID or the phone's screen lock.** Signing in with the phone's own unlock after the first time saves doctors time and cuts SMS cost.

## 4. How it works

A Cat4 case, on the clean path: the doctor sets their availability on Home and taps Request a case. The case opens with the patient, order details, the customer's prescription and the medicines. The doctor taps Call patient; their phone rings, then the patient's. While they talk, the doctor prescribes each medicine and adds notes. The doctor ends the call on the phone. When the partner's result shows a valid call, Confirm prescription appears; the doctor taps it and sees "Prescription confirmed", then requests the next case.

Pilot cases differ at the end: Confirm prescription appears on the live call, and after it the patient is transferred to a Health Advisor on the same call.

*A Cat4 case on the clean path, from the approved screens (`home_active`, `t01-ready`, `t02-calling`, `t08a-valid-cat4`, `t10a-confirmed`)*

*Every calling path, high level (`calling-flow-blocks`). Every calling state, trigger, button and backend event is on the [calling-flow page](https://doctor-portal-prototype.netlify.app/calling-flow/); this PRD doesn't repeat them.*

## 5. Screen by screen

Each screen opens with the job the doctor is trying to get done, then why it's built this way, links to see it, and its rules. Other states are listed as one line each with their exact on-screen message. Every state has an approved picture in the [hand-off kit](https://truemeds-doctor-app-preview.netlify.app/kit).

### 5.1 Sign-in

**Job to be done:** get into the app with my mobile number.

**Built this way because:**
- The mobile number is how Truemeds already knows each doctor, so it's the only field.
- Input that can still become right shows no error while typing; input that can never be right (a first digit that no Indian mobile number has) is flagged at once. The doctor isn't told off for typing.
- Send OTP sits right under the field, so the field and its action stay together above the keyboard.

*Sign-in (`sign-in_default`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/sign-in/sign-in_default) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=sign-in_default)

**What the doctor can do:** enter a mobile number and tap Send OTP; tap Sign up (opens Truemeds' existing doctor sign-up form).

**Rules:**
- Typed or pasted numbers are cleaned: spaces, dashes, a leading 0 and a leading 91 are dropped.
- When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it re-checks on every keystroke.
- All limits (codes, tries, locks) are enforced by the server; the app only shows them.
- The sign-up link, Terms, Privacy Policy and the Doctor Ops number are settings, not built into the app.

**Other states:**
- Empty on Send OTP → "Enter your mobile number."
- Fewer than 10 digits on Send OTP → "Enter all 10 digits."
- First digit not 6–9, as soon as typed → "Mobile numbers start with 6, 7, 8 or 9."
- Sending → button reads "Sending OTP…".
- Not registered → "Number not registered with Truemeds. Already applied? We’ll contact you after approval."
- Offline → "You’re offline. Check your connection."
- Code couldn't be sent → "Couldn’t send the code."
- Too many attempts → "Too many attempts on this number." and the button counts down "Try again in {time}".
- Account inactive → "This account is inactive." and the button becomes Call Doctor Ops.
- Number locked after wrong codes → goes straight to OTP in its locked state (§5.2).

### 5.2 OTP

**Job to be done:** prove the number is mine, quickly.

**Built this way because:**
- The doctor taps Verify & sign in; the code doesn't submit itself on the last digit, so a doctor can check what they typed.
- After a wrong code the digits stay visible, so the doctor can spot a typo or an old SMS; the first new keystroke replaces the whole code, so retyping is instant.
- Verify & sign in never moves for one-line messages, so the doctor's thumb finds it in the same place every time.

*OTP (`otp_default`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/otp/otp_default) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=otp_default)

**What the doctor can do:** type the 4-digit code; tap Verify & sign in; tap Change to fix the number; tap Resend code once the wait is over.

**Rules:**
- The keyboard opens on arrival and stays open while verifying.
- Too many wrong codes lock that mobile number, not the doctor's account (limits in §7). Change stays available; another number works only if Doctor Ops approved it for this doctor.
- The code limit per number isn't reset by restarting sign-in or changing number and coming back.
- An expired code can't be verified; Resend is available at once.
- No Back in the header; Change and the phone's back gesture cover it.

**Other states:**
- Empty or too short on Verify → "Enter the 4-digit code." / "Enter all 4 digits."
- Verifying → "Verifying…".
- Wrong code → "Wrong code."; with tries counting down → "Wrong code. {count} tries left." and "Wrong code. 1 try left."
- New code sent → "New code sent".
- Code expired → "This code has expired."
- Couldn't verify → "Couldn’t check the code."
- Resend failed → "Couldn’t send a new code."
- Too many codes → "You’ve asked for too many codes. Use the last one, or call Doctor Ops."
- Number locked → "Too many wrong tries. Try again in {time}, or call Doctor Ops." Code boxes and Verify are off.
- Code expired and no new code allowed yet → "This code has expired. Request a new code in {time}, or call Doctor Ops."
- Waiting for the server after a cooldown → the line reads "Checking…".
- Offline → "You’re offline. Check your connection."

### 5.3 Faster sign-in offer

**Job to be done:** skip the OTP next time.

**Built this way because:**
- The offer has its own screen right after the first sign-in, so it can't be missed and drives adoption; the point is to cut SMS cost. A pre-ticked box on the OTP screen would be a sneaky opt-in.
- The phone's own prompt makes sense right after a deliberate Turn on.

*Faster sign-in offer, fingerprint (`offer_fingerprint`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/offer/offer_fingerprint) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=offer_fingerprint)

**What the doctor can do:** Turn on faster sign-in (opens the phone's prompt, then Home); Not now (goes to Home; asked again at the next OTP sign-in).

**Rules:**
- Shown after an OTP sign-in, on a phone that supports it, while faster sign-in is off: first after the first sign-in, then again at each later OTP sign-in until the doctor turns it on, **at most 3 times** (a setting). After that it isn't shown again; Profile still turns it on.
- The unlock follows the phone: fingerprint or Face ID if set up, otherwise the phone's screen lock (PIN, pattern or password). A phone with no screen lock at all skips this screen.
- The wording names what the phone has (Face ID, fingerprint, screen lock) and says Truemeds never sees or stores it.
- It can be turned on or off any time in Profile. The phone's back gesture means Not now.

**Other states:**
- Face ID / screen lock versions → same screen, wording for that unlock.
- Turning on → "Turning on…".
- Prompt cancelled → back on the offer, no message.
- Failed → "Couldn’t turn on faster sign-in." with Try again and Not now.
- The phone can't turn it on at the tap (e.g. fingerprints removed meanwhile) → the screen stays, the bar shows "Faster sign-in isn’t available on this phone right now." with Continue (goes to Home). Faster sign-in stays off and the offer counts as shown.
- Offline → "You’re offline. Check your connection."

### 5.4 Returning unlock

**Job to be done:** get back into the app without waiting for an SMS.

**Built this way because:**
- It's the first screen when the app opens for a doctor with faster sign-in on, so it greets them by name and has one main action.
- When the phone's unlock isn't available, the main button changes to the way that still works, so the doctor never hits a dead end.

*Returning unlock, fingerprint (`unlock_fingerprint`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/unlock/unlock_fingerprint) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=unlock_fingerprint)

**What the doctor can do:** unlock with fingerprint, Face ID or screen lock; Use OTP instead; Switch account (goes to sign-in).

**Rules:**
- Repeated failed unlocks fall back to OTP (number of tries in §7).
- No Back; this is the first screen.

**Other states:**
- Unlocking → "Unlocking…".
- Prompt cancelled → back on the screen, no message.
- Phone asks to retry → the phone's own retry prompt.
- Not available → "Faster sign-in isn’t available on this phone right now." at the top; Use OTP instead becomes the main button.

### 5.5 Home: availability, add time, end, Profile

**Job to be done:** know whether I'm taking cases right now and what to do next.

**Built this way because:**
- Home answers one question, *am I taking cases right now, and what do I do next?* Anything else lives in Profile.
- Doctors pull cases, so a quiet moment with no cases is normal, not an error.
- Availability can end during a case without interrupting it; the doctor finishes the case first.

*Home while available (`home_active`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/home/home_active) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=home_active)

**What the doctor can do:** set how long they're available (quick picks 15, 30 and 45 minutes, 1, 2 and 3 hours, or a wheel in 15-minute steps); Request a case; Add time when time is running low; End availability; open Profile, Help and notifications.

**Rules:**
- Availability has a minimum length (§7), any start time, no maximum.
- Home shows time remaining and prescriptions confirmed today (a count only, no earnings). A case counts once its prescription is confirmed.
- A request made before availability ends is honoured even if the case arrives after.
- Ending availability with a request pending stops new requests; the pending one is honoured and any case it brings is finished first.
- Availability that ends during a case never interrupts it; the case's ending offers only Back to Home.
- Help and the bell are on Home; the bell is never inside a case. In this release both open a blank placeholder (§9).
- Profile is a page: name and role, today's earnings, User manual, Faster sign-in on/off, Log out. Log out asks first, and isn't available while a case is open.
- One phone signed in at a time. The session stays valid through an open case; the doctor is never asked for an OTP over a live case.

**Other states:**
- Not available yet → availability picker on Home with Set availability; while setting, "Setting…".
- Setting failed → "Couldn’t set availability. Your selection is saved."
- Requesting → "Requesting…".
- No cases → "No cases right now. Try again in a minute."
- Request failed → "Couldn’t request a case."
- Request result unknown → "Checking whether your case request went through…"
- Offline → "You’re offline. Reconnect to request a case." End availability is greyed out.
- Ending soon → "Availability ends soon. You can still request a case." with + Add time.
- Adding time → "Adding…"; done → "Time added"; failed → "Couldn’t add time."
- End availability → confirmation sheet; with a request pending → "Finishing your last request. Availability ends after that."
- Ended with a request still out → "Your last request is still active."
- Ended while idle → "Your availability ended. You won’t get new cases."; ended by the doctor → "You ended your availability. You won’t get new cases."
- Profile during an open case → "You can log out after this case is closed."
- Log out confirm → "You’ll stop getting cases until you sign in again." with Log out and Stay signed in.

### 5.6 Case page before the call

**Job to be done:** understand the case and get ready to call the patient.

**Built this way because:**
- Everything the doctor needs before calling is on one page: patient, order details, the customer's prescription, the medicines with their status, and notes.
- Before the call the doctor can still leave the case, because a case taken by mistake should go back to another doctor quickly.
- Once the patient has been reached, leaving is no longer possible, so a consultation can't be dropped halfway.

*Case page, ready to call (`t01-ready`, state 1)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/calling/t01-ready) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=t01-ready)

**What the doctor can do:** read order details; View Rx; open any medicine to prescribe or disable it (§5.10); type notes (§5.11); Call patient; Back to leave the case.

**Rules:**
- Each medicine row shows its form, name and strength, the customer's quantity (read-only) and a status: Prescribed, Pending or Disabled.
- Back is there only while the screen offers a call button and the patient has never been reached. It opens "Leave this case?" with Release case and Stay. Release returns the case to the queue and the doctor to Home.
- The backend refuses a release once the partner has accepted our call request for the case, unless the call didn't go through or the doctor didn't answer.
- Release isn't the same as Patient unavailable or Callback; each has one job (§5.9).
- Ops tracks each doctor's release rate.
- Reopening the app with a case open goes straight back into the case.

**Other states:**
- Loading → a skeleton shaped like the loaded page, no actions.
- Load failed → "Couldn’t load this case." with Try again.
- No medicines on the order → "No medicines on this order. Our Ops team will check it." No Call patient; Release case releases directly and returns to Home.
- Offline → "You’re offline. Reconnect to call or confirm."; an action tried offline → "No connection. Nothing was lost."
- Releasing → "Releasing…"; refused → "Couldn’t release this case. You’re still on it."
- Phone back once a call has started → toast "Finish this case first." "Then you can go back to Home."
- Long names, many medicines, empty optional fields → covered by the stress pictures.

### 5.7 Calling: rules for every case, and Cat4 / Pilot with HA skipped

**Job to be done:** talk to the patient and confirm the prescription once the call counts.

**Built this way because:**
- With click-to-call the app doesn't control the call, so it shows what the telecom partner reports and never offers a button that would do nothing.
- Long waits are shown as status text, not buttons, so nothing looks tappable that isn't.
- Each button keeps one meaning, and nothing lets a doctor close a case with a prescription without speaking to the patient.

*Valid call, Cat4 (`t08a-valid-cat4`, state 8a)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/calling/t08a-valid-cat4) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=t08a-valid-cat4)

**Rules for every call:**
- **Valid call.** A call is valid when total talk time on the case reaches the gate time (§7). Talk time adds up across connected calls on the same case. The doctor is never shown the count.
- Who decides the call is valid: on a live Pilot call that still has a Health Advisor call to come, the app's own count from the moment the patient answered, so Confirm prescription can appear while the patient is still on the line (the partner's duration is kept for reporting). On every other call (Cat4, and Pilot with the Health Advisor call skipped), the telecom partner's call result after the call ends.
- Attempted call: a call is attempted only when the patient's leg connects (the patient answered). A failed request or a doctor who didn't answer isn't an attempted call.
- Before the call is valid, the app never shows Confirm prescription, Confirm & transfer, Confirm & forward or Skip HA. The one exception is when no call result came at all: the doctor can then confirm, and the confirm waits for the call record (next rule).
- **Final button by case type.** The system picks it:

| Case type | Health Advisor (HA) | Final button | Ending |
|---|---|---|---|
| Cat4 | none | Confirm prescription | Prescription confirmed |
| Pilot | HA skipped (by the customer, the system or the doctor) | Confirm prescription | Prescription confirmed |
| Pilot | HA required | Confirm prescription on the live call, then the HA check (§5.8) | Transferred to Health Advisor, or Forwarded to Health Advisor |
| Pilot | HA required, call ended before Confirm or no call result | Confirm & forward | Forwarded to Health Advisor |

  Cat4 cases never show anything about Health Advisors.
- **An unproven confirm isn't confirmed.** If the call record shows talk time under the gate, shows the patient never answered, or doesn't arrive within the record wait time (§7), the prescription isn't confirmed: the case goes back through hold and retry, the doctor isn't paid for it, and the mismatch is logged for analytics. Nothing goes to an Ops review queue.
- Unreviewed medicines block Confirm. The button stays tappable; tapping it with medicines still Pending shows "Prescribe or disable {n} medicines first." and scrolls to the first Pending one.
- Patient-side failures close the case by themselves: no answer, busy, switched off, unreachable or invalid number ends the case as Patient unavailable (§5.9), whenever it's detected.
- From the tap on Call patient, while a call may be live, an end-of-call script for the patient shows on the case page. It hides once the call has ended.
- The app shows a change in the call's status soon after the partner reports it (§7).

**What the doctor can do:** Call patient; Call again when the call didn't go through, the doctor missed it or it was too short; answer "Are you still on the call?"; Confirm prescription once the call is valid; Callback when the call was too short or no result came; Patient unavailable when no result came (§5.9).

**Every state of the call** (calling, didn't go through, you didn't answer, getting the result, too short, still on the call, result not received, waiting for the call record): see the [calling-flow page](https://doctor-portal-prototype.netlify.app/calling-flow/).

### 5.8 Calling: Pilot cases

**Job to be done:** confirm the prescription on the call and hand the patient to a Health Advisor when one is free.

**Built this way because:**
- The doctor confirms on the live call and the system checks for a free Health Advisor afterwards, so the doctor doesn't need to know in advance whether one is available.
- When no Health Advisor is free, the patient is told one will call back. Nothing the patient or the doctor sees says a Health Advisor is unavailable, because that signals a lack of capacity.
- The doctor can skip the Health Advisor call with a reason when it isn't needed.

*Pilot live call after the gate (`g1-generic-confirm`, state B1)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/calling/g1-generic-confirm) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=g1-generic-confirm)

**What the doctor can do:** Confirm prescription on the live call; Skip HA with a reason; after the case is transferred or forwarded, Request next case or Back to Home.

**Rules:**
- After Confirm prescription the app checks for a free Health Advisor. Free → the patient is transferred on the same call and the case ends as Transferred to Health Advisor. None free, or the transfer couldn't start → the case is forwarded: a Health Advisor calls the patient back.
- While a forwarded call is still live, the doctor reads the patient a script and sees only "Waiting for the call to end…". Request next case and Back to Home appear after the hang-up.
- A forward is confirmed only on the partner's call result.
- If the call ends after the gate but before Confirm, the doctor gets Confirm & forward or Skip HA.
- Skip HA is offered only after the call is valid, only on Pilot cases that still have a Health Advisor call to come, and not when no call result came. Reasons: the patient declined the Health Advisor call; clinically not required; repeat patient, familiar with the medicines. On a live call the case then waits for the call result and continues as a Cat4 case.
- Each of the four endings (Cat4 confirmed, Pilot HA skipped confirmed, transferred, forwarded) is tracked as a separate outcome (§11).

**Every Pilot state** (calling, checking for a Health Advisor, transferring, forwarded, ended before the transfer, HA call skipped): see the [calling-flow page](https://doctor-portal-prototype.netlify.app/calling-flow/).

### 5.9 Ending without a prescription: Callback, Patient unavailable, Release

**Job to be done:** close a case I can't finish now, the right way.

**Built this way because:**
- Each way out has one job. Release: this case isn't for me, so it goes to another doctor. Patient unavailable: the patient couldn't be reached, so the system holds and retries. Callback: talk to the patient later, at a booked time.
- Callback is offered only after a call in which the patient answered, so a callback is never booked for someone who was never reached.

*Schedule callback sheet (`c-callback`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/calling/c-callback) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=c-callback)

**Rules:**
- **Callback** is offered only when the call was too short or no call result came. The doctor picks today or tomorrow and a time; the case closes for this doctor and goes to the callback pool. The backend refuses a callback unless the patient answered.
- **Patient unavailable** happens by itself when the patient's side fails, and goes on hold. The system retries by the reason the call failed: busy, no answer, switched off or a network problem are retried after a gap; an unknown reason is a plain hold; an invalid number isn't retried and is flagged for data cleanup.
- The doctor can mark the patient unavailable only when no call result came, choosing a reason: didn't answer, not reachable, wrong number. The reason is saved with the case.
- **Release** is described in §5.6.
- Notes typed on a case that ends as Callback or Patient unavailable aren't saved (§5.11).

**Other states:**
- No date or time picked → "Pick a date and a time." / "Pick a date." / "Pick a time."
- Callback couldn't be saved → "Couldn’t schedule the callback. Your time is kept."
- Callback refused → "Couldn’t schedule the callback. The patient wasn’t reached."
- Callback booked → card "Callback today at 3:00 PM" (the chosen day and time).
- Patient unavailable → card "Patient unavailable", with Request next case and Back to Home.

### 5.10 Prescribe

**Job to be done:** set exactly how the patient should take one medicine, or take it off the order.

**Built this way because:**
- A full screen, not a sheet, so a long form has one scroll area and can't be dismissed by accident.
- A pinned line shows exactly what will print, updated on every tap, so the doctor checks the result, not the controls.
- Doses use M / A / N and 1-0-1, as doctors write them every day, and the dose options follow the medicine's form.
- No quantity and no price: quantity is calculated by the backend from the schedule, and a price beside a medicine invites cost-based choices.

*Prescribe, tablet daily (`d-default`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/prescribe/d-default) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=d-default)

**What the doctor can do:** choose how often (Daily, Every X hours, Alt days, Weekly, Monthly, SOS only); set the dose; add an extra as-needed (SOS) dose with a daily cap; set the duration or Ongoing; optionally choose food timing and write additional instructions; Prescribe; Disable with a reason; close.

**Rules:**
- Choices: Every X hours is 4, 6, 8 or 12 hours; SOS allows 1 to 4 doses a day; duration is 1–7, 10, 14 or 15 days, weeks or months, or Ongoing; food timing is after food, before food or empty stomach (optional).
- Every section opens filled with the backend's defaults. Duration marks whether the doctor kept the default; Ongoing prints the backend's default length (§7).
- SOS limits print the daily total in the medicine's unit (see the table), so the patient never has to multiply.
- Prescribe saves the medicine as Prescribed, and re-enables it if it was disabled.
- Disable asks for a reason: can't prescribe remotely, contraindicated for the patient, duplicate medication, patient declined, wrong strength. A disabled medicine is removed from the order and the order ships without it. If none are left, the order is cancelled later.
- The doctor can't add medicines or change quantity.
- Closing with unsaved changes asks "Discard changes?"; closing without changes closes at once.
- Errors scroll the screen to the first error and sit under their field.

**Medicines by form:**

The printed line is the schedule, then the duration, then food timing and instructions if given.

| Form | Dose unit | Daily slots (M / A / N) | Single-dose options | Other dose | Printed line, examples |
|---|---|---|---|---|---|
| Tablet | tablet | 0 · ½ · 1 · 2 | ½ · 1 · 2 | — | `1-0-1 · 6 months · Before food` · with SOS: `1-0-1 + SOS 1 tablet (max 1 tablet/day) · 6 months` · SOS only: `1 tablet as needed (max 1 tablet/day) · 6 months` |
| Capsule | capsule | 0 · 1 · 2 | 1 · 2 | — | `2 capsules once a week · 6 months` |
| Syrup | ml | 0 · 2.5 · 5 · 10 | 2.5 · 5 · 10 | any amount in ml | `0-10-10 ml · 7 days` |
| Drops | drop | 0 · 1 · 2 · 3 | 1 · 2 · 3 | — | `0-1-1 drops · 7 days` |
| Inhaler | puff | 0 · 1 · 2 | 1 · 2 | — | SOS only: `2 puffs as needed (max 8 puffs/day) · 6 months` |
| Injection | units | 0 · 1 · 2 · 3 | 1 · 2 · 3 | any amount in units | `1 dose once a month · 3 months` |
| Cream | — | Apply or not | Apply | — | `Apply 0-1-1 · 7 days` · SOS only: `Apply as needed (max 3 times/day)` |

**Other states:**
- Daily schedule with no dose → "Choose a dose for at least one time of day."
- Other dose that isn't a plain positive number → "Use numbers only, e.g. 7.5 units."
- A disabled medicine opens with "Disabled: {reason}. Prescribing it will enable it again."
- Customer's prescription couldn't load → "Couldn’t load the prescription."
- Every form and schedule has its own picture in the [hand-off kit, Prescribe](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/prescribe).

### 5.11 Rx viewer and notes

**Job to be done:** read the customer's prescription and record what the patient told me.

**Built this way because:**
- The doctor checks the prescription the customer uploaded while talking, so it opens full screen with zoom and rotate.
- Notes are consultation notes, not a call log, so they're saved only when the prescription is confirmed.

*Rx viewer (`a-rx-viewer`)*

[See this state](https://truemeds-doctor-app-preview.netlify.app/kit/viewer/#screens/case/a-rx-viewer) · [Try it](https://truemeds-doctor-app-preview.netlify.app/?s=a-rx-viewer)

**What the doctor can do:** View Rx (zoom, rotate, reset, pinch and drag); type chief complaints / symptoms and doctor notes.

**Rules:**
- View Rx looks and works the same on open and closed cases. It is disabled while confirming.
- Both notes fields are optional and editable from the moment the case opens until Confirm. Typed text is kept if the connection drops.
- Notes are saved only when the prescription is confirmed and locked after it. Symptoms print on the prescription; doctor notes are internal (doctor, Health Advisor, Ops, pharmacy).

**Other states:**
- Rx couldn't load → "Couldn’t load the prescription." with Try again; ✕ still closes.
- Typing a note → the field scrolls into view above the keyboard.

## 6. Rules on every screen

- The result of a tap sits next to the button that caused it (in the pinned action bar, above its button). A message about the whole screen sits at the top. Messages don't repeat the button's text.
- A failed action shows one message and keeps what the doctor typed or chose; nothing is lost.
- While an action runs, its button shows progress ("Confirming…", "Releasing…") and nothing can be tapped twice. An unclear result is checked before a retry, so nothing is confirmed twice.
- Offline, the doctor can keep reading; actions that need the server say so.
- The focused field scrolls above the keyboard with its label; the pinned action bar hides while the keyboard is open.
- Everything the doctor needs works on a 360-wide phone; the pinned bar never covers the last content.
- Words: case for the doctor's unit of work (the customer's order ID stays as is); patient, never customer; Health Advisor in full, except on the Skip HA button. All text comes from one copy file and follows the copy standard (Annex B).
- Help is on Home and the case page. In this release it opens a blank placeholder (§9); it is meant to become how a doctor reaches Doctor Ops.
- The app uses the central Truemeds design system; the screens in `ui-screens/` are the reference.

## 7. Settings

Every value below is a starting value, set by its owner and changeable without an app release.

| Setting | Starting value | Owner |
|---|---|---|
| Valid-call gate: total talk time on a case | 50 seconds | Product |
| Which calls add up to the gate | calls of at least about 10 s, within about 30 min, on the same case | Product, validated with call logs |
| Call status shown after the partner reports it | within about 5 seconds | Engineering |
| No call result: when the app asks "Are you still on the call?" or checks for the record | 3 minutes after the tap, then every 3 minutes | Engineering `[working default, OQ-030]` |
| Call-record wait time after a confirm without a result | `[NEED]` | Product + Engineering |
| Patient unavailable: retry gaps and attempts, by failure reason | `[NEED]` | Doctor Ops + Engineering |
| Minimum availability | 15 minutes | Product |
| "Availability ends soon" shown when time left is under | `[NEED]` | Product |
| OTP: wrong codes before a number is locked | 5 | Product |
| OTP: codes per number per limit window (first code + resends) | 4 | Product |
| OTP: lock length, limit window, code life | `[NEED, OQ-017]` | Product + Engineering |
| OTP: resend waits (each longer than the last) | `[NEED, OQ-017]` | Product |
| Failed phone unlocks before falling back to OTP | `[NEED]` | Product |
| Faster sign-in offer: most times shown (at OTP sign-ins, until turned on) | 3 | Product |
| Ongoing duration prints as | 6 months | Product |
| Doctor earnings per confirmed prescription | ₹20 | Doctor Ops |
| Callback time slots | sent by the backend | Doctor Ops |
| Sign-up link, Terms, Privacy Policy, Doctor Ops number | sent by the backend | Product |

## 8. User stories

- As a doctor, I set how long I'm free and request cases one at a time, so I work when it suits me.
- As a doctor, I see on every screen what the call is doing and what I can do next, so I never tap something that does nothing.
- As a doctor, I can leave a case I took by mistake before I call, without it counting against me.
- As a doctor, I know a prescription counts only when the call is proven, so I don't need to argue about calls.
- As Doctor Ops, I see release and patient-unavailable rates per doctor, and the reason for each manual "unavailable", so I can spot misuse.
- As Doctor Ops, I never receive a case with no medicines through a doctor; empty orders come to me directly.
- As a Health Advisor, I receive Pilot patients with the prescription already confirmed, either live on the call or as a callback.

## 9. Scope

**In this release:** sign-in with OTP, faster sign-in (offer, returning unlock, Profile switch), Home with availability, Profile, the case page, calling for Cat4 and Pilot cases (the flow in §5.8), Prescribe, the Rx viewer and notes, Callback, Patient unavailable and Release.

**Not in this release:**
- Confirm & transfer chosen at call start for Pilot cases (Annex A). It needs a Health Advisor reserved when the call starts.
- Calling inside the app, with its own call controls. The doctor's phone handles the call.
- Cases pushed to doctors. Doctors only request cases.
- Pricing, substitutes, the bill, cross-selling, adding medicines and changing quantities. These stay with pricing and customer service.
- Valid Rx orders (Health Advisor call only). They don't reach the doctor app.
- What Help and the notifications bell open (blank placeholder for now), the Profile redesign, the User manual content, and a bottom tab bar for future destinations.
- Earnings beyond today's total in Profile (a wallet), and incentive rules.
- A per-medicine detail view (price, image), orders with several patients, diagnostic tests, and the patient's order history.
- A senior-doctor (Super Doctor) role and its permissions.
- A clinical "I won't prescribe this case" path with escalation. Today the doctor can disable each medicine with a reason (§5.10).
- Structured diagnosis and allergy fields, a review step showing the full prescription before Confirm, and a line telling the doctor why the case needs them.

## 10. Decided vs open

**Decided** (each stated once, in its section):
- Doctors request cases; nothing is pushed (§3, §5.5).
- Click-to-call with the doctor's phone ringing first; no End call in the app (§3).
- Valid-call gate, attempted call, final button by case type, unproven confirms not counted (§5.7). A call record that arrives late and shows talk time under the gate counts as an unproven confirm (§5.7).
- One Pilot flow: confirm on the call, then the Health Advisor check (§5.8).
- Release, Patient unavailable and Callback, one job each (§5.9).
- No adding medicines, no quantity, no prices on the doctor's screens (§5.10).
- Four endings tracked as separate outcomes (§11).
- Faster sign-in offer: again at each OTP sign-in until turned on, at most 3 times (§5.3, D-104).

**Working default:** the app learns the call's status by asking the backend at short intervals (polling) until Engineering confirms the method and interval (OQ-030).

**Open, confirm first:**

*Telecom partners and calling*
- Live events during the call from each partner: doctor's leg answered, patient's leg answered; polling interval; maximum call length; result wait time; how a failed Health Advisor transfer leg is reported. (OQ-030) [Engineering]
- Does Knowlarity send a call-ended event for Cat4 calls, so the app can show "Getting call result…" there too? [Engineering]
- Does Ozonetel report who ended the call in time to tell the doctor? (OQ-030) [Engineering]
- Mapping each partner's failure codes (Ozonetel customer status, Knowlarity hangup causes) to the outcomes in §5.7 and the retry reasons in §5.9. [Engineering]
- On phones without VoLTE, mobile data pauses during a normal call. Can the app tell? Until then such cases go as a forward. (OQ-031) [Engineering]
- Which partner carries Pilot cases that today go as two calls? [Engineering]

*Cases*
- The release action in the backend: refusing a release once our call request is accepted, and returning the case to the queue at once. (OQ-024) [Engineering]
- Restoring an open case when the app reopens, and when a case is released if the doctor never comes back. (OQ-025) [Engineering]
- How an empty order is kept out of the doctor queue, and who in Ops handles it. (OQ-035) [Engineering + Ops]
- Should Home keep checking for a case after "No cases right now", and how often? (OQ-019) [Apurva + Engineering]
- Does the doctor who picks up a callback from the pool see the earlier doctor's notes? (OQ-020) [Apurva]
- The table where unproven confirms are logged for analytics. [Engineering]
- Which calls add up to the gate, exactly: the shortest call that counts and what the time window is measured from (§7 gives approximate starting values). [Product + Engineering]

*Health Advisors*
- Reserving a Health Advisor when the call starts, needed for Annex A. (OQ-032) [Apurva + Engineering + Ops]

*Sign-in*
- OTP code life, lock length, limit window and reset, session length, and Doctor Ops approval of a second number. (OQ-017) [Product + Engineering]

*Ops and money*
- Flag rules for release and patient-unavailable rates per doctor. [Doctor Ops]
- Incentive rules shown in Profile. [Doctor Ops]
- For syrups, injections, creams, drops and inhalers, does the prescription quantity count packs or doses? (OQ-014) [Apurva]

*Legal*
- Telemedicine Practice Guidelines need recorded patient consent when the doctor starts a consultation. Does the patient's order count? (OQ-018) [Legal]

*Privacy*
- Is the patient's number hidden from the doctor in the app, and are consultation calls recorded (and if so, with what consent and retention)? [Legal + Apurva]

*Support*
- What a crash or help report contains and where it goes. (OQ-022) [App team]

## 11. How we'll know it worked

The goal is a better experience for doctors, so that patients get a better consultation. Doctor satisfaction (NPS) and ease of use are the signal for that; the numbers below show whether it reaches patients and orders.

| Measure | Definition | Source | Baseline |
|---|---|---|---|
| **Primary:** doctor-handled orders that end confirmed | orders ending in any of the four confirmed endings with a proven call ÷ orders a doctor opened (each order counted once, even if released to another doctor) | backend case outcomes | `[NEED (Doctor Ops)]` |
| **Guardrail:** discards on doctor-handled orders | orders a doctor opened that end with the order status DISCARD ÷ orders a doctor opened; should go down | order status | `[NEED (Doctor Ops)]` |
| Doctor satisfaction and ease of use | doctor NPS and an ease-of-use score from a short in-app or periodic survey | survey | `[NEED: survey and cadence (Doctor Ops)]` |
| Confirmed prescriptions per available doctor-hour | prescriptions confirmed (proven call) ÷ hours doctors were available | backend case outcomes, availability windows | `[NEED (Doctor Ops)]` |
| Time to outcome | from Request a case to the ending the doctor sees (waiting for the call record counts as the doctor's ending; final confirmation is tracked by Unproven confirms) | app events | `[NEED (Doctor Ops)]` |
| Unproven confirms | share of confirms not proven by the call record | mismatch table | new |
| Pilot transfers | share of Pilot cases ending Transferred rather than Forwarded | backend case outcomes | `[NEED (Doctor Ops)]`, see §2 |
| Release and patient-unavailable rates | releases ÷ cases the doctor opened; Patient unavailable endings ÷ cases where the doctor tapped Call patient; per doctor, per week | backend case outcomes | `[NEED (Doctor Ops)]` |
| Faster sign-in adoption | share of returning sign-ins done with the phone's unlock rather than an SMS code | app events | new |

**Tracking rule:** the four endings (Cat4 confirmed, Pilot with HA skipped confirmed, transferred, forwarded) are separate outcomes and can never be worked out from the button text, because two of them share the label Confirm prescription. Renaming a button never renames an event. Release, Callback, Patient unavailable (automatic or by the doctor, with reason) and Skip HA (with reason) are tracked too. Event names are Engineering's choice. Calls are counted in Truemeds' funnel terms: a call is *attempted* when the patient's leg is *connected*.

## Annex A. Later: Pilot route chosen at call start

When a Health Advisor can be reserved as the doctor's call starts (OQ-032), the route is known before Confirm:

- Pilot, Health Advisor reserved: the live call shows **Confirm & transfer** (with Skip HA) once the call is valid; the patient is handed over on the same call. If the transfer fails, the case goes as a forward.
- Pilot, no Health Advisor on the call: the doctor confirms after the call with **Confirm & forward**.

These screens are designed and approved (`t11-calling-transfer`, `t12-transfer-ready`, `t08b-valid-forward`) but aren't built in the launch release.

## Annex B. Copy

All on-screen text lives in one copy file (`ui-screens/feedback/messages.json`) and follows the copy standard (`docs/reviews/2026-11-03-copy-audit/COPY-RULES.md`). The copy fixes decided in review are already applied in the copy file and the pictures; the record of each change is `COPY-ANNEX.md` (in the project repository). Where this PRD quotes a message, the copy file wins.

## Annex C. Change log

| Version | Date | Change | Why | Approved by |
|---|---|---|---|---|
| — | — | — | — | — |
