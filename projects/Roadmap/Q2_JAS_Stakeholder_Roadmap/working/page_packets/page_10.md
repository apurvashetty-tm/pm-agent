# Page 10 Packet - Measurement Maturity and Analytics Contract

## 1. Status and freeze condition

- **Packet status:** FROZEN BASELINE (`DEC-01`, 2026-07-14).
- **Draft release:** Requires recorded post-freeze source SHA and explicit Phase 5 launch.
- **Ownership condition:** Analytics/Finance owners and dates may remain visibly TBD in draft; agents must not assign them.

## 2. Page job

Separate what is currently known from what remains unmeasurable, then show which Analytics/Finance products unlock decisions. Give Discard Intelligence diagnostic prominence because aggregate Discard/Cancellation/RTO views exist but do not reveal controllable discard levers.

## 3. Single CEO takeaway

Q2 becomes measurable only when Analytics and Finance turn aggregate signals into owned definitions, controllable discard levers, and initiative proof.

## 4. Narrative role

- **Before:** Page 9 establishes measurement and operating foundations.
- **This page:** Converts unknowns into prioritized data products and decisions unlocked.
- **After:** Page 11 uses those definitions, estimates, and dependencies to support credible sequencing.

## 5. Content blocks

1. **Known today**
   - Aggregate Discard, Cancellation, and RTO views exist.
   - Several working cost/demand baselines exist, with unresolved definitions or periods.
   - Q1 evidence shows uneven measurement maturity.
2. **Must become diagnosable**
   - Highlight Discards: journey stage, payment method/state/return path, category, customer/call cohort, root cause, recoverability, value, and owner (`DR-03`).
   - Keep Cancellations/RTO as downstream outcomes/guardrails, not equal controllable levers.
3. **Measurement contract**
   - P0 definitions and proof products: `DR-01` to `DR-08`.
   - P1 cohort/foundation proof: `DR-09` to `DR-15`.
   - Show owner/date and decision unlocked; current owner/date fields remain TBD.

## 6. Initiative scope

- This is portfolio measurement page, not another initiative portfolio.
- `INIT-04` Discard Intelligence receives diagnostic emphasis because it creates controllable-lever visibility.
- Other initiatives may appear only as measurement rows or proof dependencies; do not remap them.

## 7. Evidence allowed

| ID | Allowed use | Caveat |
|---|---|---|
| `DR-01` | OP -> OD definition/baseline requirement. | Open; numerator, denominator, cohort, cut-off, attribution unresolved. |
| `DR-02` | Finance-approved CPO definition pack. | Open; needed for comparable initiative economics. |
| `DR-03` | Discard diagnostic dataset and lever discovery. | P0; first outcome is actionable attribution, not immediate discard reduction. |
| `DR-04` to `DR-08` | Payment, contact/friction, Voicebot, Doctor, and R&R P0 proof products. | Owners/dates remain TBD. |
| `DR-09` to `DR-15` | Initiative cohorts, Wallet, incident/configuration, and Trust-measure P1 products. | Priorities are proposed; no delivery commitment. |
| `BASE-07`, `HYP-02`, `BASE-12`, `BASE-13` | Examples of working evidence requiring definition/validation. | Use only if status and caveat remain visible; avoid turning page into baseline catalogue. Capacity evidence belongs on Page 11. |

## 8. Unknowns and decisions

| ID | Open item | What it blocks |
|---|---|---|
| `DEC-01` | Formal structure/takeaway freeze. | Resolved; source SHA and Phase 5 launch remain. |
| `DEC-04` / `DR-15` | Trust metric model. | Trust representation on Pages 4, 8, and 10. |
| `DR-01` to `DR-08` | P0 definitions and baselines. | Headline measurement and primary initiative proof. |
| `DR-09` to `DR-15` | P1 cohort/foundation proof. | Scale/iterate/stop and capacity cases. |
| `EXE-04` | Named Analytics/Operations capacity. | Delivery credibility for measurement contract and Page 11. |

## 9. Visual

- **Primary:** Compact `Known | Unknown / data product | Decision unlocked` table, with Discards visually highlighted.
- **Optional alternative:** Three-step measurement ladder: aggregate outcome -> diagnostic attribution -> decision/owner, provided Discard dimensions remain decision-useful rather than schema-heavy.

## 10. Failure modes and exclusions

- Presenting aggregate Discard/Cancellation/RTO totals as actionable attribution.
- Giving Cancellations/RTO equal status as primary controllable lever.
- Turning Discard row into detailed event/data schema.
- Listing every requested field in tiny text or creating 15 equal-priority cards.
- Assigning Analytics owners or dates not present in canonical files.
- Treating P0/P1 priority as delivered commitment.
- Claiming Discard Intelligence itself immediately reduces discards.
- Hiding unknowns to make roadmap appear more certain.

## 11. Creative freedom

Writer may group data requests by outcome, decision, or priority; may compress P1 rows; may propose a sharper Analytics-contract visual. Writer must preserve `DR-03` emphasis, known/unknown distinction, stable IDs, and decision-unlocked logic.

## 12. Draft exit criteria

- Page distinguishes known, unknown, and decision unlocked.
- Discards receive diagnostic depth without data-schema overload.
- P0 `DR-01` to `DR-08` remain visible or traceable.
- P1 `DR-09` to `DR-15` are grouped without implying equal immediacy.
- Owners/dates remain TBD unless canonical files change.
- No unsupported baseline, metric, or delivery commitment appears.
