# Parked: allocation logic from other modules (NOT Type 1)

Parked 2026-10-08 on user instruction: **do not mix other modules' allocation into Type 1.** Kept for reference only; nothing here applies to the Type 1 queue unless you explicitly bring it in.

| Module | What the repo says | Source |
|---|---|---|
| Doctor pool | NFS highest → Rank-Up → live LIFO → backlog FIFO; 4-min call window; hold pool (cap 20); T+1/T+2 to Max Attempt Team; alerts every 2 h / 5+ pending; 08:00–22:00 operational hours; availability flag | HGS PRD + SOPs; Project South project_truth §11 |
| ACOM cart leads | `final_score = aov × connected × converted × substitution_possible` (matched 100/100 sample rows); `ORDER BY final_score, order_value`; `rank_again_after` cool-off; FTC > ₹700 first | `projects/ACOM/` |
| Oration AI | Can't trigger rank-up; promises "callback within 4 hours"; PPE-199 to expose a Rank-Up API | `knowledge/context/oration-ai-voicebot.md` |
| Order-level status | `368 ORDER UNASSIGN BY SCHEDULER`, `386/387 CHECK AVAILABILITY` (module not specified) | tm-chotu tables-enums |
