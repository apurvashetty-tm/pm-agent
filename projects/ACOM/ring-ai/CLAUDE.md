# Context primer — ACOM × Ring AI (AI-led Lead Qualification)

*Scoped `CLAUDE.md` for this project folder. Fast onboarding: current state, the rules of the road, and where the detail lives.*

## Workspace memory
Before project-specific work, also read:
- `../../../AGENTS.md`
- `../../../context/Claude.md`
- relevant files in `../../../knowledge/context/`
- `../CLAUDE.md` (ACOM umbrella)

Use project-local files for project truth/handoff; root knowledge files for reusable company/system context.

## What this is
AI voice pre-qualification for top-of-funnel recovery (dropped carts first), with **Ring AI** as the voice-AI vendor and **Knowlarity** as the telephony provider. One initiative under **ACOM** (`../CLAUDE.md`).

**Current active doc: `docs/ai-led-lead-qualification-prd.md`** — a fresh, PM-led, lean, product-focused PRD (also on Confluence, PROD page 2023260174). It supersedes the earlier framing. The earlier docs are **historical context**, not the current plan:
- `docs/rapid-pilot-prd.md` — the earlier "thin bolt-on to today's ACOM queue" pilot (Confluence page 1850114059).
- `docs/voicebot-cart-recovery-prd.md` + `docs/mvp-engineering-walkthrough.md` — the earlier future-state / vendor-agnostic design.
- `DESIGN_JOURNAL.md` — *why* things changed (Phase 3 = the pivot to the current doc; Phase 4 = the locked 11-Sep call architecture).

## The current model in one screen
- **Truemeds integrates Ring; Ring does not integrate us.** The only PII sent to Ring is the customer **name** (needed to open the call); phone and address are never sent.
- **Truemeds owns the whole call via Knowlarity** — dial, connect, retries, calling window, hangup. Ring is the conversation + the verdict, never the caller.
- **Flow (locked 11 Sep):** pre-load lead + cart/custom vars + our own reference id / `uuid` (not `order_id`) + workspace id to Ring -> Knowlarity dials and opens a **WebSocket** to Ring carrying the reference id (no separate media-stream bridge) -> a "customer answered" event starts the bot -> Ring runs the conversation over the socket and records its own side -> Ring returns Hot/Warm/Cold (a possible 4th don't-call state is an open question to Ring) by **webhook keyed on the reference id** -> Truemeds stores its **own** recording + event log for RCA, **not** sent to Ring (forensics, not a reliability fix). Cold = lowest priority (not set aside). Async callback is the model; live transfer is future-state.
- **Two "what happened" signals:** connect / hangup-cause = Knowlarity; conversation verdict = Ring (connected calls only). Retries and give-up are ours, driven by the telephony disposition.
- **Which leads & order:** configurable eligibility (today patient + address) + configurable Ring dial-order (FTC-first) — the manual queue's prioritisation score is **not touched**; Hot/Warm ride as a tier in front of it.
- **Journey:** one "come back at time T" waiting state (Hold / Schedule CTAs) carrying who resumes it; closed leads never re-enter; DNC permanent across our two channels (cross-portal = a shared-list dependency); a per-customer frequency cap; throttle + instant kill-switch; the manual flow always runs underneath as the fallback.

## Data model you need
`incomplete_order_details` (`iod`), `order_details`, `sub_order_details` (holds `patient_id`), `call_details` (telephony log; `recording_url` / `s3bucket_recording_url`, `disposition`, `on_hold_reason`, `is_status_call_back_hold`, `agent_names`, `agent_status`; no transcript column). The current PRD is product-level and leaves schema to engineering — the earlier detailed data model lives in `docs/rapid-pilot-prd.md` §12.

## Vendor reference docs
- Knowlarity **Notifications / Streaming API** — SSE call events (ORIGINATE -> HANGUP) + recording URL at HANGUP / CDR.
- Knowlarity **Hangup Causes** — Q.850 / SIP cause codes; ships retry-case sets (drives our retry policy).
- Ring AI API — docs.ringg.ai.

## How to work here (stakeholder norms)
- **Markdown is the source of truth**; Confluence is generated from it. Never sync unless told "sync".
- **Present -> debate -> agree -> then edit.** Don't edit during brainstorming.
- Product-focused PRDs, not tech specs — leave the "how" to engineering as open questions. Method: `../../../templates/lean-prd-guide.md`.
- Concise external-reader prose; vendor named once then generic in the body (real names kept in the vendor-directed open questions).

## Pointers
- Current build spec -> `docs/ai-led-lead-qualification-prd.md` (Confluence PROD 2023260174)
- Why / history -> `DESIGN_JOURNAL.md`
- Earlier docs (historical) -> `docs/rapid-pilot-prd.md`, `docs/voicebot-cart-recovery-prd.md`, `docs/mvp-engineering-walkthrough.md`
- Locked project truth -> `docs/context/project_truth.md` (only the stakeholder edits it)
- Resume state / handoff -> `docs/context/session_handoff.md`
- Open decisions -> `docs/context/open_questions.md` (mirrors current PRD §9)
- Call architecture, the "why" -> `../../../knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`; running MoM with Ring -> current PRD §13
- Open questions -> live in the current PRD §9; `docs/open-questions-tracker.md` covers the earlier future-state design
- Data-model detail -> `docs/rapid-pilot-prd.md` §12
- PRD method -> `../../../templates/lean-prd-guide.md`
- Schema samples -> `reference/schema-samples/`
