# Loop Report: PRD Review Round 1 and next steps

## Round 1 status

**Completed:** Codex reviewed v0.1, identified 12 findings (2 P0, 9 P1, 1 P2). Triage in `merge-round-1.md`.

**Check result:** Pre-check: 17/17 PASS. Post-apply check: 17/17 PASS.

**Version:** Bumped v0.1 → v0.2 (9 Nov 2026).

## Findings by verdict

| Verdict | Count | Details |
|---------|-------|---------|
| ADOPT | 5 | 1 P2 (Cat4/Pilot clarity in §2); 4 P1 (callback/unavailable wording §5.7; Help placeholder §6; OTP mock values §7; late-record moved to decided §10) |
| REJECT | 1 | P1 repeated rules (agreed structure: summary may repeat; §3 is not summary) |
| NEEDS-APURVA | 5 | 2 P0 (gate contradictions: confirm before gate validity; live Pilot vs post-call authority); settings owners unconfirmed; old-PRD product constraints disposition; metrics definitions |
| OUT-OF-SCOPE | 1 | Prescribing controls (belong in eng spec, not PRD) |

## Changes applied (Round 1)

1. **§2:** Added "The system routes each order to either a direct doctor call (Cat4 case) or a doctor call followed by a Health Advisor (Pilot case)" to explain case types at first mention.
2. **§5.7:** Changed "Callback or Unavailable when..." to separate availability: "Callback when the call was too short or no result came; Patient unavailable when no result came."
3. **§6:** Updated Help rule from promise to acknowledgement: "In this release Help is a blank placeholder; later it will be how a doctor reaches Doctor Ops when something keeps failing."
4. **§7:** Marked OTP resend waits and failed unlock attempts as `[MOCK]` instead of `[working default]` to flag they are temporary prototype values.
5. **§10:** Moved late-record gate rule from "Open" to "Decided" section with the actual behavior: "A call record arriving late and showing time under the gate: the case goes on hold for retry, the doctor isn't paid, and the mismatch is logged."

## NEEDS-APURVA items (blocking further rounds)

1. **P0: Confirm button before gate validity** — §5.7 rule says "the app never shows Confirm" before gate; table shows no-result path offers Confirm before record proves validity. The frozen flow confirms this is intentional (recovery path). PRD needs explicit statement that unproven confirms are allowed in no-result paths, or rule must be reworded.

2. **P0: Gate authority contradiction** — §5.7 suggests partner duration proves the gate universally. Frozen sources say: live Pilot gate uses patient-answer timestamp (authoritative while live); partner duration stored for post-call reporting only. Critical for button timing and auth delegation. Needs clarification: which gate (live Pilot vs all post-call confirms) requires which proof.

3. **Settings owners** — §7 treats proposed owners (Claude) as agreed ("set by its owner"). TRACE.md line 85 explicitly says approval pending. Confirm which roles own which settings.

4. **Old-PRD product constraints** — Patient-number masking, call recording scope, Super Doctor role system have no explicit disposition (kept, dropped, or raised as open). Codex flagged this as incomplete scope accounting per checklist #24. Clarify.

5. **Metrics definitions** — "Release rate per doctor", "patient-unavailable rate", "time to outcome" remain ambiguous even as [NEED] proposals. Who is the denominator? Does waiting for record count as outcome? Can OTP-free sessions be counted under faster-sign-in adoption? Tighten definitions for unambiguous reporting.

## Rejected findings (no action needed)

- **P1: Repeated rules in §3** — Codex flagged pull-only, click-to-call, proof-before-count, and system-selected buttons as recurring outside home sections. Agreed structure allows brief summary repetition; §3 scope and calling sections' rule homes legitimately restate these. No change.

## Out-of-scope findings

- **P1: Prescribing controls (schedule, duration, food timing)** — These are documented in app-logic §8, rows 240–243. PRD correctly links to app-logic. They belong in Engineering spec and test cases per scope, not restated here.

## Stopping point

**Do not proceed to round 2 until P0s are resolved.** Both P0 findings are product contradictions that need Apurva's explicit decision on calling gate authority and confirm-before-gate rules. Codex cannot resolve these without new product direction.

## Next steps for Apurva

1. Review the two P0 gate contradictions (full detail in `merge-round-1.md`, tied to §5.7 and calling-flow/data.js).
2. Confirm settings owners (§7).
3. Clarify disposition of old-PRD product constraints (kept/dropped/raised).
4. Tighten metrics definitions (§11).
5. Once decided: either confirm the decisions here, or return to Codex for round 2 focused on those points.

---

**PRD is at v0.2, checks pass, loop stalled awaiting product decisions. Ready for Apurva review.**

