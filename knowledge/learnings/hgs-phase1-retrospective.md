# Learnings — HGS Phase 1 (NFS Relaunch)

**Project:** High Governance Salts Phase 1
**Completed:** June 2026

---

## What Worked Well

- **Audience-split SOPs** — separating Doctor and Operations guides was the right call; each doc became cleaner and more usable
- **UAT video + transcript as source material** — extracting screenshots directly from UAT video ensured images matched real product state, not mockups
- **Doctor roster from Excel** — having the actual doctor names and IDs in the Ops SOP gives the team an actionable reference without needing to check another system
- **CTA-based end-of-call section** — the three-CTA table (Confirm / Transfer / Forward) became the clearest section in the Doctor SOP; worth replicating for other doctor portal docs

## What to Do Differently Next Time

- **Lock error scenarios early** — two error states were written into the SOP that don't exist in the product. Validate all error messages against engineering before drafting
- **Confirm call flow before writing workflow sections** — the prescription-on-live-call correction required a full rewrite of three sections; a 10-minute call with engineering upfront would have prevented this
- **Screenshot standard upfront** — significant time was spent on image extraction and re-extraction. Establish: mobile vs desktop, exact crop boundaries, and who provides screenshots before starting

## Key Product Gotchas for Future Reference

- SPLIT order cancellation immediately unblocks molecule capping — do not cancel before ready to recreate both orders
- Transfer CTA = patient is still on live call; do not coach doctor to disconnect
- `CONTROL_CATEGORY_SUBS_POSSIBLE` orders have a two-step post-confirmation flow (doctor → HA queue) — treat these differently in ops monitoring
- Doctor portal shows yellow background for HGS; white for standard — this is the primary visual signal in all training
- Amey Gavli (Mch/Urology, ID 13807) has no confirmed HGS category assignment — flag before any future doctor portal work

## Reusable Templates Created

- Doctor-facing SOP template (Section 3 workflow + CTA table + error section + scripts)
- Operations-facing SOP template (new column explanation + filter guide + manual assignment rules + doctor-error handling table)
