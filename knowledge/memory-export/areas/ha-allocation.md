<!-- memory path: /areas/ha-allocation.md · last updated in memory: 2026-10-24 -->
---
name: ha-allocation
description: Apurva's planned relook at how Health Advisors (HAs) are allocated for Pilot cases at Truemeds; read when HA allocation, transfers or failed-transfer callbacks come up
sources: [cowork]
aliases: [ha allocation, health advisor allocation]
---
- [stated] Plans to relook at the complete allocation of HAs: today Pilot-dedicated HAs click Assign and wait 60 seconds for a live transfer, else get a failed-transfer order — this hurts transfer numbers and failed-transfer callback TAT. Separate from the [[doctor-portal]] project.
- [stated] Wants to ask Engineering whether an HA can be reserved at the start of the doctor call to raise transfers; ~35% of single-call-flow (Ozonetel) orders currently drop to two calls because no HA is free.
- [stated] Cat4 (doctor-only) calls run on Knowlarity; Pilot single-call-flow orders run on Ozonetel; when Ozonetel is down they switch to Knowlarity and transfers don't work.
