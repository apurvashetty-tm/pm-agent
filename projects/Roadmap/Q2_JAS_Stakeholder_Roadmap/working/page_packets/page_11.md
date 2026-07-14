# Page 11 Packet - Execution Plan and Capacity

## 1. Status and freeze condition

- **Packet status:** FROZEN wireframe/job/takeaway; user-supplied working lifecycle and capacity inputs are now populated.
- **Draft release:** Structurally eligible for a visibly provisional working-plan draft after the updated canonical source SHA is recorded. It is not commitment-ready.
- **Timing condition:** July/August/September phases may appear only as `USER-SUPPLIED WORKING PLAN`. Do not imply committed dates, owners, or capacity validation while the open portions of `EXE-01` to `EXE-06` remain unresolved.

## 2. Page job

Show initiative lifecycle and decision gates across July-August-September without confusing whiteboard staffing shorthand with portfolio roadmap. Make the supplied sequencing and its gates visible; do not imply eleven simultaneous July starts or count the engineering lead as delivery capacity.

## 3. Single CEO takeaway

CEO sees how each initiative advances across Q2 without confusing resource allocation with initiative lifecycle.

## 4. Narrative role

- **Before:** Page 10 defines measurement and ownership needed for proof.
- **This page:** Converts user-supplied priorities and working lifecycle hypotheses into a visibly gated portfolio sequence.
- **After:** Page 12 asks for unresolved leadership decisions exposed by execution plan.

## 5. Content blocks

1. **Outcome-grouped initiative lifecycle**
   - Rows grouped under Order Completion, Cost to Serve, Trust, and enabling Foundations.
   - July/August/September phases use the working plan in Section 6 and remain explicitly uncommitted.
2. **September decision gates**
   - Each initiative needs decision criterion such as scale, iterate, stop, continue, or next milestone.
   - Replace generic `Scale` labels with evidence-based scale/iterate/stop, continuation, or next-milestone gates.
3. **Capacity and portfolio cut line**
   - Show validated capacity only in compact footer.
   - Make Payment, Analytics/Ops, vendor, and sequencing gates visible.
   - Use two or three explicit cut-line callouts instead of a blank `What pauses` column.

## 6. Initiative scope

Use all 11 initiatives once, grouped by locked primary home:

- **Improve Order Completion:** `INIT-01` Ring AI Cart Recovery; `INIT-02` Checkout & Payment Journey Transformation; `INIT-03` High-Intent Reconnection Journey; `INIT-04` Discard Intelligence; `INIT-05` Personalised HA Substitution.
- **Reduce Cost to Serve:** `INIT-06` CSR Voicebot Phase 2.
- **Build Customer Trust:** `INIT-07` TM Wallet Trust Revamp; `INIT-08` Returns & Refunds Transformation.
- **Platform & Product Foundations:** `INIT-09` Doctor Experience Platform; `INIT-10` Customer Friction Intelligence & CRM; `INIT-11` Core Configuration & Controls.

Primary proof mapping for September gates: `INIT-01` -> `DR-09`; `INIT-02` -> `DR-04`/`DR-01`; `INIT-03` -> `DR-10`; `INIT-04` -> `DR-03`; `INIT-05` -> `DR-11`; `INIT-06` -> `DR-06`/`DR-02`; `INIT-07` -> `DR-12`; `INIT-08` -> `DR-08`; `INIT-09` -> `DR-07`; `INIT-10` -> `DR-05`; `INIT-11` -> `DR-14`. `DR-13` supports incident/capacity evidence across Foundations.

Names may repeat from Page 5 because this page shows lifecycle, but no initiative may change primary home. Engineer/stream allocation belongs in internal evidence matrix or appendix, never core CEO visual.

Working lifecycle supplied by Product and refined into evidence gates:

| Initiative | Priority / size | July | August | September | September gate |
|---|---|---|---|---|---|
| Ring AI Cart Recovery | P0 / M | Build, gated by external-vendor readiness | Controlled pilot | Measure production cohort | Scale / iterate / stop versus POC |
| Checkout & Payment Journey | P0 / XL | Discovery, architecture, baseline definition | Build, gated by Payment + Frontend capacity | Controlled pilot and readout | Confirm next rollout or iterate |
| High-Intent Reconnection | P1 / L | Discovery | Gated MVP build/pilot | Measure reconnect-to-delivery | Scale / iterate / defer |
| Discard Intelligence | P0 / TBD | Lock taxonomy and attribution MVP | Diagnostic cuts and lever sizing | Prioritised lever pipeline / first fix candidate | Accept attribution and prioritise controllable lever |
| Personalised HA Substitution | P1 / M | No active phase | Discovery | Gated MVP build | Pilot-ready / carry forward |
| CSR Voicebot Phase 2 | P0 / M | Build | Controlled pilot and enhancement | Measure CPO bridge and quality | Scale / iterate |
| TM Wallet Trust Revamp | P1 / L | No active phase | Discovery/readiness after High-Intent | Gated MVP build/pilot if Payment capacity clears | Correctness / adoption / continue |
| Returns & Refunds | P0 / XXL | Journey/funnel discovery and bounded Phase 1 scope | Gated build/pilot of one bounded milestone | Controlled pilot / next milestone | Decide next automation milestone |
| Doctor Experience Platform | P0 / XL | Discovery | Build first workflow slice | Controlled pilot | Effort / quality / compliance readout |
| Customer Friction Intelligence & CRM | P1 / XXL | No active phase | Workflow and vendor discovery | Implementation readiness or narrow pilot | Vendor / scope decision |
| Core Configuration & Controls | P0 / L | Build first controls | Pilot / expand if stable | Measure and decide next control set | Continue / expand |

Required cut-line callouts:

- Two Payment engineers: Checkout and one bounded R&R Phase 1 milestone may begin in parallel; TM Wallet follows when a lane clears.
- Doctor Experience is P0. High-Intent precedes TM Wallet in the product discovery sequence; remaining P1 work stays gated.
- One SBA + one BA are available; exact allocation across Discard Intelligence and the wider measurement queue remains open.

## 7. Evidence allowed

| ID | Allowed use | Caveat |
|---|---|---|
| `CAP-01` | Confirmed working count: 6 delivery engineers. | `USER-SUPPLIED`; no seventh delivery engineer. |
| `CAP-02` | Confirmed working split: 2 Payment + 4 Portal/Platform. | `USER-SUPPLIED`; named initiative allocation remains open. |
| `CAP-03` | Confirmed working product model: 1 SPM; 0 execution PM/APM. | `USER-SUPPLIED`; future support model remains a decision. |
| `CAP-04` | Working grade mix: 4 SDE2 + 2 SDE1. | Internal context only; validate before CEO use. |
| `CAP-05` | Engineering lead oversees and supports solutioning. | `USER-SUPPLIED`; do not count as delivery capacity. |
| `CAP-06` | 1 SBA + 1 BA available for Analytics/Ops support. | `USER-SUPPLIED`; named allocation, queue, and dates remain open. |
| `DR-01` to `DR-14` | Headline definitions plus initiative/foundation evidence for scale or milestone gates, using mapping in Section 6. | Open; proof products define decision criteria but do not establish calendar timing. `EXE-02` owns timing/phase evidence. |
| `EXE-01` to `EXE-06` | Current work, estimates, owners, dependencies, trade-offs, capacity. | Open portions are required before any working phase becomes a delivery commitment. |

## 8. Unknowns and decisions

| ID | Open item | What it blocks |
|---|---|---|
| `DEC-01` | Formal structure/takeaway freeze. | Resolved. |
| `DEC-05` | Priority order and explicit trade-off rule. | **Partial:** P0/P1 and key sequence supplied; full capacity trade-off rule remains open. |
| `EVD-04` | Active roster, stream split, grades, lead status. | **Partial:** six-person split and lead-not-capacity resolved; grade mix and named allocation remain open. |
| `EXE-01` | Current in-flight work and completion state. | Starting point for lifecycle bars. |
| `EXE-02` | Estimate, dependency, owner, and September criterion per initiative phase. | **Partial:** working phases/sizes supplied; owners, confidence, several dependencies, and final criteria remain open. |
| `EXE-03` | What is displaced or deferred when each gated initiative starts. | Open; portfolio commitment credibility. |
| `EXE-04` | Analytics/Ops capacity. | **Partial:** 1 SBA + 1 BA identified; allocation, ownership, queue, and dates remain open. |
| `EXE-05` | Payment dependency for Wallet and R&R automation. | **Partial:** Checkout + bounded R&R may start in parallel; Wallet follows when capacity clears. Exact allocation remains open. |
| `EXE-06` | Juspay/PG and CRM vendor/commercial dependencies. | **Partial:** External Vendor and Frontend noted; commercial/readiness gates remain open. |
| `DR-01` to `DR-14` | Headline definitions and initiative/foundation proof products for evidence-based September gates. | Scale/iterate/stop or next-milestone criteria; not monthly timing by themselves. |

## 9. Visual

- **Primary:** Outcome-grouped initiative rows with July/August/September lifecycle phases and September decision column. Label the entire visual `USER-SUPPLIED WORKING PLAN - NOT COMMITMENT`.
- **Optional alternative:** Same grouped timeline using milestone gates rather than continuous bars. Any move away from monthly columns requires structural proposal.
- **Legend:** P0/P1 is priority, not commitment; sizes are uncalibrated; `Gated` depends on capacity/readiness; `No active phase` is deliberate sequencing; September is a decision point, not automatic scale.
- **Footer:** `6 delivery engineers (2 Payment + 4 Portal/Platform) + 1 engineering lead (oversight/solutioning; not delivery capacity) | 1 SBA + 1 BA | 1 SPM | 0 execution PM/APM`.

## 10. Failure modes and exclusions

- Showing engineer rows or converting whiteboard assignment shorthand into CEO roadmap.
- Starting every initiative in July or leaving September artificially empty.
- Presenting working phases as approved commitments or P0/P1 as delivery certainty.
- Counting the engineering lead as a seventh delivery engineer.
- Showing TM Wallet as a third concurrent Payment build alongside Checkout and R&R.
- Showing TM Wallet before High-Intent discovery or Doctor Experience as P1.
- Using generic September `Scale` without a production proof gate.
- Omitting the portfolio cut line when capacity fills.
- Ignoring Payment dependencies for Wallet/R&R or vendor dependency for CRM/Juspay.
- Turning page into detailed staffing plan or technical Gantt.

## 11. Creative freedom

Writer may vary bar/gate styling, hierarchy, and group layout while preserving the supplied lifecycle meaning. Writer may tighten labels but may not turn the working plan into commitment, invent named allocation, or remove unresolved gates.

## 12. Draft exit criteria

- All 11 initiatives appear once under locked primary homes.
- No engineer swimlanes appear.
- Every lifecycle phase traces to the user-supplied working plan and is visibly non-committed.
- The lead is excluded from the six-person delivery count.
- Checkout + bounded R&R parallelism and TM Wallet sequencing are visible.
- Doctor Experience is P0; High-Intent precedes TM Wallet.
- Each initiative has evidence-based September decision criterion before finalisation.
- Capacity footer is labelled `USER-SUPPLIED WORKING MODEL`.
- Portfolio cut line and critical dependencies are visible.
