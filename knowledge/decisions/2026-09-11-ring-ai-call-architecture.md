---
name: 2026-09-11-ring-ai-call-architecture
description: Locked call architecture for ACOM × Ring AI after the 11 Sep Ring call — WebSocket handoff (not a media bridge), reference-id correlation, name-only PII, Ring returns Hot/Warm/Cold(/don't-call) by webhook, Truemeds keeps its own recording + event log for RCA. Read for how a call actually flows end to end.
metadata:
  type: decision
  domain: acom
  status: locked
  supersedes: 2026-09-09-ring-ai-fresh-platform-prd (media-bridge mechanic only)
---

# ACOM × Ring AI — call architecture locked (11 Sep call with Ring)

**Decision.** The end-to-end call mechanic is locked. It replaces the earlier "media stream URL / bridge" idea from the 9-Sep scope note. The 9-Sep scope change itself (Truemeds integrates Ring, Truemeds owns telephony + retries, generic `uuid`/reference-id correlation, configurable eligibility + dial-order, full lead journey owned, async callback) still stands — only the *how the audio and verdict move* part changed.

**The flow (locked):**
1. **Pre-load the lead into Ring.** Truemeds sends Ring a reference id / uuid plus cart + custom variables plus the workspace id. **No phone number, no address.** The customer **name** is sent — it is the one PII field Ring gets, because the bot needs it to open and personalise the call.
2. **Knowlarity dials and opens a WebSocket to Ring** carrying the reference id. The WebSocket is the audio path — there is **no separate media-stream-URL bridge**.
3. **"Customer answered" event starts the bot.** The conversation runs over the WebSocket; Ring is the conversation, Knowlarity is the caller.
4. **Ring records its own side locally** and, after the call, **returns the verdict by webhook keyed on the reference id**: Hot / Warm / Cold (and a possible fourth "don't-call" / DND state — an open question to Ring, see below).
5. **Truemeds stores its OWN recording + full event log** (from Knowlarity + our own events) for RCA / debugging. This is **not** sent to Ring. It is forensic proof, **not** a reliability fix — if Knowlarity connect quality is the problem, the lever is the Knowlarity SLA + reconciliation, not the fact that we kept a recording.

**Correlation.** Everything hangs off the **reference id** (our generic uuid), not `order_id` — so the platform extends to non-cart drop-offs.

**Priority for Cold.** Cold is **not** set aside — it drops to **lowest priority**, below non-AI-called leads, and is still workable. Only a genuine don't-call / DNC state is pulled out.

**DNC capture (two paths).** A lead enters DND either (a) from the AI's post-call input, or (b) from a human via a CTA. It is permanent across our AI + human channels; cross-portal is a shared-list dependency. Whether the voice bot can itself detect a "don't contact me" and return it as a fourth state (alongside Hot/Warm/Cold) is an **open question to Ring**.

**Vendor-agnostic-by-design, not plug-and-play.** The integration is built so the *shape* (reference id in, verdict webhook out, our telephony, our journey) does not depend on Ring internals — but swapping the voice vendor is still a **re-integration**, not a config flip. We do not over-claim platform-agnosticism.

**Retries.** Ours, driven by the Knowlarity telephony disposition (3 buckets: transient/network → quick retry; busy/no-answer/switched-off → retry later; bad number → stop + flag). **Ring does no retries.**

**Where this lives in the PRD.** Confluence PROD page 2023260174 ("AI-led Lead Qualification"): §4 call flow + ASCII diagram (Cold = lowest priority, don't-call prong), §8 verdict loop + retain-recording/events + vendor-agnostic-by-design, §9 resolved questions + PII-on-event + effort-gate, §12 edge cases incl. "forensics is not a reliability fix", §13 running MoM with Ring (this 11 Sep call). Markdown source of truth: `projects/ACOM/ring-ai/docs/ai-led-lead-qualification-prd.md`.

**Still open (to Ring / Knowlarity).** WebSocket handoff feasibility + verdict latency SLA on Knowlarity's side; whether the bot can emit a don't-call state; language support; consent/masking of recorded PII; the shared cross-portal DNC list; first segment + volume; whether AI or manual agents target FTC. See PRD §9 and `projects/ACOM/ring-ai/docs/context/open_questions.md`.

**Status.** Architecture locked 11 Sep; PRD live on Confluence (v19 as of 15 Sep). Vendor-directed open questions still gate build.
