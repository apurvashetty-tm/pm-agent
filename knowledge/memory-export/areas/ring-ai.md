<!-- memory path: /areas/ring-ai.md · last updated in memory: 2026-09-13 -->
---
name: ring-ai
description: ACOM × Ring AI — AI-led lead-qualification platform PRD at Truemeds. Current state, working model, decisions, open questions, file locations, norms. Read when working on this PRD/project.
sources: [cowork]
aliases: [acom, acom 2.0, ring ai, voicebot cart recovery, ai-led lead qualification]
---

## What this is
- [stated] AI voice pre-qualification for top-of-funnel recovery at Truemeds; Ring AI is the voice-AI vendor, Knowlarity the telephony provider. Under the ACOM (Assisted Commerce / cart-recovery) umbrella. Dropped cart is use case #1; built to extend to other drop-offs (Rx-uploaded-not-ordered, registered-no-browse, browsed-no-ATC, refills, win-back).
- [stated] The ACTIVE doc is a lean, PM-led, product-focused PRD: "AI-led Lead Qualification". Prior docs are historical context.

## Where things live
- Repo (user's Mac): ~/src/pm-agent/projects/ACOM/ring-ai/ ; PRD at docs/ai-led-lead-qualification-prd.md (markdown = source of truth); review baseline at reference/prd-review-comments-snapshot.md.
- Confluence: PROD space, page 2023260174 "AI-led Lead Qualification — PRD"; cloudId eac9a727-a2bf-4cba-8fff-a0cca0724f83, spaceId 215613444. LIVE version is v19 (as of 13 Sep 2026). Rapid Pilot PRD = separate page 1850114059 (left intact).

## The working model (how it works) — UPDATED per the Ring call, 11 Sep 2026
- [stated] Ring does NOT integrate Truemeds' APIs — Truemeds integrates Ring. No contact PII (phone/address) to Ring; the customer NAME is sent (bot needs it to address them).
- [stated] Truemeds owns the whole call via Knowlarity: dial, connect, retries, calling window, hangup.
- [stated] Correlation key = a Truemeds generic reference id (a uuid, NOT the order number) so the platform is reusable; rides in the "remark" field.
- [stated] Current flow: (1) pre-load lead in batch to Ring — reference id + cart/custom vars + workspace id, no PII; Ring stores it. (2) We dial the customer via Knowlarity (mobile + reference id). (3) On the same call Knowlarity opens a WebSocket to Ring carrying the reference id; Ring warms up the bot (no talking yet). (4) On a "customer answered" event the bot starts talking; the bot streams over that WebSocket. (5) Ring records the bot–customer leg ON ITS OWN SIDE and returns Hot/Warm/Cold by webhook on the reference id. Async callback; live transfer is future-state.
- [stated] We do NOT send a recording to Ring. Truemeds stores its OWN copy of the recording (from Knowlarity) + an event log (dialled/answered/hung-up/verdict) for audit & RCA. This is forensics — it does NOT fix Knowlarity webhook/event reliability (that needs a provider SLA + reconciliation).
- [stated] Why WebSocket: Knowlarity has no SIP connectivity + audio is a live 2-way stream; Ring already runs this WS path with Knowlarity in prod (inbound). The Truemeds-owns-the-audio-bridge alternative is possible but Ring discourages it (two WS per call, relay at Ring's tuned packet size, cost + failure point) — parked.
- [stated] No true platform-agnosticism: a telephony swap always needs custom dev both sides → re-integration, not a rebuild. Ring charges for connected calls only; a telephony swap = one-time integration cost.
- [stated] PII on the "customer answered" event: it carries the customer number today; Knowlarity must strip it so only reference id + workspace id reach Ring (security-tested our side).

## Which leads, and in what order (3 separate things)
- [stated] Eligibility = what a lead needs before the AI calls it. Today: patient name + address on file. Configurable set. Requiring an address to EXIST ≠ SENDING it.
- [stated] Dial-order (within eligible pool) = FTC first, then NFTC (an ordering, not exclusion). Configurable. Ours.
- [stated] We do NOT touch the manual queue's prioritisation score. Priority order in §5: Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > normal manual queue > Cold (lowest, still callable). Only DNC + invalid excluded.
- [stated] Open tension: strict patient+address gate excludes most FTC — the segment we may most want.

## Lead journey / controls
- [stated] Retries are OURS, off the telephony disposition (AI can't hear a non-connect). Single retry rule/one gap; retry threshold (~3, business to set, within TRAI/DND — no TRAI-mandated cap). Closed lead leaves every queue, never re-enters.
- [stated] Waiting = one "come back at time T" state; each carries who resumes (AI/human; named-time callback default same agent else queue, Ops-configurable). Old manual Hold button retired (frontend change).
- [stated] DNC: two capture paths — AI call (Ring returns opt-out on post-call read) + human call (agent one-click CTA). Applied from next call onward. Cross-portal (HA etc.) needs a shared suppression list = open dependency. Open ask to Ring: return DNC as an explicit label alongside Hot/Warm/Cold.
- [stated] Frequency cap = connected-call cap across AI+human (Ops setting; enforceable only our side). Throttle = rollout dial. Kill-switch = global + per use-case. Manual flow runs underneath as fallback.

## PRD structure (current)
- Sections: 1 Exec summary · 2 Problem · 3 What we're building · 4 How it works (+ reworked fork diagram; old diagram kept in §13) · 5 Which leads & order · 6 Lead's journey (+ retry table, settings table, dispositions table) · 7 User stories · 8 Scope in/out (incl. "Vendor-agnostic by design" in-scope; full plug-and-play platform out) · 9 Decided vs open · 10 Metrics · 11 Annexure to business · 12 Edge cases (curated: webhook missing/late/wrong; cart-changes) · 13 Vendor integration — running MoM (Ring entry dated 11 Sep; grows as vendor talks continue) · Future-state note (live transfer).

## Confluence comment review — state as of 13 Sep 2026 (v19)
- [stated] 38 inline comments total (senior stakeholder Reviewer A #1–33; Reviewer B added #34–36 + two more on 10 Sep). 36 of 38 answered. Open (deliberately, business to answer): #34 (ACOM team strength) and #35 (POC design / BRD). #16 reply is posted but user may still swap in a sharpened "human-agent routing rule" version by hand.
- COMMENT-SAFE EDIT METHOD (proven at scale, v6→v19, zero dangling): full markdown re-push DANGLES all inline comments; instead edit the page as HTML — each inline comment is <span class="annotation" data-annotation-id="..." data-annotation-type="inlineComment">anchored text</span>; keep the span + its text, edit around it (strike old with <s> inside/around the span, add new after), full-body updateConfluencePage contentFormat=html, then re-read resolutionStatus=dangling to confirm zero. Replies via createConfluenceInlineComment (parentCommentId only). Confluence has NO edit-comment API — to change a reply already posted, user edits it by hand (give them paste text + location).
- Every doc change strikes rather than deletes old assumptions (user preference). After each live edit, mirror into docs/*.md AND reference/prd-review-comments-snapshot.md (Part A tracker / Part B body / Part C replies).

## Reusable repo facts (Truemeds)
- ACOM umbrella; sibling FTC-Priority PRD written but NOT implemented — priority is a composite score (final_score) with Ops-tuned weights. Oration AI = separate INBOUND support voicebot. "Rank-Up" = existing push-to-top-of-live-pool (~5-min callback); kept out. Existing human re-attempt = hold → cool-off → re-enter, agent decides, no cap.

## Working norms (also in /preferences.md)
- Markdown is source of truth; never sync to Confluence unless told "sync"/"go". Present → debate → agree → then edit; don't draft until told. Product-focused PRDs, not tech specs — leave "how" to engineering as open questions. Concise external-reader prose; vendor named once then generic in body, real names kept in vendor-directed open questions. When reviewing inline comments, quote the full sentence around the anchored word (bold the anchor) — user often reviews on mobile without the doc open.
