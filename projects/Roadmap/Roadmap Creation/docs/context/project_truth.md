# project_truth.md — Q2 Portals & Payments Roadmap

**Status:** LOCKED v1.0
**Last Updated:** 2026-07-11
**Change authority:** User only. Claude must not modify this file without explicit instruction.

Where this conflicts with `Claude_Context_Handoff_Q3_Roadmap.md` (an earlier handoff doc from a different thread), this file wins — that doc is kept as historical background only, not current truth.

---

## 1. What this project is

The Q2 (July–September) product roadmap for Apurva's charters: Portals (Doctor, HA, Assisted Commerce, CSR/Kapture) and Payments, at Truemeds.

This is a planning artifact, not a build project. The deliverable is a roadmap workbook (`Q2_Roadmap_Jul-Sep_v1.xlsx`) plus this supporting context.

---

## 2. Quarter naming

**[LOCKED]**

Q2 = July, August, September. Truemeds' fiscal year starts in April.

An earlier handoff doc (`Claude_Context_Handoff_Q3_Roadmap.md`) argued this horizon should be called "Q3," reasoning from a January-start fiscal year assumption. That assumption was wrong. Confirmed directly by Apurva on 2026-07-06.

---

## 3. Team capacity for Q2

**[LOCKED — reconfirm each quarter, do not carry forward]**

1 SPM (Apurva), 0 APM, 4 SDE2 + 2 SDE1 (6 engineers total).

This supersedes an earlier stale estimate in the handoff doc ("2–3 mostly-junior engineers"). Engineering throughput is higher than that estimate; there is no APM, so **SPM bandwidth — not engineering headcount — is the binding constraint** on how many concurrent initiative threads the roadmap can carry.

---

## 4. Roadmap structure

**[LOCKED]**

One hard gate (Compliance) + four outcome-led business bets + one non-negotiable carryover (Ring AI Pilot), tracked separately and not scored against the four bets.

| Bet (tag) | Primary Outcome Metric |
|---|---|
| Compliance (hard gate) | 100% auditable Doctor interactions; zero confirmed impersonation |
| OP → OD | Delivered orders ÷ total placed orders |
| CPO & Productivity | Operating cost per delivered order |
| Online Payments | Successfully prepaid orders ÷ payment-eligible orders |
| Trust & Retention | Repeat purchase / retention for eligible cohorts |
| Ring AI Pilot (carryover) | Human-agent conversion from Ring-qualified leads to placed orders |

Do not create a 5th "foundation" bet — foundation/baseline items sit under the bet they enable.

---

## 5. Baseline posture

**[LOCKED for Q2]**

This quarter's roadmap is intentionally raw. Most initiatives show "baseline to be established" rather than actual figures — that is expected, not a gap to hide or fake. Starting Q3, planning begins earlier with proper baseline metrics already in place.

---

## 6. Roadmap format

**[LOCKED]**

Filterable Excel, short tags, not narrative paragraphs.

Columns: `Bet` (short tag) | `Initiative` | `Output Metric` (specific to that initiative, 1–2 metrics, not the whole bet's list) | `Type` | `Q2 Role` | `Sept Decision` (Scale / Iterate / Stop / Take to Q3) | `Notes` (only when there's a real caveat).

`Q2 Role` values: **Discovery**, **Discovery + Delivery**, **Delivery** (renamed from "Build"), plus **Correctness** / **Fix** and **Pilot** for items that don't sit on the Discovery→Delivery spectrum.

No month-by-month (Jul/Aug/Sep) breakdown — decided too granular for this cut.

A separate **"Bet Definitions"** tab holds the one primary metric + one CXO-readable problem statement per bet, so neither is repeated on every initiative row.

---

## 7. Hard Gate: Compliance — Q2 scope decisions

**[LOCKED for Q2]**

- A new, dedicated Doctor Portal service/frontend, decoupled from the shared Pharmacist Portal, is the foundation every other Hard Gate item depends on landing first (targeted for July).
- Onboarding, auth, credentialing, and prescription document generation are in scope for Q2 Delivery.
- Multi-patient prescription capture is in scope for Q2 Delivery. Reference pattern: PharmEasy's DocStat RMP app "Add New Prescription" flow (see `docs/context/reference-material.md`).
- Case assignment & availability backbone is Delivery but capacity-conditional — first item to slip to Q3 if bandwidth is tight.
- **Doctor identity & anti-impersonation audit work is Discovery-only this quarter, not Delivery** — explicit user call. Interim mitigation: bind login sessions to one credentialed doctor as part of the auth work already being built (not a separate workstream).

---

## 8. What this project is NOT

- Not a PRD or spec — stays at roadmap altitude (initiative name, metric, type, timing, risk), not exact UX/design decisions
- Not a commitment to a full Doctor Portal rewrite, full CRM replacement, or full COD-fee rollout in Q2
- Does not silently invent baselines, capacity, or completion status

---

## 9. What must never be silently invented

- CPO official definition (Finance-owned — numerator, denominator, cost allocation)
- Current payment production rollout coverage %
- Scope of "100% Doctor audit coverage" (evidence/workflow coverage vs automated screening vs human review)
- Returns/refunds baseline figures (stated once — ~1,500 inbound calls/day, ~900 unique cases, ~400 app requests — needs revalidation before formal use)
- Doctor Portal classification/eligibility logic (case type, HA eligibility, Transfer vs Forward, Value vs Non-Value Meds, doctor assignment source) — this is owned by the `truemeds-doctor-portal-prototype` project's own `open_questions.md`, not this roadmap. Treat as **deferred here**, not resolved.

---

## 10. Reference material used

- `Claude_Context_Handoff_Q3_Roadmap.md` — original narrative handoff from an earlier thread. Superseded in part by this file; kept as historical background, not rewritten.
- `Claude_Raw_Initiative_Inventory.xlsx` — 113-row raw initiative brain-dump. Untouched historical reference; not a commitment list.
- `../../../../truemeds-doctor-portal-prototype/` project — working consultation-flow prototype plus its own `project_truth.md` / `open_questions.md`. Used to ground the Hard Gate section's real scope.
- Uploaded competitor walkthrough: "DocsStat App Basic Flow.docx" (PharmEasy's DocStat RMP app). Used as reference for onboarding-to-operations scope and the multi-patient capture pattern.
