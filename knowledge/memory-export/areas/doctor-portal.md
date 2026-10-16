<!-- memory path: /areas/doctor-portal.md · last updated in memory: 2026-10-09 -->
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
- [stated] Next scope: restyle onto the central Truemeds design system; add OTP login + working-hours (session end time) screen; shift-end popup to extend session or log out; prescription changes (drop Qty, frequency beyond 3×/day, more duration options). Plans to split build/review work between Claude and ChatGPT to move faster and save tokens.
- [stated] Working-hours window is used by backend to predict supply availability
- [stated] Restyle onto the central design system is done (visual only); final desktop layout decision: app shows as a centred 9:16 phone frame (one scroll area, bottom sheets anchored inside the frame, demo panel beside it) — earlier "mobile column + side panel" and "natural scrolling page" views were both superseded; mobile layout unchanged; wants this written as a rule so it isn't repeated
- [stated] Logos are vendored locally from official assets, never hotlinked or redrawn
- [stated] Dropped the "Doctor Portal" name; the app's selected identity is the "truemeds for doctors" lockup (original Truemeds logo + lowercase "for doctors" descriptor, developed with Codex), now used in the app header; master kept at project level (project brand/ folder), not in the design system — product-specific lockups belong to their project. Supersedes the earlier "icon-only header" and "Truemeds Doctor" name ideas.
- [stated] Qty decision: doctor can't edit quantity; shown read-only as auto-calculated (backend preselects max, Ongoing = 6 months, recalculates only if doctor changes frequency/duration). Price removed from the doctor's view entirely. View Rx (customer-uploaded) unchanged.
- [stated] Truemeds can't assign orders to doctors directly; doctors request the next order themselves (Next Order). Sign-in: mobile + OTP with biometric unlock (cuts SMS cost); sign-up redirects to Truemeds' existing web form.
- [stated] Live prototype link: https://doctor-portal-prototype.netlify.app (Netlify site deploying from the pm-agent repo's main branch)
- [stated] Wants product/design decisions from working discussions captured with their reasoning (project decision log), and the project docs kept in line with them
- [stated] Created a ui-screens/ folder in the project (scaffolded with ChatGPT) to hold only screens she has approved, as the handoff set for Claude and frontend engineers; concepts and review drafts stay in docs/renders/
