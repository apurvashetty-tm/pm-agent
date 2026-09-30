# ACOM × Ring AI — Open Questions

Running register of unresolved decisions. Additive — don't silently resolve; move an item to
"Resolved" with a date when it's closed. Mirrors PRD §9 plus integration/pending items.
Last updated: 2026-09-30

**None of the open items blocks the build** (PRD §9, 30 Sep).

## Open — go-live checks
- [OPEN] **Verdict and call-outcome SLA** — how quickly and reliably the verdict (Ring) and the
  call outcome (Knowlarity) come back; Ring has indicated ~within a minute. Business sets the
  SLA, and the share of calls it must cover, in the Ring and Knowlarity contracts. The tech-pilot
  gate (PRD §14) checks against it. **[Business + Ring + Knowlarity]**
- [OPEN] **Languages** — which the conversation handles well (Hindi, Hinglish, English). **[Ring]**
- [OPEN] **Do-not-call as a label** — can Ring return a do-not-call as its own label so an opt-out
  heard on an AI call is captured automatically? Not yet discussed; until then agents' one-click
  do-not-call covers human calls. **[Ring + Engineering]**
- [OPEN] **Calls at the same time** — AI calls must stay within Ring's and Knowlarity's limits on
  simultaneous calls. **[Engineering + Ring + Knowlarity]**

## Open — call-out to InfoSec
- [OPEN] **Spoken PII + the "answered" event** — consent/masking for personal details a customer
  says aloud in the recording; and the "customer answered" event carries the customer number
  today — it must be stripped so only the reference id + workspace id reach Ring. **[InfoSec +
  Knowlarity + Ring]**

## Open — integration pending (not in PRD §9)
- [OPEN] **Telephony specifics with Knowlarity** — WebSocket contract, "customer answered" event,
  reference-id pass-through. **[Knowlarity + Engineering]**
- [OPEN] **Bot-leg failure error code** — exact Knowlarity error and handling for "customer
  connects, bot leg fails" (PRD §12). **[Engineering]**
- [OPEN] **Analytics baselines** — today's AOV of converted ACOM orders and ACOM sales/day, needed
  for the §10 metrics and §14 gates. **[Analytics]**

## Later (not this build)
- [LATER] **Leads without patient + address** — V1 keeps the gate; relaxing it (e.g. FTC with name
  only) or dropping it for future use cases is a later decision. **[Business]**
- [LATER] **Cross-portal do-not-call** — a shared suppression list every calling portal honours.
  **[Engineering + Business + Ring]**

## Confluence housekeeping (as of 30 Sep)
58 unresolved threads on the page, 0 dangling. Many already have replies but aren't resolved.
Threads answered by the current doc that still need a closing reply and resolve:
- The §4 "what we send" thread: data points listed; SKU pricing dropped; discount_percent added;
  name = patient name else customer name; items in Ring's variable format.
- "Send address — the bot is built around these variables" (23 Sep): the PRD keeps **no address to
  the vendor** — reply with that.
- "Set to 48 hours" on the hold-time (29 Sep): Product keeps **24 h** — reply with that.
- "+ order_value 500" on the eligibility row (29 Sep): done.
- "These are togglable, finalise at go-live" (24 Sep): values set; config, tunable at go-live.
- SIP vs WebSocket (25 Sep): PRD §13 explains — Knowlarity has no SIP; the audio is a live stream.
- Older answered-in-doc threads: output the AI returns, verdict turnaround (now the SLA item),
  dispositions/tracking (§6 table), "more calls per customer / handover" (frequency cap + live
  transfer), frequency cap vs retry threshold, "telephony connected, no verdict" (§12 table).
- 30 Sep review requests (@Kartik A: §5 Hot/Warm 24 h rule, FTC share, §6 closure, pause rule,
  §14 GTM; @Jatin Khatri: §10 metrics, pause rule) — awaiting their review.

## Resolved (30 Sep 2026)
- **FTC targeting** — the AI uses today's queue logic as is (`final_score`), which already
  prioritises FTC; no separate FTC rule or threshold.
- **Lead floor** — single minimum AOV of ₹500 for the AI and the manual queue (was ₹900).
- **Final priority order** — Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold.
- **Setting values** — final (PRD §6 table); config, tunable at go-live.
- **Hot/Warm hold-time** — 24 h from the verdict (reviewer's 48 h not taken).
- **First segment + volume** — answered by the GTM plan (PRD §14): ₹900+ first, customer-ID split
  5% → 25% → 50% → 100%, then the ₹500 step.
- **How far to build the vendor layer** — dropped: single vendor + single telephony provider;
  "vendor-agnostic by design" struck from scope.
- **Throttle** — replaced by the pause rule (day to day) and the GTM split (rollout).
- **Ring labels** — Ring returns Hot / Warm / Cold (do-not-call as a label stays open above).
- **Data sent to Ring** — reference id, cart items + quantities, order-level pricing incl.
  discount %, delivery ETA, patient (else customer) name; no phone, address or SKU pricing.

## Resolved (25 Sep 2026)
- ACOM team strength (#34) and POC design / criteria / BRD (#35) — answered by business.
- SKU-level pricing dropped; `discount_amount` + `discount_percent` fields resolved.
- Patient name vs customer name — patient name; where not available, the customer name.
- Retry threshold confirmed at 4 attempts, within TRAI/DND.
- Human-assigned lead never goes to the bot (PRD §9).
- Retry-exhausted closure is permanent (PRD §6).
