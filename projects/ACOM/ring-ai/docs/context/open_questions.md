# ACOM × Ring AI — Open Questions

Running register of unresolved decisions. Additive — don't silently resolve; move an item to
"Resolved" with a date when it's closed. Mirrors PRD §9 plus integration/pending items.
Last updated: 2026-09-25

## Open — business to decide
- [OPEN DECISION] **FTC targeting & eligibility strictness** — does the AI prioritise FTC, or do
  manual agents keep FTC while AI takes NFTC? And does the AI qualify only leads with
  patient + address (a strict gate that excludes most FTC)? **[Business]** *(may override the §5 default)*
- [OPEN DECISION] **Final priority ordering** — confirm Hot FTC > Hot NFTC > Warm FTC > Warm NFTC
  > manual queue > Cold. **[Business]**
- [OPEN DECISION] **Starting values** — retry gap, frequency cap, calling window,
  hot hold-time (suggested values in PRD §6 table; finalise before go-live; retry threshold
  itself is now confirmed at 4 attempts — see Resolved below). **[Business]**
- [OPEN DECISION] **First segment + volume** to start with. **[Business]**

## Open — vendor / telephony (gate build)
- [OPEN] **Verdict latency/reliability** — Ring indicated ~1 min; confirm in writing, close during
  integration, before go-live. **[Ring]**
- [OPEN] **Ring intent labels → Hot/Warm/Cold**, and can Ring return **do-not-call as an explicit
  label** (auto-capture vs inferred)? **[Ring + Engineering]**
- [OPEN] **Telephony specifics with Knowlarity** — WebSocket contract, "customer answered" event,
  UUID pass-through over the WS, and PII strip so only reference id + workspace id reach Ring.
  **[Knowlarity + Engineering]** *(pending the Knowlarity call)*
- [OPEN] **Bot-leg failure error code** — Engineering to confirm the exact Knowlarity error code
  and handling for "customer connects, bot leg fails to connect" before go-live (PRD §12).
  **[Engineering]**
- [OPEN] **Consent/masking** of personal details spoken in the recording. **[Legal/Compliance + Ring]**

## Open — cross-team dependency
- [OPEN] **Shared cross-portal DNC list** — so a do-not-call captured here suppresses the customer
  across all Truemeds outbound calling (HA and the rest). **[Engineering + Business + Ring]**
- [OPEN DECISION] **How far to build the vendor layer now** — commit to vendor-agnostic design (§8);
  the full plug-and-play platform is an effort call (do now if the delta is small, else fast-follow).
  **[Engineering + Product]**

## Open — new reviewer comment (25 Sep, unanswered on Confluence)
- [OPEN] **SIP instead of WebSocket?** — a reviewer asked (25 Sep) why the design uses a WebSocket
  rather than SIP. PRD §13 already documents why (Knowlarity has no SIP connectivity; audio is a
  live two-way stream) — needs a reply posted on Confluence pointing to that, or a fuller answer
  if the reviewer is after something more. **[Product]**

## Comments answered in the doc but not yet closed with a reply (Confluence housekeeping)
Four review comments are substantively answered by current doc content but don't have a closing
reply posted yet — worth a batch of replies next time Confluence is touched:
- Callee/patient name — PRD §9 "we send the patient name; where not available, the customer name."
- "Telephony confirmed connect, Ring never returned a verdict" — covered in the §12 two-signal table.
- Bot-leg failure after the customer answered — covered in the §12 bot-leg-failure table.
- "How is Frequency cap different from Retry threshold?" — the §6 settings table row for
  Frequency cap now states the distinction explicitly.

## Resolved this cycle (25 Sep 2026)
- **ACOM team strength (#34)** and **POC design / criteria / BRD (#35)** — both answered by
  business on Confluence.
- **SKU-level pricing** — dropped from the doc per reviewer feedback (not something the PRD needed
  to specify).
- **`discount_amount` + `discount_percent` fields** — resolved with the reviewer.
- **Patient name vs customer name** — if the person who answers isn't the patient, we send the
  patient name; where not available, the customer name (was previously an open question about
  whether the vendor could "pivot" mid-call — simplified to this instead).
- **Retry threshold** — confirmed at 4 attempts (was a working placeholder of ~3), within
  TRAI/DND limits.
- **Human-assigned lead never goes to the bot** — new locked rule, scoped to that lead only; a new
  cart/order creates a fresh lead, evaluated fresh (PRD §9, added 25 Sep).
- **Retry-exhausted closure is permanent** — new locked rule; a closed lead is never reopened or
  rechecked, only a new cart/order re-enters (PRD §6, added 25 Sep).
