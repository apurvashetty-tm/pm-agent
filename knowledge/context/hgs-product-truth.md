# Product Truth — High Governance Salts (HGS) Phase 1

> This file captures confirmed, locked product behaviour from Phase 1 build and UAT.
> Use this as ground truth for any future HGS-related work.

**Project:** HGS Phase 1 (NFS Categories Relaunch)
**Go-live:** June 2026
**Source:** PRD, UAT sign-off session, doctor portal UAT, SOP drafting

---

## Core Concept

High Governance Salts (HGS) are medicines requiring specialist doctor consultation due to misuse risk or harm potential. Previously classified as Not-for-Sale (NFS). Phase 1 makes them available through a specialist consultation flow only.

## Salt Categories

| Category | Key Salts | Doctor Type |
|---|---|---|
| Category 1 (Good_MBBS) | Pregabalin, Sildenafil and combinations | MBBS / General Physician |
| Category 2 (IM) | Semaglutide (Rybelsus), GLP-1 injectables, Tirzepatide | MD / General Medicine |
| Category P | All non-HG salts | Standard flow — unaffected |

## Order Categories (new in Phase 1)

| Value | Meaning |
|---|---|
| `CONTROL_CATEGORY_SUBS_NOT_POSSIBLE` | HG order, no substitute → doctor confirms → direct fulfilment |
| `CONTROL_CATEGORY_SUBS_POSSIBLE` | HG order, substitute exists → doctor confirms → HA call queue (Partially Digitised, high priority) |
| `SPLIT_ORDER` | Two specialist categories in one order → Super Doctor only, never auto-assigned |

## Portal Changes (Phase 1 only)

- **New column added:** `High Governance Order Tag` in Super Doctor portal order table
- **Tags:** `Good_MBBS`, `IM`, `SPLIT_ORDER`, `NA` (non-HG)
- **Order Category column:** pre-existing, two new values added (above)

## Locked Behaviour

- Yellow background on doctor portal = HGS order. White = standard order.
- Diagnosis field: mandatory for all HGS orders
- Doctor Notes field: mandatory, must be professional clinical language, appears verbatim on DRX
- ETA: +4 working hours flat from order placement for all HGS orders
- Medicines are non-returnable
- All prescribing, diagnosis, and notes happen DURING the live call — not after
- End-of-call CTA: `Confirm Order` (call ended) / `Transfer` (patient still live, stays on call) / `Forward` (HA calls back separately)
- Doctor assignment is FIFO — oldest eligible order first
- 4-minute window: if no call attempt within 4 minutes of assignment, order auto-returns to pool
- SPLIT order cancellation immediately releases molecule capping for the customer

## Doctor Roster (Phase 1)

- **Category 1 (Good_MBBS):** 14 MBBS doctors — see SOP-HGS-Ops-001
- **Category 2 (IM):** 5 MD doctors — see SOP-HGS-Ops-001
- **Unresolved:** Amey Gavli (Mch/Urology, ID 13807) — category not confirmed

## What Phase 1 Does NOT Include

- Pharmacist layer for uploaded-Rx orders
- Multiple prescriptions per order
- Customer Rx upload digitization
- Doctor consultation charges
- Address/identity intelligence checks (Phase 3)
- Valuemeds substitution flow for HGS orders
