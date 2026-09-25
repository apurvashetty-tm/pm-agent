# ACOM × Ring AI — Project Truth

Status: Working product truth. Not a PRD.
Last updated: 2026-09-25

The durable, locked layer for the AI-led Lead Qualification build. The full spec is
`docs/ai-led-lead-qualification-prd.md` (Confluence PROD page 2023260174); this file
holds only what is settled and load-bearing. Anything still open lives in
`open_questions.md`; history/why lives in `DESIGN_JOURNAL.md`.

## 1. Purpose

AI voice pre-qualification for top-of-funnel recovery at Truemeds. An AI voice agent
(Ring AI) calls a customer about their pending cart, holds a real conversation, and
returns an intent read; interested customers are handed to a human agent who places the
order. Dropped carts are use case #1; the same pipeline is built to extend to other
drop-offs. Ring AI = the voice-AI vendor; Knowlarity = the telephony provider.

## 2. Canonical terms

```text
Reference id (uuid) = Truemeds-generated generic correlation key sent to the vendor
                      (NOT the order number); rides in the "remark" field
Verdict             = the vendor's post-call intent read: Hot / Warm / Cold / don't-call
In-flight lead      = a lead in any non-terminal disposition; one per customer at a time
Retry threshold     = max not-connected attempts before a lead is Closed (confirmed: 4,
                      within TRAI/DND limits)
Frequency cap       = max CONNECTED calls to a customer (AI + human) in a rolling window —
                      distinct from Retry threshold, which counts not-connected attempts
Contact PII         = phone number, address — never sent to the vendor (the name IS sent;
                      patient name preferred, customer name as fallback)
```

## 3. Locked principles [LOCKED]

- **Truemeds integrates Ring; Ring does not integrate Truemeds.**
- **Truemeds owns the whole call via Knowlarity** — dial, connect, retries, calling
  window, hangup. The vendor is the conversation + the verdict, never the caller.
- **No contact PII to the vendor** — no phone number or address. The customer's **name
  is sent** (the bot needs it to address them); nothing else identifying.
- **Correlation key is a generic reference id (uuid), not the order number** — so the
  platform extends beyond dropped carts.
- **One customer, one channel at a time; one in-flight lead at a time.** The AI and a
  human never call the same customer at once.
- **Truemeds data is the source of truth.** What we send the vendor is a call-time
  snapshot; the **live cart is re-read** before an agent acts and before an order is placed.
- **The manual queue's prioritisation score is NOT touched.** Qualified Hot/Warm ride as
  a new priority tier in front of it; the underlying score is untouched.
- **A closed lead never re-enters any queue.**
- **🆕 Added 25 Sep — Once a human agent is assigned to a lead, that lead is never
  assigned to the bot.** Scoped to that lead only — a new cart or order creates a fresh
  lead with its own reference id, evaluated fresh.
- **🆕 Added 25 Sep — Retry-exhausted closure is permanent for that lead.** We don't
  reopen or recheck it later; the only way the customer re-enters is a new cart or order
  creating a fresh lead. Nothing resurrects a closed one.

## 4. Call architecture [LOCKED — Ring call, 2026-09-11]

Confirmed with Ring on 2026-09-11; supersedes the earlier "media-bridge" assumption
(decision 2026-09-09). See `knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`.

- **Pre-load:** Truemeds sends each lead to Ring in batch — reference id + cart / custom
  variables + workspace id, **no PII**. Ring stores it, ready to match.
- **Dial + connect:** Truemeds dials the customer via Knowlarity (mobile + reference id).
  On the same call, **Knowlarity opens a WebSocket to Ring** carrying the reference id;
  Ring warms up the bot (does not speak yet).
- **Bot start:** on a **"customer answered" event**, the bot begins; it streams over that
  WebSocket. (Why WebSocket: Knowlarity has no SIP; audio is a live two-way stream; Ring
  already runs this WS path with Knowlarity in production. A reviewer asked 25 Sep why
  not SIP — see `open_questions.md`, not yet replied.)
- **Verdict:** Ring records the bot–customer leg **on its own side** and returns
  Hot / Warm / Cold (/ don't-call) by webhook on the reference id.
- **Recording & events, our side:** Truemeds stores its **own copy of the recording**
  (from Knowlarity) + an **event log** (dialled / answered / hung-up / verdict) for audit
  and RCA. **We do NOT send a recording to Ring.** This is forensics — it does not fix
  telephony reliability.
- **Retries are Truemeds/Knowlarity's; Ring does none.**
- **Vendor-agnostic by design:** the vendor sits behind a generic role with standard
  mapping contracts; a telephony/vendor swap is a **re-integration, not a rebuild**. A
  full plug-and-play platform is out of scope (effort-gated — see open questions).

## 5. Priority order [LOCKED shape · values business-to-confirm]

Agents work leads in this order:

```text
Hot FTC  >  Hot NFTC  >  Warm FTC  >  Warm NFTC  >  normal manual queue  >  Cold
```

- **Cold is the lowest priority — still callable**, not dropped. A Cold verdict
  deprioritises a lead; it does not set it aside.
- **Only do-not-call and invalid/wrong numbers are truly excluded.**
- The final ordering is business's to confirm (`open_questions.md`). This is distinct
  from the FTC-eligibility-gate question (§8 below / PRD §9), which is still genuinely
  open — the tier ordering being stated here doesn't resolve who the AI is allowed to call.

## 6. The lead journey [LOCKED]

- **Retries are ours, driven by the telephony disposition** (the AI can't hear a call
  that never connected). Single retry rule / one gap; stop at the retry threshold
  (**confirmed: 4 attempts**), then close — permanently (see §3). Not-connected reasons
  come from Knowlarity's hangup-cause list.
- **One waiting state** ("come back at time T") underneath Hold and Schedule, each lead
  tagged with who resumes it (AI or human; named-time callback defaults to the same agent,
  else the queue).
- **Do-not-call** is captured **two ways** — (1) an AI call: Ring returns the opt-out on
  its post-call read; (2) a human call: agent one-click CTA — and applied from the next
  call onward. It permanently stops the AI + all our human calling. Extending suppression
  across other portals (HA, etc.) needs a shared do-not-call list — an open dependency.
- **Frequency cap** = connected-call cap across AI + human, distinct from the retry
  threshold; enforceable only on our side.
- **Controls:** throttle (rollout dial) + instant kill-switch, both global and per
  use-case. The manual flow always runs underneath as the fallback.
- **A human-assigned lead is never assigned to the bot** and **a retry-exhausted closure
  is permanent for that lead** — see the two 🆕 locked principles in §3.

## 7. Settings ownership [LOCKED]

All operational values (eligibility set, dial-order, retry gap/threshold, frequency cap,
calling window, hot hold-time, callback routing, throttle, kill-switch) are **backend
config, never hardcoded** — Product proposes, business sets, within TRAI/DND limits. End
state is a small self-serve tool. Starting values are suggested in the PRD §6 table and
are **business to finalise before go-live** (`open_questions.md`); the retry threshold
itself is no longer a starting value — it's confirmed at 4.

## 8. Working defaults (not yet locked) [RECOMMENDED]

- Eligibility today: **patient name + address on file** (configurable set).
- Dial-order today: **FTC first, then NFTC** (an ordering, not an exclusion).
- These are starting assumptions so engineering can build; business may override — the
  FTC-targeting and eligibility-strictness call is the top `[OPEN DECISION]`.

## 9. What is NOT decided here

Open items live in `open_questions.md` (mirrors PRD §9): FTC targeting & eligibility
strictness, final priority ordering, starting values (retry gap, frequency cap, calling
window, hot hold-time), verdict latency/reliability (to be confirmed with Ring in
writing), consent/masking of recorded PII + PII-stripping on the "answered" event, the
bot-leg-failure error code (Engineering + Knowlarity), a shared cross-portal DNC list,
first segment + volume, Ring's intent labels → Hot/Warm/Cold (and DNC as an explicit
label), how far to build the vendor layer now, and a new (25 Sep, unanswered) reviewer
question on SIP vs WebSocket. Telephony specifics are **pending confirmation with
Knowlarity**.

## 10. Sources

- Current spec: `docs/ai-led-lead-qualification-prd.md` (Confluence PROD 2023260174),
  kept in sync with the live page — last synced 25 Sep 2026.
- Architecture decision: `knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`.
- 25 Sep decisions (retry threshold, the two new locked rules):
  `knowledge/decisions/2026-09-25-ring-ai-prd-clarifications.md`.
- History / why: `DESIGN_JOURNAL.md`. Earlier (historical) docs: `rapid-pilot-prd.md`,
  `voicebot-cart-recovery-prd.md`, `mvp-engineering-walkthrough.md`.
- Reviewer comments state: `reference/prd-review-comments-snapshot.md`.
