# Open Questions
This file is only for unresolved questions during the project.

## Rules
- Do not guess when product, backend, vendor, or data behavior is unclear
- Add the question here instead
- Keep each item short and specific
- Mark the type: Product, Backend, Vendor, or Data
- Mark the status: Open, Decided, or Parked
- When Decided, do not delete — move to Resolved with the final decision + reason

## Template
### [Open] [Type] Question title
- Context:
- Why it is unclear:
- Options considered:
- Current temporary handling:
- Final decision:

## Questions

### [Open] [Vendor] Failover model — Knowlarity primary vs OzoneTel-primary-with-fallback
- Context: OzoneTel is unreliable; Knowlarity is being evaluated as backup.
- Why it is unclear: Business/commercial call, not yet made.
- Options considered: (a) Knowlarity primary, OzoneTel dropped; (b) OzoneTel
  primary with automatic Knowlarity failover; (c) dual-vendor abstraction layer.
- Current temporary handling: Treat as evaluation only; no vendor locked.
- Final decision: —

### [Open] [Backend] Acceptable webhook latency threshold ("on time")
- Context: Transfer CTA needs leg-1, leg-2, call-duration signals in time.
- Why it is unclear: No SLA defined for max acceptable delay per signal.
- Options considered: —
- Current temporary handling: None; needs a defined threshold to measure Knowlarity against.
- Final decision: —

### [Open] [Vendor] Does Knowlarity's endpoint expose all three signals reliably?
- Context: Knowlarity provided a transfer URL similar to OzoneTel's.
- Why it is unclear: Not yet tested against their actual endpoint/docs.
- Options considered: —
- Current temporary handling: Assumed possible `[MOCK ASSUMPTION]`, to be verified.
- Final decision: —

### [Open] [Vendor] Retain OzoneTel as secondary or drop entirely?
- Context: OzoneTel claims fixes but issue recurs.
- Why it is unclear: Depends on Knowlarity eval outcome + commercials.
- Options considered: —
- Current temporary handling: Undecided; parked until eval done.
- Final decision: —

### [Open] [Data] Impact sizing — discard/completion delta and orders lost/month
- Context: Needed to size urgency and ROI of the backup build.
- Why it is unclear: Requires Analytics + Business data; explicitly NOT to be guessed.
- Options considered: —
- Current temporary handling: Tracked as owned TO-DO for Analytics + Business; excluded from eval go/no-go.
- Final decision: —

## Resolved
