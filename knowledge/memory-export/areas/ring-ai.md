<!-- memory path: /areas/ring-ai.md · last updated in memory: 2026-09-25 -->
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
- Repo (user's Mac): ~/src/pm-agent/projects/ACOM/ring-ai/ ; PRD at docs/ai-led-lead-qualification-prd.md; review baseline at reference/prd-review-comments-snapshot.md. Practice this cycle (25 Sep): edits are made directly on Confluence with the review team, then backfilled to markdown — markdown is kept in sync, not edited first.
- Confluence: PROD space, page 2023260174 "AI-led Lead Qualification — PRD"; cloudId eac9a727-a2bf-4cba-8fff-a0cca0724f83, spaceId 215613444. As of 25 Sep 2026: 0 dangling (orphaned-anchor) comments; 52 root-level review comments, 47 with at least one reply. Rapid Pilot PRD = separate page 1850114059 (left intact).

## The working model (how it works) — per the Ring call, 11 Sep 2026
- [stated] Ring does NOT integrate Truemeds' APIs — Truemeds integrates Ring. No contact PII (phone/address) to Ring; the customer NAME is sent (bot needs it to address them; patient name preferred, customer name as fallback where no patient name is on file).
- [stated] Truemeds owns the whole call via Knowlarity: dial, connect, retries, calling window, hangup.
- [stated] Correlation key = a Truemeds generic reference id (a uuid, NOT the order number) so the platform is reusable; rides in the "remark" field.
- [stated] Current flow: (1) pre-load lead in batch to Ring — reference id + cart/custom vars + workspace id, no PII; Ring stores it. (2) We dial the customer via Knowlarity (mobile + reference id). (3) On the same call Knowlarity opens a WebSocket to Ring carrying the reference id; Ring warms up the bot (no talking yet). (4) On a "customer answered" event the bot starts talking; the bot streams over that WebSocket. (5) Ring records the bot–customer leg ON ITS OWN SIDE and returns Hot/Warm/Cold by webhook on the reference id. Async callback; live transfer is future-state.
- [stated] We do NOT send a recording to Ring. Truemeds stores its OWN copy of the recording (from Knowlarity) + an event log (dialled/answered/hung-up/verdict) for audit & RCA. This is forensics — it does NOT fix Knowlarity webhook/event reliability (that needs a provider SLA + reconciliation).
- [stated] Why WebSocket: Knowlarity has no SIP connectivity + audio is a live 2-way stream; Ring already runs this WS path with Knowlarity in prod (inbound). The Truemeds-owns-the-audio-bridge alternative is possible but Ring discourages it (two WS per call, relay at Ring's tuned packet size, cost + failure point) — parked. A newer reviewer comment (25 Sep, unanswered) asks about SIP instead of WebSocket — still open.
- [stated] No true platform-agnosticism: a telephony swap always needs custom dev both sides → re-integration, not a rebuild. Ring charges for connected calls only; a telephony swap = one-time integration cost.
- [stated] PII on the "customer answered" event: it carries the customer number today; Knowlarity must strip it so only reference id + workspace id reach Ring (security-tested our side).

## Which leads, and in what order (3 separate things)
- [stated] Eligibility = what a lead needs before the AI calls it. Today: patient name + address on file. Configurable set. Requiring an address to EXIST ≠ SENDING it.
- [stated] Dial-order (within eligible pool) = FTC first, then NFTC (an ordering, not exclusion). Configurable. Ours.
- [stated] We do NOT touch the manual queue's prioritisation score. Priority order in §5: Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > normal manual queue > Cold (lowest, still callable). Only DNC + invalid excluded.
- [stated] Open tension: strict patient+address gate excludes most FTC — the segment we may most want.

## Lead journey / controls
- [stated] Retries are OURS, off the telephony disposition (AI can't hear a non-connect). Single retry rule/one gap; **retry threshold confirmed at 4 attempts** (within TRAI/DND limits — no TRAI-mandated cap; 30/60/60 min gaps across the 4 attempts). Closed lead leaves every queue, never re-enters.
- [stated] **Retry-exhausted closure is permanent for that lead** (locked 25 Sep) — never reopened or rechecked once retries are exhausted; the only way the customer re-enters is a NEW cart/order creating a fresh lead with its own reference id.
- [stated] **A human-assigned lead is never assigned to the bot** (locked 25 Sep) — once a human agent is assigned to a lead, that lead stays with the human; scoped to that lead only — a new cart/order creates a fresh lead, evaluated fresh.
- [stated] Waiting = one "come back at time T" state; each carries who resumes (AI/human; named-time callback default same agent else queue, Ops-configurable). Old manual Hold button retired (frontend change).
- [stated] DNC: two capture paths — AI call (Ring returns opt-out on post-call read) + human call (agent one-click CTA). Applied from next call onward. Cross-portal (HA etc.) needs a shared suppression list = open dependency. Open ask to Ring: return DNC as an explicit label alongside Hot/Warm/Cold.
- [stated] Frequency cap = connected-call cap across AI+human, distinct from retry threshold (Ops setting; enforceable only our side). Throttle = rollout dial. Kill-switch = global + per use-case. Manual flow runs underneath as fallback.

## PRD structure (current)
- Sections: 1 Exec summary · 2 Problem · 3 What we're building · 4 How it works (+ reworked fork diagram; old diagram kept in §13) · 5 Which leads & order · 6 Lead's journey (+ retry table, settings table, dispositions table) · 7 User stories · 8 Scope in/out (incl. "Vendor-agnostic by design" in-scope; full plug-and-play platform out) · 9 Decided vs open · 10 Metrics · 11 Annexure to business · 12 Edge cases (curated: webhook missing/late/wrong — now a two-signal Knowlarity/Ring table; bot-leg failure table; cart-changes) · 13 Vendor integration — running MoM (Ring entry dated 11 Sep) · Future-state note (live transfer).

## Confluence comment review — state as of 25 Sep 2026
- [stated] 52 root-level review comments, 47 with at least one reply. 5 without a reply yet: 4 of those are already answered by the current doc content but haven't had a closing reply posted (callee/patient name, telephony-confirmed-but-no-verdict edge case, bot-leg failure handling, frequency-cap-vs-retry-threshold distinction); 1 is a genuinely new, unanswered comment (25 Sep) asking why SIP wasn't used instead of WebSocket.
- [stated] This session recovered the page from an accidental corruption (bad update) back to a known-good state, then resolved a further round of comments (SKU pricing dropped from the doc per reviewer ask, discount_amount + discount_percent fields, callee/patient name fallback) and added two new locked rules (see above) after "present → debate → agree → then edit" — including two drafting corrections: don't name a solution mechanism (e.g. a specific internal field) when only the requirement should be stated; PRDs state the requirement, engineering owns the "how".
- COMMENT-SAFE EDIT METHOD (proven at scale, zero dangling): full markdown re-push DANGLES all inline comments; instead edit the page as HTML — each inline comment is <span class="annotation" data-annotation-id="..." data-annotation-type="inlineComment">anchored text</span>; keep the span + its text, edit around it (strike old with <s> inside/around the span, add new after), full-body updateConfluencePage contentFormat=html, then re-read resolutionStatus=dangling to confirm zero. Replies via createConfluenceInlineComment (parentCommentId only). Confluence has NO edit-comment API — to change a reply already posted, user edits it by hand (give them paste text + location). Always do a fresh pull before any live edit to catch manual changes since the last known state, and diff-check to avoid clobbering them.
- New additions to the doc are flagged inline with a plain bold "🆕 Added <date>" tag prefix on the paragraph/bullet — NOT a colored callout/panel box (also a hard constraint: Confluence ADF disallows panels nested inside list items).

## Reusable repo facts (Truemeds)
- ACOM umbrella; sibling FTC-Priority PRD written but NOT implemented — priority is a composite score (final_score) with Ops-tuned weights. Oration AI = separate INBOUND support voicebot. "Rank-Up" = existing push-to-top-of-live-pool (~5-min callback); kept out. Existing human re-attempt = hold → cool-off → re-enter, agent decides, no cap.

## Working norms (also in /preferences.md)
- Markdown is source of truth; never sync to Confluence unless told "sync"/"go". Present → debate → agree → then edit; don't draft until told. Product-focused PRDs, not tech specs — leave "how" to engineering as open questions (state the bare requirement, don't name or suggest an implementation mechanism). Concise external-reader prose; vendor named once then generic in body, real names kept in vendor-directed open questions. When reviewing inline comments, quote the full sentence around the anchored word (bold the anchor) — user often reviews on mobile without the doc open.
- **Whenever a stated fact changes (e.g. a threshold or number), scan the WHOLE document for every occurrence of it before treating the edit as done** — adopted 25 Sep after a retry-threshold update (3→4) was missed in one of three places it appeared in the doc.
