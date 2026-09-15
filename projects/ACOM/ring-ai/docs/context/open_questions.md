# ACOM × Ring AI — Open Questions

Running register of unresolved decisions. Additive — don't silently resolve; move an item to
"Resolved" with a date when it's closed. Mirrors PRD §9 plus integration/pending items.
Last updated: 2026-09-15

## Open — business to decide
- [OPEN DECISION] **FTC targeting & eligibility strictness** — does the AI prioritise FTC, or do
  manual agents keep FTC while AI takes NFTC? And does the AI qualify only leads with
  patient + address (a strict gate that excludes most FTC)? **[Business]** *(may override the §5 default)*
- [OPEN DECISION] **Final priority ordering** — confirm Hot FTC > Hot NFTC > Warm FTC > Warm NFTC
  > manual queue > Cold. **[Business]**
- [OPEN DECISION] **Starting values** — retry gap, retry threshold, frequency cap, calling window,
  hot hold-time (suggested values in PRD §6 table; finalise before go-live). **[Business]**
- [OPEN DECISION] **First segment + volume** to start with. **[Business]**

## Open — vendor / telephony (gate build)
- [OPEN] **Verdict latency/reliability** — Ring indicated ~1 min; confirm in writing, close during
  integration, before go-live. **[Ring]**
- [OPEN] **Ring intent labels → Hot/Warm/Cold**, and can Ring return **do-not-call as an explicit
  label** (auto-capture vs inferred)? **[Ring + Engineering]**
- [OPEN] **Person who answers isn't the patient** — can the vendor pivot to the account holder?
  (we send both names). **[Ring + Business]**
- [OPEN] **Telephony specifics with Knowlarity** — WebSocket contract, "customer answered" event,
  UUID pass-through over the WS, and PII strip so only reference id + workspace id reach Ring.
  **[Knowlarity + Engineering]** *(pending the Knowlarity call)*
- [OPEN] **Consent/masking** of personal details spoken in the recording. **[Legal/Compliance + Ring]**

## Open — cross-team dependency
- [OPEN] **Shared cross-portal DNC list** — so a do-not-call captured here suppresses the customer
  across all Truemeds outbound calling (HA and the rest). **[Engineering + Business + Ring]**
- [OPEN DECISION] **How far to build the vendor layer now** — commit to vendor-agnostic design (§8);
  the full plug-and-play platform is an effort call (do now if the delta is small, else fast-follow).
  **[Engineering + Product]**

## Reviewer comments left to business (Confluence)
- #34 — What is the strength of the ACOM team? (anchored on "10,000")
- #35 — POC design / Hot-only? / criteria / captured in the BRD? (anchored on the 20% figure)
