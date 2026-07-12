# session_handoff.md — Q2 Portals & Payments Roadmap

**Purpose:** Captures current state and exact next step so any session (Cowork, Claude Code, Codex) can resume without chat history.

**Last updated:** 2026-07-11
**Session status:** Hard Gate finalized. Bet 1–4 + Ring drafted and consolidated. Column schema simplification agreed but not yet applied. Problem statements agreed in approach but not yet written to file.

---

## 1. What exists today

`Q2_Roadmap_Jul-Sep_v1.xlsx` in this folder, 3 tabs:
- **Read Me** — quarter, owner, capacity, baseline posture, structure summary
- **Bet Definitions** — short tag, full name, status, primary outcome metric, notes per bet
- **Q2 Roadmap** — 23 initiative rows

Section state:
- **Hard Gate (Compliance):** 5 rows finalized — new Doctor Portal service (foundation), onboarding/auth/credentialing/doc-gen, multi-patient capture, case assignment & availability backbone (capacity-conditional), doctor identity & anti-impersonation audit (Discovery only).
- **Bet 1 OP → OD:** 4 rows — consolidated from an original 6 (merged missed-call recovery + number-health; merged demand-supply mapping + pre-connect pilot) given single-SPM bandwidth.
- **Bet 2 CPO & Productivity:** 3 rows — consolidated from an original 6 (merged Kapture baseline/mapping/taxonomy; merged CSR actioning + L2/L3 accountability). Chatbot foundation cut from Q2 entirely — prerequisite work not ready.
- **Bet 3 Online Payments:** 5 rows, unchanged from the original draft — cleanest section, no consolidation needed.
- **Bet 4 Trust & Retention:** 5 rows — Returns M2 made explicitly conditional on M1 progress rather than parallel-tracked.
- **Ring AI Pilot:** 1 row, tracked separately, non-negotiable carryover.

---

## 2. Agreed but NOT YET applied to the xlsx — do this next

1. **Remove the Jul/Aug/Sep month columns entirely.** Replace with the single `Q2 Role` field already defined in `project_truth.md` §6 (Discovery / Discovery + Delivery / Delivery, plus Correctness/Fix and Pilot where applicable).
2. **Add a Problem Statement to the Bet Definitions tab** — one per bet, not per initiative. Source: blend Section 4 of `Claude_Context_Handoff_Q3_Roadmap.md` with what's changed since (Doctor Portal architecture call-out, deferred impersonation decision). Draft statements were proposed in chat on 2026-07-11 — **not yet confirmed by user**, do not treat as final.
3. This scaffold itself (`CLAUDE.md`, `docs/context/*`, `docs/roles/*`) was created 2026-07-11 to match the pattern already proven in `truemeds-doctor-portal-prototype` and `acom-ring-ai` — so future sessions read files instead of relying on chat history.

---

## 3. Next exact step

Confirm problem-statement wording with the user, then rebuild `Q2_Roadmap_Jul-Sep_v1.xlsx` with: (a) month columns removed, (b) simplified `Q2 Role` tags, (c) problem statements on the Bet Definitions tab. After that, v1 is complete pending final user review.

---

## 4. Known gaps / not yet decided

See `docs/context/open_questions.md` for the full list. Highlights:
- Doctor Portal reject-workflow — build this quarter (DocStat has a ready template) or leave open
- Hold vs Reschedule distinction — likely low priority, not decided
