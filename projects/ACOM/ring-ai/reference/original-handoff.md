# Handoff — ACOM 2.0 / Ring AI PRD → build a walkthrough page

*Purpose: orient a fresh Claude Code session (no memory of the prior chat) so it can build a presentable engineering walkthrough page and commit everything to git.*

## 1. What this project is
Truemeds is building a **vendor-agnostic voice-bot layer for dropped-cart (incomplete-order) recovery**, with **Ring AI as the first vendor**. The bot calls customers, qualifies intent (Hot/Warm/Cold), and the system routes interested customers to a human agent who completes the order — either by **async callback** (the MVP) or, later and conditionally, by **live transfer**. Truemeds order/cart data is always the source of truth; the bot payload is a stale-able snapshot that is re-validated before any agent acts.

## 2. Current status & the deliverable
- The PRD is at **`ACOM2.0_Ringg_Integration_PRD.md`** — draft **v0.5**, restructured and review-clean. It is largely self-documenting: **Section 6 (Key decisions & rationale)** and inline "why" lines carry the reasoning, so the PRD *is* the context.
- **Next job:** build a **presentable, single-file HTML walkthrough page** for an engineering walkthrough, then push the PRD + page to git as a centralized knowledge base.

## 3. Files to bring into the repo
- `ACOM2.0_Ringg_Integration_PRD.md` — the PRD (primary source of truth).
- `ACOM 2.O — Ringg Integration.docx` — the original BRD (background; in the prior session's uploads).
- Ring AI API ref (live): https://docs.ringg.ai/api-reference/endpoint/calling/initiate-individual-call (also summarized in PRD Appendix C).

## 4. The walkthrough page — suggested spec
Single self-contained `.html` file (no build step, no external deps beyond optional CDN for a chart/diagram lib). It should let a presenter walk engineering through the PRD visually:
- A top-line summary (problem → approach → MVP).
- A **visual funnel**: eligible cart → bot call → Hot/Warm/Cold → validate latest state → live transfer **or** async callback → agent places order.
- A **milestone view** (M1A/M1B, M2a, M2b, M3, M4) with what each delivers + entry/exit.
- The **lead lifecycle / state machine** (from PRD §14.4) as a diagram.
- The **decision log** (PRD §6) rendered as a clean table — this is the part engineering will debate.
- The **open questions** split by owner (Engineering / Ring AI / Telephony / Ops) from §15.
- Keep it readable for mixed audience; collapsible sections are nice but optional.

Derive all content from the PRD so the page stays in sync; don't invent new facts.

## 5. Key decisions already locked (do NOT re-open unless asked)
- **MVP = M1 + M2a (async).** Live transfer (M2b) is additive, conditional on discovery, and never blocks/delays the MVP.
- **Vendor-agnostic via a thin adapter + Truemeds-owned normalized outcomes** (not a multi-vendor platform).
- **Payload = snapshot; re-validate latest state before any agent action** (at screen-pop in V1).
- **Two gates kept separate:** availability (queue + fail-fast + staffed-hours + Ops concurrency) vs order-validity (at screen-pop). **No real-time pre-transfer API in V1** (it's V2).
- **Truemeds-owned DIDs; hybrid telephony** (Ring keeps media path, transfers into an Ozonetel queue); provider kept behind one integration boundary; failover deferred.
- **We call the vendor for commands; the vendor webhooks us for events** (polling is a reconciliation backstop only). Minimal vendor-facing surface.
- **Rx/substitution is out of scope** — handled by the existing post-placement flow (doctor / HA-pharmacist).
- **M4 (same-order conversion) is evaluation only**, not a committed build.
- **Live transfer is A/B-gated** on delivered-order conversion before scale-up.

## 6. Still open / pending (tracked in PRD §15)
- The Ring **production endpoint** (v1 is deprecated → likely v2) and the **webhook/verdict schema**.
- **CLI preservation** on the transferred leg (decides V1 screen-pop design).
- Truemeds **data model** for the dropped order/cart + the **linking key** to the final order.
- Ops inputs: eligibility segment, concurrency, callback SLA, final bot script.
- Analytics inputs for the supply/demand model + metric definitions.

## 7. How the stakeholder likes to work (apply these)
- **Markdown is the source of truth**; rendered formats are generated from it.
- **Write for external readers** — no meta-scaffolding, no "this section is the plain-language layer," no narrating the process into the doc.
- In brainstorming/review threads: **present → debate → agree → then edit.** Don't edit during ideation.
- Be **concise and direct**; keep numbers consistent with the BRD and label anything unverified.

## 8. Suggested kickoff prompt for Claude Code
> "Read `ACOM2.0_Ringg_Integration_PRD.md`. Build a single self-contained HTML walkthrough page for an engineering walkthrough, with a visual recovery funnel, the milestone view (M1A/M1B, M2a, M2b, M3, M4), the lead-lifecycle state machine, the decision log as a table, and the open questions grouped by owner — all derived from the PRD. Then set up the repo structure and stage a commit. Keep the page presentable and the content in sync with the PRD; don't invent facts."

## 9. Suggested repo layout
```
/acom-ringg/
  README.md                         # short index pointing to the PRD + page
  prd/ACOM2.0_Ringg_Integration_PRD.md
  prd/walkthrough.html              # the page to build
  reference/BRD - ACOM 2.0.docx
  reference/ring-api-appendix.md    # optional extract of PRD Appendix C
```
