# Open Questions — Type 1 Revamp

Consolidated 2026-10-09 from docs 00–05. Type: Product / Backend / UX / Data. When one is decided, move it to **Resolved** with the decision (don't delete).

## Allocation (W1b) — current focus
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
| EQ1 | Product | B-lite **Level 1 only**, or **Level 1 + 2**? | 04 §5 |
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

## Resolved
| ID | Question | Decision | Date |
|---|---|---|---|
| R1 | Which app is the pink-UI reference? | PlatinumRx; excluded from scope (D02) | 2026-10-05 |
| R2 | Pharmacist working hours | Assume 09:00–19:00 (D10) | 2026-10-09 |
| R3 | What does "Hold — not resolved by the admin" mean? | Call not connected → out of queue 1 h; Schedule = customer-requested delay (D11) | 2026-10-09 |
| R4 | W1 option A / B / C? | Superseded by no-app constraint → B-lite (D05, D06); level still open (EQ1) | 2026-10-08 |
