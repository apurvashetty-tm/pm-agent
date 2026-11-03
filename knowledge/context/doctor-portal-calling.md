# Doctor portal — calling mechanics (Truemeds)

Reusable facts about how doctor calls work, from the doctor-portal calling review (project decision D-83, 2026-11-03). Project: `projects/truemeds-doctor-portal-prototype/`.

- [USER-PROVIDED] Two telecom partners: **Ozonetel** for Pilot cases (sends live events, including "patient answered" and "call ended") and **Knowlarity** for Cat4 (sends only the final call result; nothing reaches the app during the call).
- [USER-PROVIDED] Click-to-call has two legs: leg 1 rings the doctor, leg 2 rings the patient. Doctor-side failures (leg 1, or our request failing) and patient-side failures (leg 2, or the patient's number) are handled differently.
- [USER-PROVIDED] On a transfer to a Health Advisor (HA), the doctor's leg drops automatically once the HA's phone starts ringing. If the HA doesn't pick up, the order stays partially digitised and an agent calls the patient back — not the doctor's concern.
- [USER-PROVIDED] Launch order: "Fallback B" (route decided after the doctor confirms) ships first; reserving an HA at call start ("target A") comes later.
- [USER-PROVIDED] A patient who can't be reached goes on hold and is retried by the system by hangup cause (pattern from the Ring AI PRD §6); invalid numbers aren't retried. Nothing goes to Ops.
- [UNVERIFIED] Whether Knowlarity sends any call-ended event, and which partner handles Pilot Non-Value Meds — open with Engineering.
- [USER-PROVIDED] Fallback B is the one Pilot flow (2026-11-03, D-87): every Pilot case, Non-Value Meds included, is confirmed on the live call; after Confirm the system checks for a free Health Advisor — free → transfer, none → forward.
- [USER-PROVIDED] Skip HA on a live call (D-85): the doctor waits for the call result ("Getting call result…") and confirms on the result; no confirm on the live call without a transfer, because only the call record proves the 50-second gate.
- Full calling flow with triggers, buttons and events per state: `projects/truemeds-doctor-portal-prototype/calling-flow/` (data in `data.js`).
