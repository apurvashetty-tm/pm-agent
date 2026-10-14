> **2026-10-12:** OMS closed as PRD v0.1. Its live open items are E1–E4 and P1–P5 in `10-oms-prd.md` §8; PV/MQ/OQ rows below are history unless repeated there.

# Open Questions — Type 1 Revamp

Consolidated 2026-10-09 from docs 00–05. Type: Product / Backend / UX / Data. When one is decided, move it to **Resolved** with the decision (don't delete).

## Pending Verification state (W1a, current focus) — see `07` §6
| ID | Type | Question | Source |
|---|---|---|---|
| PV1 | Product | ~~Name~~ → `RX VERIFICATION PENDING` (D17) | 07 §7 |
| PV2 | Product | ~~Storage~~ → both horizons (D18): Now = state on order row; Future = Type 1 lead | 07 §8 |
| PV3 | Product | ~~Arm B?~~ → yes (D19). Open: incentive/attribution model (07 §9.2) | 07 §9 |
| PV4 | Product | v1 enhancement set (07 §4) | 07 §4 |
| PV5 | Product | ~~Abandon rule~~ → configurable (D21); default values to confirm (07 §11) | 07 §11 |
| PV6 | Product | ~~After-hours?~~ → yes (D22) | 07 §12 |
| PV7 | — | ~~Incentive structure~~ out of scope (D25) | 07 §9.2 |
| PV8 | — | ~~Arm B attribution/incentive~~ out of scope (D25); callout only | 08 §7 |
| PV9 | Product | Can an ACOM agent change medicines on a Type 1 cart, or only qty/remove? | 07 §10 |
| PV10 | Product | Confirm abandon-rule defaults (3 attempts, 24 working h, 2 h checkout window) | 07 §11 |

## Abandoned Type 1 → ACOM (incl. mid-flow) — see `08` §8
| ID | Type | Question | Source |
|---|---|---|---|
| MQ1 | Backend | ~~What's stored at upload~~ → framed as requirements REQ-L1–L7 (D30); engineering to answer | 08 §10 |
| MQ2 | Product | ~~Nudge vs call~~ → call regardless; nudge in comms track (D28) | 08 §9 |
| MQ3 | Product | ~~Trigger~~ → 30 min, configurable (D29) | 08 §9 |
| MQ4 | Product | Type 1 priority for Rx-only leads: **TBD brainstorm**; for now ACOM logic minus value filter (D29). Ranking-score default for zero-value leads (REQ-Q3) | 08 §10.2 |
| MQ5 | Data | Can we track the abandon step (M1/M2/M3) without an app release? | 08 §3 |
| MQ6 | Data | ~~55K = this population?~~ → yes (D31) | 08 §9 |
| MQ7 | Product | **ACOM agent creates the order from an Rx over the call** (Swapnil's lean): tooling, Rx validation route, agent skill guardrail | 08 §10.3 |
| VQ1 | Product | Treat V (never verified) as the first slice of W1b allocation? | 08 §11 |
| VQ2 | Product | Verification SLA value (default 2 working hours) | 08 §11 |
| VQ3 | Product | Pick from V1–V7 (lean V1+V3+V2+V6) | 08 §11 |
| RQ1 | Product | APP-1 CTA wording (lean "Send to pharmacist") | 09 §3 |
| RQ2 | Product | Confirm the Now / Later split of portal changes | 09 §2 |

## OMS: request state + experiment + abandoned leads (W1a) — see `06` §7
| ID | Type | Question | Source |
|---|---|---|---|
| OQ1 | Product | ~~P1 vs P2~~ direction set by D16 (pharmacist creates the order); storage now PV2 | 06 §3 |
| OQ2 | Backend | Can a portal-created incomplete cart (49/400) be checked out in the app today with no release? (Arm B depends on it) | 06 §4 |
| OQ3 | Product | Arm B: send the cart without a call (B1) or after a short call (B2)? | 06 §4 |
| OQ4 | Product | Arm B fallback: one pharmacist call, then ACOM? Timeout X hours? | 06 §4 |
| OQ5 | Product | Arm A abandonment trigger (holds / attempts / hours)? | 06 §5 |
| OQ6 | Product | Type 1 cart leads: ACOM ₹900 threshold or Type 1-specific? | 06 §5.2 |
| OQ7 | Product | Rx-only leads: R1 (digitise first) + R2 (ACOM qualifies → Rank-Up to pharmacist)? | 06 §5.3 |
| OQ8 | Product | Abandoned request = sales lead (DNC applies)? | 06 §5.2 |
| OQ9 | Product | Conflict with an existing open cart-abandon lead for the same customer? | 06 §5.2 |
| OQ10 | Data | OP restated, or target moved to Request → OD? (with EQ7) | 06 §6 |

## Allocation (W1b)
| ID | Type | Question | Source |
|---|---|---|---|
| AQ1 | Backend | Is the Type 1 queue **pure LIFO**, or is there any time-of-day/backlog rule in the backend? | 05 §5 |
| AQ2 | Data | Pharmacist **headcount by hour** (hours assumed 09:00–19:00). | 05 §5 |
| AQ3 | Backend | Is there a **cap** on how many times an order can go on Hold? | 05 §5 |
| AQ4 | Backend | Does a held/scheduled order re-enter at the **top** (LIFO) or at its original position? | 05 §5 |
| AQ5 | Backend | Does Rank-Up (235/613) work on **undigitised** Type 1 orders? | 05 §5 |
| AQ6 | Data | Uploads by hour; time to first pharmacist call by upload hour; outcome by wait time; Hold/Schedule frequency and outcomes. | 05 §3 |

## Engagement: order → request (W1a)
| ID | Type | Question | Source |
|---|---|---|---|
| EQ1 | Product | ~~B-lite level~~ superseded by D15 (request state + experiment) | 04 §5 |
| EQ2 | Backend | Which app texts are **server-driven** (tracker steps, status names, "Order placed" title)? | 04 §5 |
| EQ3 | Backend | Does our WhatsApp provider support **interactive reply buttons**? | 04 §5 |
| EQ4 | Product | Approval **timeout** before falling back to the pharmacist call (suggested 1–2 working hours). | 04 §5 |
| EQ5 | Product | Customer approval **before** the doctor call? (recommended yes) | 04 §5 |
| EQ6 | Product | Ask upfront intent at submit ("order everything" vs "call me first")? (needs app → likely parked) | 04 §5 |
| EQ7 | Data | Will Analytics accept "Type 1 OP = customer-approved or pharmacist-confirmed"? How do targets restate if Rx upload stops counting as OP? | 04 §5, 00 |
| EQ8 | Product | Is **pay after packing** a locked constraint? | 01 Q3 |

## Portal (W2)
| ID | Type | Question | Source |
|---|---|---|---|
| PQ1 | Backend | Is v4.8.8 what agents use live? Verify P5 (search uses warehouse 20 vs order's 14) and P19 (Patient Call crash). | 03 §7 |
| PQ2 | Product | Is the dormant "incomplete order" flow (`confirmOrderFromIncompleteState`) the current cart-abandonment lead flow in ACOM? | 03 §7 |
| PQ3 | Backend | Does `SKU_SEARCH` filter out unavailable SKUs server-side? Who owns the Elastic query? | 03 §7 |
| PQ4 | Backend | Can the portal trigger an app push / WhatsApp with a cart link today? | 03 §7 |
| PQ5 | Product | Should **Create Order** also become request → customer confirms? | 03 §7 |
| PQ6 | Product | Is push-based pharmacist allocation in our scope or Apurva's Portal Unification track? | 03 §7 |
| PQ7 | Product | Abandoned-Rx **lead rules** (no cart value): eligibility/priority signal; to ACOM agents or Type 1 pharmacists? DNC applies? | 03 §6–7 |
| PQ8 | Product | Build portal fixes as **shared components** (Portal Unification) or Type 1-only patches first? | 03 §7 |

## Business case
| ID | Type | Question | Source |
|---|---|---|---|
| BQ1 | Data | +2.5K of the +12.5K OP target isn't attributed to a lever. | 00 |
| BQ2 | Data | Type 1 OP outcome split: delivered / discarded (reason) / unreachable / cancelled (reason) / OOS. | 00 |
| BQ3 | Data | "OOS-impacted" = any line OOS or whole order? Share with an available substitute? | 00 |
| BQ4 | Data | What exactly are the "55K stagnant opportunities"? | 00 |
| BQ5 | Product | Scope: app only, or web/m-site too? | 01 Q4 |

## Main doc `13` Part A (OMS), 2026-10-13
| ID | Type | Question | Source |
|---|---|---|---|
| E3 | Backend | Which app status texts are sent by the backend vs written into the app? | 13 A |
| E4 | Backend | Neutral ranking default for Rx-only ACOM leads | 13 A |
| A-Q3 | Product | Call-result reason list (Swapnil + Pharmacy ops) | 13 A4 |
| A-Q4 | Product | Removal state final name (lean `CLOSED - NOT ACTIONABLE`); skips ACOM ✅ D51 | 13 A4 |
| A-Q6 | Product | Flow 1 (no call) when the customer already has a cart | 13 A1a |
| A-Q7 | Product/Compliance | "Asked not to call" also blocks the ACOM lead? | 13 A4 |

## PRD v1.0 review (Apurva, 2026-10-14) — pending Swapnil's go-ahead
| ID | Type | Question / change | Source |
|---|---|---|---|
| RV1 | Product | Limit ACOM to uploads never sent for verification; after submission everything closes with a reason (reverses D20/D26/D62 parts) | Comments 1, 3, 4 |
| RV2 | Product | Rebuild the PRD around user stories (customer, pharmacist, ACOM agent); move detail to an annexure | Comment 2 |
| RV3 | Product | Treat Rx + cart-items uploads (Type 2) in the same flow | Comment 11 |
| RV4 | Product | Reason table: declined reasons → Closed with reason, not ACOM lead | Swapnil + comment 4 |
| RV5 | Edit | CTA creates the request, not the upload; P1 adds "customers think we have everything"; remove OP GMV; specific metrics; rename OMS requirements; expected-call-time display; substitutes for in-stock medicines priced against the selected original | Comments 5–10, 12 |

## Resolved
| ID | Question | Decision | Date |
|---|---|---|---|
| R1 | Which app is the pink-UI reference? | PlatinumRx; excluded from scope (D02) | 2026-10-05 |
| R2 | Pharmacist working hours | Assume 09:00–19:00 (D10) | 2026-10-09 |
| R3 | What does "Hold — not resolved by the admin" mean? | Call not connected → out of queue 1 h; Schedule = customer-requested delay (D11) | 2026-10-09 |
| R5 | E1 portal cart → app cart with no release? | Yes, already works; draft + "Create cart" (D44) | 2026-10-13 |
| R6 | E2 Rx uploaded not submitted | Same as today's abandoned cart (D45) | 2026-10-13 |
| R7 | Who picks the flow / cart state name / unusable upload / keep status name | Experiment (D47) / `CART CREATED`, "Create cart"/"Create order" (D46) / call or remove (D48) / yes (D49) | 2026-10-13 |
| R8 | A-Q5 existing customer cart | Show it to the pharmacist, edit on the call, customer confirms (D52) | 2026-10-13 |
| R4 | W1 option A / B / C? | Superseded by no-app constraint → B-lite (D05, D06); level still open (EQ1) | 2026-10-08 |
