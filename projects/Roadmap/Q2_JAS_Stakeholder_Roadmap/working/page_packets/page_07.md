# Page 07 Packet - Reduce Cost to Serve

## 1. Status and freeze condition

- **Packet status:** FROZEN BASELINE (`DEC-01`, 2026-07-14).
- **Draft release:** Requires recorded post-freeze source SHA and explicit Phase 5 launch.
- **Measurement condition:** `DR-02` and `DR-06` may remain open during drafting, but their uncertainty must remain visible. No target may be presented as achieved.

## 2. Page job

Show one direct Cost-to-Serve hypothesis: contain eligible CSR contacts through Voicebot Phase 2, then prove cost reduction without degrading resolution quality. Keep initiatives whose primary homes are Trust, Order Completion, or Foundations off this page.

## 3. Single CEO takeaway

Q2 will test whether safely containing eligible CSR contacts can move the working CSR CPO baseline from Rs14/order toward the Rs9/order hypothesis without degrading resolution quality.

## 4. Narrative role

- **Before:** Page 6 shows four Order Completion interventions plus one diagnostic capability.
- **This page:** Narrows Cost to Serve to one measurable hypothesis instead of collecting every initiative with secondary CPO impact.
- **After:** Page 8 moves to Trust, where Wallet and Returns & Refunds remain primary.

## 5. Content blocks

1. **Working baseline and aspiration**
   - CSR CPO working baseline.
   - Phase 2 CPO aspiration, labelled hypothesis.
2. **Mechanism to test**
   - Identify eligible contacts.
   - Contain suitable contacts through Voicebot.
   - Transfer non-eligible or unresolved contacts safely to humans.
3. **Proof and guardrails**
   - Finance-approved CPO bridge.
   - FCR, repeat contact, transfer, quality, and human minutes/cost avoided.

## 6. Initiative scope

- **Primary initiative:** `INIT-06` CSR Voicebot Phase 2.
- **Primary proof:** `DR-06`, interpreted with `DR-02`.
- **Secondary guardrails only:** FCR, repeat contacts, transfer rate, and service quality.
- Do not add R&R, Doctor Experience, TM Wallet, CRM, or other initiatives because they have secondary CPO effects.

## 7. Evidence allowed

| ID | Allowed use | Caveat |
|---|---|---|
| `BASE-07` | Working CSR CPO baseline: Rs14/order. | `USER-SUPPLIED`; period and exact denominator unknown. Requires `DR-02`. |
| `HYP-02` | Phase 2 aspiration: Rs9/order. | `HYPOTHESIS`; never describe as committed target, forecast, or result. Must connect to eligible containment and guardrails. |
| `DR-02` | Finance-approved CPO definition and comparable denominators. | Open; prevents clean cost comparison and double-counting claims. |
| `DR-06` | Voicebot cost bridge and safe-containment proof. | Open; must include containment, transfer, FCR, repeats, quality, and human-cost inputs. |

## 8. Unknowns and decisions

| ID | Open item | What it blocks |
|---|---|---|
| `DEC-01` | Formal page-sequence/takeaway freeze. | Resolved; source SHA and Phase 5 launch remain. |
| `DR-02` | Finance definition of CSR CPO and denominator. | Valid Rs14 baseline and comparable Rs9 aspiration. |
| `DR-06` | Eligible volume, containment, transfers, FCR, repeats, quality, human effort/cost. | Causal cost bridge and safe scale decision. |
| `EXE-04` | Named Analytics/Operations capacity. | Instrumentation and proof plan. |

## 9. Visual

- **Primary:** Single hypothesis bridge: working Rs14 baseline -> eligible-contact containment mechanism -> Rs9 aspiration, with guardrail band beneath.
- **Optional alternative:** Before/after unit-economics bridge with unresolved inputs visibly marked, provided it does not imply achieved savings.

## 10. Failure modes and exclusions

- Showing Rs14 -> Rs9 as delivered, approved, or forecast impact.
- Using whiteboard-only `22% -> 46%` notation; 46% is prohibited.
- Treating containment volume alone as cost or customer-quality proof.
- Pulling R&R, Doctor Experience, Wallet, or CRM into Cost to Serve.
- Adding L2 bot flows, intents, or PRD detail.
- Omitting FCR, repeats, transfers, or service-quality guardrails.

## 11. Creative freedom

Writer may change bridge geometry, labels, visual metaphor, and page title. Writer may challenge whether Rs14/Rs9 should dominate visual if caveats overwhelm clarity. Writer may not change initiative home, evidence posture, or hypothesis status.

## 12. Draft exit criteria

- `INIT-06` is only initiative shown as primary.
- Rs14 uses `BASE-07` caveat; Rs9 uses `HYP-02` label.
- `DR-02` and `DR-06` are explicit.
- Quality guardrails remain visible.
- No secondary-CPO initiative is duplicated here.
- Page communicates hypothesis, not result.
