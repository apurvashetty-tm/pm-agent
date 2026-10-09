# CONTINUITY — Type 1 Revamp

**Start here in any new session.** Load this folder (`projects/type1-revamp/`) into Claude and say *"read CONTINUITY.md and continue"*. This file tells any agent where the project stands, how to work with Swapnil, and what to update before the session ends.

**Owner:** Swapnil Singh (swapnil.singh@truemeds.in) · **Started:** 2026-10-05 · **Last updated:** 2026-10-09

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
| R5 | Label every fact: `[CONFIRMED]` (Swapnil said so) · `[DOC]` (PM-agent repo) · `[CODE]` (portal code) · `[INFERRED]` · `[OPEN]`. Never invent product logic. | 2026-10-05 |
| R6 | Plain language, concise; the user reads on a busy schedule. | — |
| R7 | Don't commit/push to GitHub unless Swapnil asks. | — |

---

## 3. Where we are (2026-10-09)

| Workstream | What | Status | Working doc |
|---|---|---|---|
| Discovery | TM vs 1mg evaluation + critique | ✅ Done | `docs/01-evaluation.md`, `docs/02-critique.md` |
| Business case | OP 1,333 → 1,750/day, OD 133 → 250/day | ✅ Captured | `docs/00-opportunity-sizing.md` |
| Portal analysis | Type 1 + Create Order flows, findings P1–P21 | ✅ Done | `docs/03-portal-analysis.md` |
| **W1a Engagement** | Order → request (backend + portal only) | ⏸ Options ready (B-lite L1/L2); **awaiting Swapnil's pick** | `docs/04-brainstorm-w1-order-to-request.md` §4b |
| **W1b Allocation** | Type 1 queue: after-hours orders reached last | ▶ **Current.** Current logic + problem + scope A1–A6 captured; **awaiting go-ahead to brainstorm fixes** | `docs/05-allocation-current-logic.md` |
| W2a Leads → ACOM | Abandoned Rx uploads as leads | Not started | — |
| W2b/c Search + OOS | Search quality, OOS instrumentation, substitutes | Not started | — |
| W2d Coupons | Coupon visibility on portal | Not started | — |
| W3 App journey | Parked (R3) | Parked | — |

**Next exact step:** wait for Swapnil's go-ahead → brainstorm Type 1 allocation fixes for gaps A1–A6 (backend + portal only), min effort / max impact.

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
| 2026-10-09 | Allocation: hours, Hold/Schedule, discovery problem, scope A1–A6; project moved to `projects/type1-revamp/` with continuity files | 12–13 |
