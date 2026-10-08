<!-- memory path: /projects/01a0a379-0b9f-76d7-aeb2-fb21995abd69/q2_roadmap_operating_facts.md · last updated in memory: 2026-09-15 -->
---
name: q2-roadmap-operating-facts
description: "Confirmed Q2 (Jul-Sep) roadmap operating facts for Apurva's Portals & Payments charters at Truemeds - quarter naming, team capacity, format decisions"
metadata: 
  node_type: memory
  type: project
  originSessionId: f01cf15a-c205-4194-ba93-5faa25d2daaa
sources: [cowork-import]
imported_at: 2026-09-15T05:10:16Z
---

Quarter naming: "Q2" = July-August-September, because Truemeds' fiscal year starts in April (confirmed by Apurva on 2026-07-06). The earlier handoff doc (`Claude_Context_Handoff_Q3_Roadmap.md`) argued this should be "Q3" under a Jan-start assumption — that assumption was wrong. All roadmap files for this horizon should say Q2.

**Why:** Materially affects every deliverable label/filename. Confirmed directly by user after I flagged the inconsistency between the handoff doc and the raw inventory workbook.
**How to apply:** Always use "Q2" for the July-September 2026 horizon in this project unless the user says otherwise. Q3 = October-December.

Team capacity for Q2: 1 SPM (Apurva), 0 APM, 4 SDE2 + 2 SDE1 (6 engineers total). This supersedes an earlier stale note (in the handoff doc) that assumed "2-3 mostly-junior engineers."

**Why:** User corrected this explicitly when asked. Engineering throughput is higher than the stale note suggested (6 engineers, more senior mix), but there is no APM — so the real bottleneck is PM/APM bandwidth for scoping, discovery, and stakeholder management across multiple fronts, not engineering capacity.
**How to apply:** When scoping how many concurrent initiative *threads* the roadmap can carry, constrain on SPM bandwidth (how many things one person can scope/own/steward at once), not engineering headcount. Push back on roadmaps with many parallel discovery/build threads per bet even if engineering capacity looks sufficient.

Roadmap format preference: leadership wants a simple, filterable Excel view — short tags per column (Bet, Type, Q2 Role, phase-per-month), not paragraph-length metric/output text repeated on every row. A "Sept Decision" column (Scale / Iterate / Stop / Take to Q3) should exist per initiative.

**Why:** User explicitly flagged an earlier draft as "too text heavy" — same paragraph copy-pasted per row, and Aug/Sep columns were full narrative sentences instead of scannable phase tags.
**How to apply:** Any future roadmap workbook should follow this column schema: Bet | Initiative | Metric Home (tag) | Output Metric (specific to that initiative, 1-2 metrics, not the whole bet's list) | Type | Q2 Role | Jul | Aug | Sep (short phase tags) | Sept Decision (tag) | Notes (only when there's a real caveat).

Working style: user wants to brainstorm/critique section-by-section before any file editing happens. Only proceed to build/edit when explicitly told ("go ahead," "draft a first cut," etc.). See [[roadmap-working-style]].

Reference material used to ground the Hard Gate (Compliance) section: the `truemeds-doctor-portal-prototype` project folder (working prototype + its own `project_truth.md` / `open_questions.md`) and an uploaded competitor walkthrough doc ("DocsStat App Basic Flow.docx" — PharmEasy's DocStat RMP app). DocStat's "Add New Prescription" multi-patient pattern and its full onboarding-to-operations flow (auth, go-online/offline, case assignment, reject reasons, final Rx document with RMP credentials) were used as concrete precedent for scoping the new Doctor Portal service.

Q2 decision: Doctor identity & anti-impersonation audit work is Discovery-only this quarter, not Build — user's explicit call, made while also greenlighting real auth/onboarding/credentialing/doc-generation work in the same quarter. I flagged this as a real gate risk (not just a paperwork one) and suggested binding login sessions to one credentialed doctor as a cheap interim guardrail folded into the auth work already being built.

Final v1 file: `Q2_Roadmap_Jul-Sep_v1.xlsx` in the Roadmap Creation folder — 23 initiative rows across Hard Gate (5) + Bet 1 OP→OD (4) + Bet 2 CPO (3) + Bet 3 Online Payments (5) + Bet 4 Trust & Retention (5) + Ring AI Pilot (1, tracked separately). Supersedes `Q2_Product_Roadmap_Draft.xlsx`.
