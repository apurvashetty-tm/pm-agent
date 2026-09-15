---
name: 2026-09-09-ring-ai-fresh-platform-prd
description: Scope change on ACOM × Ring AI — Truemeds integrates Ring (not vice-versa), no PII to Ring, Truemeds owns telephony (Knowlarity) + retries; a fresh product-focused platform PRD ("AI-led Lead Qualification") replaces the earlier Rapid Pilot / future-state framing.
metadata:
  type: decision
  domain: acom
  status: superseded-by-2026-09-11-call-architecture
---

# ACOM × Ring AI — fresh platform PRD + integration scope change

> **Superseded in part → `2026-09-11-ring-ai-call-architecture.md`.** The scope change below still holds (Truemeds integrates Ring, no phone/address PII, Truemeds owns telephony + retries). But the **media-bridge** mechanic recorded here ("Ring returns a per-lead media stream URL; Knowlarity bridges that stream", and "we send the recording to Ring") was replaced on 11 Sep by a **WebSocket** model: Knowlarity opens a WebSocket to Ring carrying the reference id, the bot starts on a "customer answered" event, Ring records its own side and returns the verdict by webhook, and Truemeds keeps its **own** recording + event log for RCA (not sent to Ring). The **name** is sent to Ring (the one field), not "no PII". Read the 11-Sep decision for the current flow.

**Decision.** Replace the earlier ACOM × Ring AI framing (the Rapid Pilot bolt-on and the future-state voicebot design) with a single fresh, product-focused **platform** PRD — "AI-led Lead Qualification" (`projects/Acom/ring-ai/docs/ai-led-lead-qualification-prd.md`; Confluence PROD page 2023260174). Written PM-first: lean, product-focused, not a technical spec.

**Why (what changed).**
- Ring will **not** integrate Truemeds' APIs — **Truemeds integrates Ring**.
- **No PII** (phone number, possibly address) may be sent to Ring.
- Therefore **Truemeds owns the whole call via Knowlarity** (dial, retries, calling window, hangup); Ring is the live conversation + the post-call verdict, never the caller.
- Knowlarity provided two docs now central to the design: the **Notifications / Streaming API** (call events + recording URL at hangup) and the **Hangup Causes** (Q.850 / SIP cause codes, with retry-case sets) — the latter drives Truemeds-owned retry policy.

**Key positions in the PRD.**
- **Media bridge:** Ring returns a per-lead media stream URL; Knowlarity dials the customer and bridges that stream (feasibility is an open question to both vendors).
- **Correlation key = a generic Truemeds `uuid`, not `order_id`** — so the platform extends beyond dropped carts (Rx-uploaded-no-order, registered-no-PDP, PDP-no-ATC, future cart-id world).
- **Eligibility (today patient + address) and Ring dial-order (FTC-first) are configurable and Truemeds-owned; the manual queue's prioritisation score is NOT touched** — Hot/Warm ride as a tier in front of it. Richer scoring for no-cart use cases is parked as an analytics annexure.
- **Full lead journey owned:** retries off the telephony disposition (3 buckets: transient/network → quick retry; busy/no-answer/switched-off → retry later; bad number → stop + flag); one unified Hold/Schedule "come back at time T" state carrying who resumes it; closed leads never re-enter; DNC firm across the AI + human channels (cross-portal via a shared list = a dependency); a per-customer frequency cap; throttle + instant kill-switch. Async callback is the model; live transfer is future-state.

**Impact / ownership.** Product owns eligibility/segment/dial-order, scripts, SLAs, rollout; Engineering owns the integration, telephony build, and retry mechanics; Ring owns the bot + verdict; Knowlarity owns telephony. Open questions (PRD §9) gate build — media-bridge feasibility, recording→Ring channel, verdict latency, language support, consent/masking of recorded PII, a shared cross-portal DNC list, the first segment + volume, and whether the AI or manual agents target FTC.

**Status.** PRD is Draft v2, in review. Superseded framing kept as historical context: `rapid-pilot-prd.md`, `voicebot-cart-recovery-prd.md`, `mvp-engineering-walkthrough.md` (see `DESIGN_JOURNAL.md`, Phase 3).
