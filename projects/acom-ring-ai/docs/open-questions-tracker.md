# ACOM 2.0 / Ring AI — Open Questions Tracker

*Companion to the PRD. Owners fill in Status (Open / In progress / Answered) and the Answer. Markers: [DISCOVERY] internal eng · [RINGG] vendor · [TELCO] Ozonetel · [OPS] Product/Ops. ★ = also an M1/M2 design prerequisite.*

## Engineering [DISCOVERY]

| # | Question | Status | Answer / Notes |
|---|----------|--------|----------------|
| E1 ★ | Source of truth + data model for dropped order / cart / customer / address / payment | Open | |
| E2 ★ | Is the dropped order an order, cart, or lead/session object? | Open | |
| E3 | Current assignment state model | Open | |
| E4 ★ | Why a new order ID is created in the assisted flow | Open | |
| E5 ★ | Existing linkage between dropped and final assisted order | Open | |
| E6 | How to lock bot-owned leads (atomic + timeout); block async during live transfer | Open | |
| E7 | How to fetch latest state within latency budget (incl. at screen-pop) | Open | |
| E8 | Where to store: vendor call ID, payload snapshot, raw webhook, normalized outcome, transfer events | Open | |
| E9 | How to reconcile missed/stuck bot or transfer events | Open | |
| E10 | How to detect cart/address/payment/order changes after handover (what to diff, when) | Open | |
| E11 | How to avoid duplicate calling between bot and humans | Open | |
| E12 | Screen-pop feasibility (caller number vs DID+number); tie-break if multiple active carts | Open | |
| E13 | Reference Doctor→HA transfer pattern? Minimum V1 for live transfer? Effort to add pre-transfer validation later | Open | |
| E14 | Can current reporting support the full bot + live-transfer funnel? | Open | |
| E15 | Which configuration controls are feasible in the first release | Open | |

## Ring AI [RINGG]

| # | Question | Status | Answer / Notes |
|---|----------|--------|----------------|
| R1 | Recommended production endpoint (v1 deprecated → pool-based v2?) | Open | |
| R2 | Required/optional payload fields; payload size limits | Open | |
| R3 | Webhook schema; which event is the terminal event to route on | Open | |
| R4 | Structured fields in webhook: intent, objection, callback time, confidence, summary? | Open | |
| R5 | Call retry and webhook retry behavior | Open | |
| R6 | Recording/transcript availability + expiry; stitchable across bot + HA legs? | Open | |
| R7 | Concurrency / rate-limit controls | Open | |
| R8 | Language support (Hindi/Hinglish/English; transliteration) | Open | |
| R9 | Live transfer: modes; transfer to Truemeds DID/queue; outbound from Truemeds DIDs; CLI seen by customer & HA; pre-transfer API/metadata; behavior on failure; transfer events; cost; number-pool/CLI rotation | Open | |
| R10 | Test/staging workspace support | Open | |

## Telephony / Ozonetel [TELCO]

| # | Question | Status | Answer / Notes |
|---|----------|--------|----------------|
| T1 | Create a dedicated Ring transfer DID/queue? | Open | |
| T2 | Show original customer number (CLI) to HA on transfer? | Open | |
| T3 | Pass call metadata to agent portal; identify source as "Ring AI transfer"? | Open | |
| T4 | Route Ring transfers only to selected HA/ACOM agents? | Open | |
| T5 | Expose HA availability / queue capacity to a service? | Open | |
| T6 | Log transfer initiated/connected/failed/dropped; record HA leg; stitch bot + HA recordings? | Open | |
| T7 | Monitor queue wait time and abandoned transfers; behavior if transfer DID busy / no agents? | Open | |

## Product / Ops [OPS]

| # | Question | Status | Answer / Notes |
|---|----------|--------|----------------|
| O1 | First POC eligibility segment; safe traffic % / concurrency | Open | |
| O2 | Live-transfer eligibility (Hot-only to start?); which HA queue; staffing hours; max acceptable wait | Open | |
| O3 | Bot script before transfer and on failure; callback SLA after failure | Open | |
| O4 | Hot-lead callback SLA; Cold/no-connect handling; customer frequency caps | Open | |
| O5 | Primary success metrics for live transfer; frustration/drop-off monitoring | Open | |
| O6 | Which outcomes suppress further calling; which return to manual; Ops vs Product approval matrix | Open | |
