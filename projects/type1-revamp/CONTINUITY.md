# CONTINUITY — Type 1 Revamp

**Start here in any new session.** Load this folder (`projects/type1-revamp/`) into Claude and say *"read CONTINUITY.md and continue"*. This file tells any agent where the project stands, how to work with Swapnil, and what to update before the session ends.

**Owner:** Swapnil Singh (swapnil.singh@truemeds.in) · **Started:** 2026-10-05 · **Last updated:** 2026-10-13

**Main doc (Google):** [PRD - Type 1, tab "PRD"](https://docs.google.com/document/d/1YwoJwH8j08sYYtvNcFXhXP7NqcSXkXyN7-EQZp398IU/edit?tab=t.ety8nis1n1hj), a mirror of `docs/13-oms-problem-and-solution.md`. The `.md` is the source; after each agreed change, update the `.md`, then the same Google Doc tab (re-read first; the "Notes" tab is Swapnil's own; never touch it. Swapnil also edits the PRD tab directly, so diff it before each write and mirror his edits back into the `.md`).

---

## 1. Read order (every session, in this order)

1. `CONTINUITY.md` (this file): rules + current position
2. `docs/context/session_handoff.md`: exact resume point
3. `docs/context/project_truth.md`: confirmed facts (only Swapnil changes these)
4. `docs/context/decision_log.md`: what was decided, when, why
5. `docs/context/open_questions.md`: what is still unresolved
6. `docs/context/narration_log.md`: Swapnil's own words, chronological (read the latest 2–3 entries at least)
7. The working doc for the current step (see §3)

---

## 2. Working rules (non-negotiable)

| # | Rule | Since |
|---|---|---|
| R1 | **One step at a time.** Evaluation → Critique → Brainstorm → Finalise. Finish a step, present it, **stop**. Never start the next step without Swapnil's explicit go-ahead. | 2026-10-05 |
| R2 | **Type 1 only.** Don't mix allocation/ranking logic from other modules (doctor pool, HGS, ACOM, Project South) into Type 1. Park it in `docs/parked-other-module-allocation.md`. | 2026-10-08 |
| R3 | **No app release for now** (app is in experimentation). Solutions must ship via **backend + pharmacist portal**. App-side ideas are parked. | 2026-10-08 |
| R4 | **Minimum effort, maximum impact**, one workstream at a time, then close it. | 2026-10-08 |
| R9 | **Problem statements: no numbers, no competitor names.** | 2026-10-13 |
| R8 | **No portal revamp.** Small, targeted changes on the current portal; structural work waits for Portal Unification. | 2026-10-12 |
| R5 | Label every fact: `[CONFIRMED]` (Swapnil said so) · `[DOC]` (PM-agent repo) · `[CODE]` (portal code) · `[INFERRED]` · `[OPEN]`. Never invent product logic. | 2026-10-05 |
| R6 | Plain language, concise; the user reads on a busy schedule. | — |
| R7 | Don't commit/push to GitHub unless Swapnil asks. Work lives on branch **`project/type1-revamp`**; merge to `main` via PR. | 2026-10-13 |

---

## 3. Where we are (2026-10-13)

| Workstream | What | Status | Working doc |
|---|---|---|---|
| Discovery | TM vs 1mg evaluation + critique | ✅ Done | `docs/01-evaluation.md`, `docs/02-critique.md` |
| Business case | OP 1,333 → 1,750/day, OD 133 → 250/day | ✅ Captured | `docs/00-opportunity-sizing.md` |
| Portal analysis | Type 1 + Create Order flows, findings P1–P21 | ✅ Done | `docs/03-portal-analysis.md` |
| **W1a OMS** | Request `RX VERIFICATION PENDING`; pharmacist creates the order; Arm A/B; all abandoned journeys → ACOM | ✅ **Closed for now** (D35). PRD v0.2 (D36: no validity gate, tag only); open items E1–E4 (eng), P1–P5 (product) | `docs/10-oms-prd.md` (history: 06–08) |
| **W1b Allocation** | Type 1 queue: after-hours orders reached last + never-verified requests (V, from 08 §11) | ⏭ **Next candidate.** Current logic + problem + scope A1–A6 + V options captured | `docs/05-allocation-current-logic.md` |
| W2a Leads → ACOM | Abandoned Rx uploads as leads | Folded into W1a (`08`) | `docs/08-…` |
| **Problem statement** | All problems we're solving (A1–A4, B1–B2, C1–C6, D1–D2, E1) — PRD feedback | Draft, **awaiting review** → fold into PRD §2 | `docs/11-problem-statement.md` |
| **Portal fix list** | 8 agreed fixes (D40) from the mock-flow review | ✅ Agreed | `docs/12-portal-issues-observed.md` |
| **Portal approach** | No revamp; current portal + small changes until Unification (D34) | Draft road ahead, **awaiting review** | `docs/09-portal-road-ahead.md` |
| W2b/c Search + OOS | Search quality, OOS instrumentation, substitutes | Not started | — |
| W2d Coupons | Coupon visibility on portal | Not started | — |
| W3 App journey | Parked (R3) | Parked | — |

**Next exact step (2026-10-14):** apply the PRD v1.0 review. Full PRD is the Google Doc tab "PRD v1.0" (source `docs/15-type1-prd.md`); the "PRD" tab is the problem-and-solution working doc (`docs/13-…`); clickable journey mock `docs/14-type1-journey-mock.html`.

**Last feedback (Apurva Shetty, PRD review, 2026-10-14) — waiting for Swapnil's go-ahead on RV1–RV3 before rewriting:**
- ACOM wrongly captured: keep ACOM only for uploads never sent for verification; declines/failed calls/unchecked carts close with a reason (RV1, RV4).
- Too cramped: simplify, use user stories (customer, pharmacist, ACOM agent), annex the detail (RV2).
- Cover Rx + cart-items uploads (Type 2) in the same flow (RV3).
- Fixes: CTA creates the request (not the upload); "Order placed" makes customers think we have everything; drop OP GMV; specific metrics; don't call requirements "OMS"; show expected call time; substitutes for in-stock medicines priced against the original (RV5).

---

## 4. Folder map

```
type1-revamp/
├── CONTINUITY.md                 ← this file
├── CLAUDE.md                     ← project rules for agents
├── docs/
│   ├── 00-opportunity-sizing.md  business case + lever math
│   ├── 01-evaluation.md          TM vs 1mg app flow (Step 1)
│   ├── 02-critique.md            critique (Step 2)
│   ├── 03-portal-analysis.md     pharmacist portal: Type 1 + Create Order, scope W1–W3, PM-agent context
│   ├── 04-brainstorm-w1-order-to-request.md   W1 engagement options (A/B/C → B-lite)
│   ├── 05-allocation-current-logic.md         Type 1 allocation: logic, problem, scope A1–A6
│   ├── 06-brainstorm-oms-request-state.md     OMS: request state, Arm A/B, abandoned → ACOM
│   ├── 07-pending-verification-state.md       Pending Verification state model + enhancements E1–E15
│   ├── 08-abandoned-type1-leads-acom.md       abandon taxonomy (incl. mid-flow) → ACOM leads
│   ├── 09-portal-road-ahead.md                current portal now vs Unification later; CTA options
│   ├── 10-oms-prd.md                     ✅ OMS closed: lean PRD (v0.2)
│   ├── 11-problem-statement.md                all problems we're solving (draft → PRD §2)
│   ├── 12-portal-issues-observed.md           portal issues by screen + top 10
│   ├── parked-other-module-allocation.md      other modules' logic (reference only, R2)
│   └── context/
│       ├── session_handoff.md    exact resume point
│       ├── project_truth.md      confirmed facts
│       ├── decision_log.md       dated decisions
│       ├── open_questions.md     unresolved items
│       └── narration_log.md      Swapnil's messages, verbatim-ish, chronological
└── reference/
    ├── truemeds/                 TM app screenshots (WhatsApp export is reverse-chronological)
    ├── 1mg/                      1mg app screenshots
    ├── excluded-platinumrx/      PlatinumRx screens (out of scope)
    └── portal/                   pharmacist-portal.html (v4.8.8), screens/, tools/ (sample-data overlay)
```

---

## 5. End-of-session checklist (every agent, every session)

1. **Append** Swapnil's new messages to `docs/context/narration_log.md` (his words, typos fixed only) + the follow-up action taken.
2. **Add** any new decision to `docs/context/decision_log.md` (date, decision, why, source entry).
3. **Move** answered questions in `open_questions.md` to Resolved; add new ones.
4. **Update** `docs/context/session_handoff.md` and §3 of this file (status + next exact step).
5. Only Swapnil promotes facts into `project_truth.md`. Propose additions; don't self-lock.

---

## 6. Session log

| Date | What happened | Narration entries |
|---|---|---|
| 2026-10-05 | Project start; Step 1 evaluation; Step 2 critique; stepwise rule set | 1–2 |
| 2026-10-08 | Scope expanded (W1–W3); portal analysis; Apurva's repo update read; W1 options; no-app constraint; sizing sheet; allocation logic (Type 1 isolated) | 3–11 |
| 2026-10-09 | Allocation: hours, Hold/Schedule, discovery problem, scope A1–A6; project moved to `projects/type1-revamp/` with continuity files; OMS scope reframed + brainstorm (doc 06) | 12–14 |
| 2026-10-12 | D16: request = Pending Verification, pharmacist creates the order; enhancements doc 07 | 15 |
| 2026-10-12 | Picks D17–D23 (status name, Now/Future, Arm B + incentives, ACOM leads, configurable rule, after-hours, future real-time scope) | 16 |
| 2026-10-12 | D24 mid-flow abandon → ACOM; D25 incentives out of scope; doc 08 | 17 |
| 2026-10-12 | D26–D32: abandon taxonomy picks, V stays in Type 1, ACOM value filter, requirements, app reqs parked; V brainstorm | 18 |
| 2026-10-12 | D33 CTA wording open; D34 portal: no revamp, current portal until Unification; doc 09 | 19 |
| 2026-10-12 | OMS closed for now: PRD v0.1 (D35); V moved to W1b | 20 |
| 2026-10-12 | D36 no Rx-validity gate (tag only); PRD v0.2 | 21 |
| 2026-10-13 | PRD feedback: full problem statement (doc 11); D37–D39 (three ways to finish; call first) | 22 |
| 2026-10-13 | Portal issues observed from mock flow (doc 12) | 23 |
| 2026-10-13 | D40 portal fix list (8); C6 added to problem statement | 24 |
| 2026-10-13 | Pushed all work to `project/type1-revamp` (D41); continuity + logs updated | 25 |
