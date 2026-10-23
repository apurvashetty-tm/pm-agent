<!-- memory path: /areas/doctor-portal.md · last updated in memory: 2026-10-17 -->
---
name: doctor-portal
description: Truemeds Doctor Portal revamp prototype — Apurva's view of its state and the UI fix direction; read when doctor portal comes up
sources: [cowork]
aliases: [truemeds doctor portal, doctor portal prototype, doctor portal revamp]
---
- [stated] Owns the Truemeds Doctor Portal revamp prototype (mobile-web, doctor consultation workflow); lives at ~/src/pm-agent/projects/truemeds-doctor-portal-prototype
- [stated] Feels its functionality/JTBD is good but UI/UX fails — colourful icons, doesn't match Truemeds design system
- [stated] Uses the IRIS BA app (a Purplle Beauty Advisor app, ~/src/iris-ba-app) only as a visual-quality reference, not for functionality or branding
- [stated] Goal: fix the doctor portal UI with an approach tailored to Truemeds' own design system
- [stated] Next scope: restyle onto the central Truemeds design system; add OTP login + working-hours (session end time) screen; shift-end popup to extend session or log out; prescription changes (drop Qty from the prescription/Prescribe page, frequency beyond 3×/day, more duration options). Plans to split build/review work between Claude and ChatGPT to move faster and save tokens.
- [stated] Working-hours window is used by backend to predict supply availability
- [stated] Restyle onto the central design system is done (visual only); final desktop layout decision: app shows as a centred 9:16 phone frame (one scroll area, bottom sheets anchored inside the frame, demo panel beside it) — earlier "mobile column + side panel" and "natural scrolling page" views were both superseded; mobile layout unchanged; wants this written as a rule so it isn't repeated
- [stated] Logos are vendored locally from official assets, never hotlinked or redrawn
- [stated] Dropped the "Doctor Portal" name; the app's selected identity is the "truemeds for doctors" lockup (original Truemeds logo + lowercase "for doctors" descriptor, developed with Codex), now used in the app header; master kept at project level (project brand/ folder), not in the design system — product-specific lockups belong to their project. Supersedes the earlier "icon-only header" and "Truemeds Doctor" name ideas.
- [stated] Qty placement (2026-10-16): no Qty on the Prescribe page; Qty shown read-only on the case page medicine rows (it had been dropped there by mistake during renders and was restored).
- [stated] Qty decision: doctor can't edit quantity; shown read-only as auto-calculated (backend preselects max, Ongoing = 6 months, recalculates only if doctor changes frequency/duration). Price removed from the doctor's view entirely. View Rx (customer-uploaded) unchanged.
- [stated] The doctor app's unit of work is called a "case", not an "order" — use "case" everywhere in the doctor app (e.g. "Request next case")
- [stated] Truemeds can't assign cases to doctors directly; doctors request the next case themselves. Releasing an assigned case back to the queue was only discussed, not decided (2026-10-17); a finished case offers "Back to Home" alongside requesting the next case. Sign-in: mobile + OTP with biometric unlock (cuts SMS cost); sign-up redirects to Truemeds' existing web form.
- [stated] Live prototype link: https://doctor-portal-prototype.netlify.app (Netlify site deploying from the pm-agent repo's main branch)
- [stated] Wants product/design decisions from working discussions captured with their reasoning (project decision log), and the project docs kept in line with them
- [stated] Created a ui-screens/ folder in the project (scaffolded with ChatGPT) to hold only screens she has approved, as the handoff set for Claude and frontend engineers; concepts and review drafts stay in docs/renders/
- [stated] Truemeds is launching native Android and iOS doctor apps, built by the app team in React Native; the app team owns bringing the design system into React Native. Existing Truemeds apps use both Sentry and Crashlytics.
- [stated] Giving her dev team access via a copy of the project in its own repo (not a split from pm-agent): copies flow one way pm-agent → new repo until handover; after handover, work happens in the doctor portal repo; once live and stable, updates move back to pm-agent
- [stated] OTP screen redesign direction (Oct 2026): drop logo on OTP, phone number and "Change" on one line, single-line resend; biometric opt-in moves to its own screen after sign-in (skip or accept, to drive adoption) instead of a card on OTP; agreed a 4-level type scale for clearer hierarchy (to go into the central design-system rules); OTP does not auto-verify on the 4th digit — doctor taps Verify; sign-in keeps Send OTP directly under the field (not pinned to the bottom)
- [stated] Wants the prototype rebuilt from scratch instead of extending the original index.html (it grew from one screen and bloated; not built to scale); the consultation rules currently living in index.html are to be captured in a .md file first
- [stated] Calling today: "Call patient" triggers Knowlarity click-to-call — Knowlarity rings the doctor's own phone first, then connects the patient; the doctor ends the call on the phone, not in the app. Exploring an alternative where Call patient / End call work like native call buttons inside the app so doctors never leave it.
- [stated] Going with Knowlarity click-to-call for the first release (call ended on the doctor's phone, no End call in the app); in-app VoIP calling to be explored later
- [stated] Click-to-call is not Knowlarity alone: it's Ozonetel + Knowlarity together — refer to it generically as the "telecom partner"
- [stated] The doctors using the portal are freelance doctors; case volume per doctor depends on their availability (rough, unconfirmed: ~12,000 orders touched by ~300 active doctors — she'll confirm the numbers)
- [stated] Truemeds order categories (her definitions; don't conflate with tm-chotu's DOCTOR_CATEGORY): Cat4 = doctor category 4 = doctor call only; Valid Rx = valid Rx present, HA call only; Pilot = both doctor and HA calls — Value Meds when the doctor transfers the patient to the HA on the same call, Non-Value Meds when they are two separate calls. Which one a Pilot case becomes depends on HA availability (transfers, drop-offs).
- [stated] A call counts as "attempted" only if leg 2 (the customer) is connected.
