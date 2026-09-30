<!-- memory path: /areas/ring-ai.md · last updated in memory: 2026-09-30 -->
---
name: ring-ai
description: ACOM × Ring AI — AI-led lead-qualification platform PRD at Truemeds. Current state, working model, decisions, open questions, file locations, norms. Read when working on this PRD/project.
sources: [cowork]
aliases: [acom, acom 2.0, ring ai, voicebot cart recovery, ai-led lead qualification]
---

## What this is
- [stated] AI voice pre-qualification for top-of-funnel recovery at Truemeds; Ring AI is the voice-AI vendor, Knowlarity the telephony provider. Under the ACOM (Assisted Commerce / cart-recovery) umbrella. Dropped cart is use case #1; built to extend to other drop-offs (Rx-uploaded-not-ordered, registered-no-browse, browsed-no-ATC, refills, win-back).
- [stated] The ACTIVE doc is a lean, PM-led, product-focused PRD: "AI-led Lead Qualification". Prior docs are historical context.
- [stated] Core problem is REACH, not AOV: ~12,500 eligible leads/day at ₹900+, agents attempt only ~40% (Analytics numbers; replace the earlier BRD "~60% reached").

## Where things live
- Repo (user's Mac): ~/src/pm-agent/projects/ACOM/ring-ai/ ; PRD at docs/ai-led-lead-qualification-prd.md (word-for-word mirror of Confluence); project_truth / open_questions / session_handoff in docs/context/; review baseline at reference/prd-review-comments-snapshot.md. Decision logs in knowledge/decisions/ (latest 2026-09-30-ring-ai-v3-reach-gtm-controls.md).
- Confluence: PROD space, page 2023260174 "AI-led Lead Qualification — PRD"; cloudId eac9a727-a2bf-4cba-8fff-a0cca0724f83, spaceId 215613444. Published Draft v3 on 30 Sep 2026; repo synced the same day. 0 dangling comments; 58 unresolved threads (many already answered in the doc, need a closing reply + resolve). Rapid Pilot PRD = separate page 1850114059 (left intact).
- Practice: Apurva edits Confluence herself; the published page is the base, markdown is backfilled to match.

## The working model (how it works)
- [stated] Ring does NOT integrate Truemeds' APIs — Truemeds integrates Ring. Truemeds owns the whole call via Knowlarity: dial, connect, retries, calling window, hangup.
- [stated] Correlation key = a Truemeds generic reference id (uuid, NOT the order number); rides in the "remark" field.
- [stated] One lead at a time, per attempt: for each attempt we send the lead to Ring, then dial via Knowlarity; every retry is sent to Ring as a fresh request; retries are ours (Ring does none). (Replaced the earlier "pre-load in batch", 30 Sep.)
- [stated] Sent to Ring per attempt: reference id, cart items + quantities (in Ring's variable format), order-level pricing (MRP, selling price, discount amount + discount percent, total savings), delivery ETA, patient name (else customer name). NOT sent: phone, address, SKU-level pricing.
- [stated] Knowlarity bridges the call to Ring over a SIP trunk (Engineering correction, 30 Sep; was a WebSocket) carrying the reference id; Ring warms up the bot; a "customer answered" event starts it; the bot speaks on that SIP call. Ring records its own side and returns Hot/Warm/Cold by webhook on the reference id. Async callback; live transfer is future-state.
- [stated] We do NOT send a recording to Ring. Truemeds stores its own recording + event log for audit & RCA (forensics, not a reliability fix).
- [stated] PRD §4 diagram updated to SIP trunk on Confluence (30 Sep; correction comment on the §4 heading) and synced to the repo. §6 ("separate from the AI's Knowlarity streaming path") and §13 (WebSocket rationale) still to align. The 25 Sep reviewer comment "SIP instead of WebSocket" was right — reply + resolve pending.
- [stated] Single vendor + single telephony provider; a swap = re-integration, not a rebuild. "Vendor-agnostic by design" struck from scope (30 Sep).
- [stated] PII on the "customer answered" event: carries the number today; must be stripped — now an InfoSec call-out.

## Which leads, and in what order
- [stated] Eligibility: minimum AOV ₹500 — the same for the AI and the manual queue (was ₹900) — + patient + address on file. ~17,000 leads/day at ₹500; FTC share 20.2% → 25% (38% within ₹500–900).
- [stated] Dial order = today's queue logic as is (existing filters + final_score). The score's FTC weighting already puts FTC first; no separate FTC rule or threshold.
- [stated] Manual queue score untouched. Priority after the verdict (locked): Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold (lowest, still callable). Only DNC + invalid excluded.
- [stated] Hot/Warm stay in the agents' queue 24 h from the AI's verdict, even past the normal 24-hour window; not attempted by then = stale, leaves the queue. Cold keeps the normal window. A reviewer asked for 48 h; Apurva kept 24 h.
- [stated] Later (not V1): relaxing the patient + address gate (it excludes many FTC).

## Lead journey / controls
- [stated] Retries ours, off the telephony disposition; 4 attempts (30/60/60 min; 2 min after a short drop). Closed lead never re-enters; retry-exhausted closure is permanent for that lead.
- [stated] A human-assigned lead is never assigned to the bot (scoped to that lead).
- [stated] One waiting state ("come back at time T") carrying who resumes it; old manual Hold button retired.
- [stated] DNC: AI post-call read (to be confirmed with Ring; DNC as its own label is an open ask) + agent one-click CTA. Cross-portal needs a shared list (later).
- [stated] Frequency cap: 3 connected calls per customer in a rolling 7 days (AI + human); minimum connect 15 s; calling window 09:00–21:00.
- [stated] Throttle REMOVED. Pause rule instead: before sending new leads to the AI, if the oldest Hot/Warm lead has waited >2 h for an agent, send none; due retries still go out; self-adjusting.
- [stated] Kill switch: global master stop now; per-use-case stop later.
- [stated] Setting values final (config, tunable at go-live).

## GTM & metrics (PRD §10, §14)
- [stated] GTM split by customer ID last two digits (customer ID, not order ID — future leads may have no order): tech pilot 00–04 (5%, 3–4 days) → 00–24 (1 wk) → 00–49 (1 wk) → all (2 wks) on ₹900+; then ₹500 at 00–74 (1 wk) → all (1 wk).
- [stated] Gates: 0 customers called by AI + agent at once; outcome + verdict within contract SLA (tech pilot); stale ≤10%; Hot/Warm conversion ≥2× human; 5% Cold sample (Ops calls outside allocation) converts clearly lower; sales per 100 customers AI ≥ agent. From 100%: vs today's baselines (human conversion ~5%). ₹500 step judged on sales, not AOV. Missed gate = hold + RCA; safety breach = kill switch.
- [stated] Final business number: ACOM sales (₹/day) = converted orders × AOV. Orders count within 24 h. POC funnel: 1,313 attempted → 1,033 connected → 266 Hot/Warm → 112 stale → 154 attempted by agents → 91 connected → 28 orders (18% of attempted, 10.5% of all Hot/Warm; manual 5%).

## Open (PRD §9 — none blocks the build)
- Go-live: verdict + call-outcome SLA (Business sets in Ring/Knowlarity contracts); languages; DNC as a Ring label; simultaneous-call limits. InfoSec: spoken PII + stripping the number from the "answered" event. Later: leads without patient + address; cross-portal DNC. Also pending: Knowlarity telephony specifics, bot-leg failure error code, Analytics baselines for AOV + sales.

## PRD structure (Draft v3)
- 1 Exec summary · 2 Problem (incl. ₹500 + POC funnel) · 3 What we're building · 4 How it works (what we send + diagram) · 5 Which leads & order (+ Hot/Warm 24 h rule) · 6 Lead's journey (retry table, pause rule, settings table, dispositions incl. Stale) · 7 User stories · 8 Scope · 9 Decided vs open · 10 Metrics table · 11 Annexure · 12 Edge cases · 13 Ring MoM · 14 GTM & Rollout · Future state (live transfer).

## Confluence editing know-how
- COMMENT-SAFE EDIT METHOD (proven at scale, zero dangling): full markdown re-push DANGLES all inline comments; instead edit the page as HTML — each inline comment is <span class="annotation" data-annotation-id="..." data-annotation-type="inlineComment">anchored text</span>; keep the span + its text, edit around it, full-body updateConfluencePage contentFormat=html, then re-read resolutionStatus=dangling to confirm zero. Replies via createConfluenceInlineComment (parentCommentId only). No edit-comment API. Always fresh-pull before any live edit.
- Deleting text that carries an open inline comment loses the comment's anchor — reply + resolve first, then edit.
- The API returns only the PUBLISHED version — unpublished Confluence drafts aren't visible; ask Apurva to publish before a proofread.

## Reusable repo facts (Truemeds)
- ACOM umbrella; FTC-Priority PRD written but not implemented — priority is final_score with Ops-tuned weights (FTC weight dominates). Oration AI = separate INBOUND voicebot.

## Working norms
- See /preferences.md (product-focused PRDs, present → debate → agree → edit, never sync unless told, lean GTM, batch review comments, Truemeds funnel terms, marked review copies, omitted suggestions = rejected).
- Whenever a stated fact changes, scan the WHOLE document for every occurrence before treating the edit as done.
