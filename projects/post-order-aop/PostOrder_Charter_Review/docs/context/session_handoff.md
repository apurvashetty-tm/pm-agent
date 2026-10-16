# Session Handoff — Vivek Post-Order Charter Review (AOP-style)

**Updated:** 2026-08-13
**Current phase:** Discussion / brainstorm in progress. Nothing drafted into a deck yet.
**Meeting:** Thursday 2026-08-14 (tomorrow). Vivek's email, calendar invite from Prasun. Slot is being imposed, not negotiated — many stakeholders.

Resume from here unless the user gives newer instructions.

---

## 1. What this is

Not the JAS Q2 roadmap (that project is separately shipped/closed — see `projects/Roadmap/Q2_JAS_Stakeholder_Roadmap/`, referenced project-root-relative since this file now lives under `projects/post-order-aop/`, a sibling of `projects/Roadmap/`, not a child of it). This is a new, bigger ask from Vivek: org-effectiveness review of the **whole Post-Order charter** (Payments, Portals, Discards, Analytics — full FY, AOP-style), investment (₹19.5 Cr/year payroll across eng/product/analytics for the charter) vs business impact/ROI.

**Moved 2026-08-13:** this folder was renamed from `Vivek_AOP_PostOrder_Review` and relocated from `projects/Roadmap/` to `projects/post-order-aop/PostOrder_Charter_Review/`. Reason: this is charter-wide AOP work with its own cadence and eventual per-portal vision spinoffs, not a quarterly roadmap artifact. Stated intent (not yet executed): eventually `projects/Roadmap/` itself may nest under `projects/post-order-aop/`, once the AOP container has more than one thing in it — quarterly roadmaps becoming sub-folders from an AOP standpoint, not siblings of it. See `../../README.md` for current project layout.

**Vivek's 4 agenda items:**
1. Priorities across all PoDs under Post-Order charter (short + long term)
2. Business impact — quantitative and qualitative
3. Current and upcoming Post-Order project pipeline
4. Numbers: cost vs. value generated, how to sharpen ROI going forward

**User's (Apurva's) scope only** — Anbu (manager) is stitching the full multi-PoD charter together; Apurva only owns his own PoD's slice:
- Payments
- Portals
- **Discards — fully owned by Apurva** (his to answer "how do we reduce this")
- CPO — a target he can move, not something he fully owns end-to-end

---

## 2. Apurva's raw metric table (as given, 2026-08-13)

| Metric | March '26 | Today | March '27 (target) |
|---|---|---|---|
| Doctor CPO | ₹16.00 | ₹16.00 | ₹14.00 |
| HA CPO | ₹12.00 | ₹9.00 | ₹8.00 |
| CSR CPO | ₹18.00 | ₹14.00 | ₹7.00 |
| Pill Reminder CPO | – | – | – |
| Assisted Commerce CPO | ₹8.24 | ₹8.24 | ₹6.00 |
| Subs % | 4% | 3.50% | 5% |
| Assisted Commerce Cart converts | 2.40% | 2.40% | 4% |
| Type 1 Order CPO | – | – | – |
| Type 1 Order Contribution | – | – | – |
| OP → OD | – | 76.60% | 80% |

Blanks (Pill Reminder CPO, Type 1 Order CPO/Contribution) are **intentional** — no data, not an oversight.

---

## 3. Cross-check against canonical files (JAS project's `evidence_register.md` / `project_truth.md`) — findings so far

| Metric | Finding |
|---|---|
| CSR CPO | Today ₹14 matches `BASE-07` exactly. Confirmed **two owning initiatives**: INIT-06 (CSR Voicebot Phase 2) + INIT-08 (Returns & Refunds Transformation) — R&R calls (~1,500 inbound + ~400 outbound, `BASE-12`) land on CSR too. **Decision: club into one combined ₹7 target, not split.** ₹7 is more defensible as Voicebot+R&R combined than as Voicebot alone (old Voicebot-only hypothesis `HYP-02` was only ₹9). |
| Doctor CPO | ₹16/₹14 (Apurva's table) vs ₹23.84 (`BASE-02`, May) — **not a conflict**, different denominators. ₹16 = blended across *all delivered orders*. ₹23.84 = cost per doctor-*call* only (narrower base). Both legitimate; must name the base whenever quoted. **Decision: do NOT quote a Doctor CPO target number tomorrow at all** — effort-vs-impact for Doctor-side cost reduction isn't understood yet, and project rule already says don't frame Doctor cost as a simple lever (Doctors are external supply paid per confirmation, not payroll). |
| Doctor bucket — qualitative only | Talking points instead of a number: **MyRx 3rd-party integration** (real, already an open item — manual-assisted POC/Postman bulk-runner stage, system integration only after validation), **prescription generation** (already Q2-scoped/Delivery-committed under Compliance hard gate), **Doctor language preference** (new idea from Apurva, not in any initiative list — flag as raw/unscoped if raised). None of the three has a proven CPO story — quality/access/compliance levers, not cost levers. |
| Assisted Commerce CPO | ₹8.24 matches this session's own derived calc (₹50L fixed cost ÷ 607,012 March total orders) — solid, traceable. Owner: INIT-01 (Ring AI Cart Recovery), single owner. |
| Subs % | No conflict, new number, single owner INIT-05 (Personalised HA Substitution). |
| HA CPO | **No owning initiative in the current 11-item pipeline.** Confirmed gap — not yet resolved, not discussed further yet. |
| Pill Reminder CPO, Type 1 Order CPO/Contribution | **No initiative in the pipeline covers either.** Genuinely uninstrumented — ties to `DR-02` (Finance CPO definition pack still open). Say this plainly to Vivek rather than inventing a number or an initiative. |
| OP → OD | New number (76.60% → 80%), not yet in the evidence register. Apurva's own framing: driven mainly by (a) Discards and (b) Cancellations/RTO at cart checkout — this matches the locked outcome tree exactly (Discard rate pre-warehouse, Cancellation rate post-warehouse, RTO downstream guardrail, all off total placed orders). Two owners: |
| — Discards | INIT-04 (Discard Intelligence). **Important: this initiative is diagnostic-only this quarter** — locked in `project_truth.md` and on the evidence register's prohibited-claims list as "must not be sold as immediate discard reduction." Since Discards is fully Apurva's, the honest pitch tomorrow is "building attribution to find the biggest levers," not "here's how we cut discards" — that reduction initiative doesn't exist in the pipeline yet. |
| — Cancellations/RTO at checkout | INIT-02 (Checkout & Payment Journey Transformation). Live and correctly targeted, but hypothesis-stage: RTO baseline ₹3.45/order CPO (`BASE-10`), register says "payment-at-cart cohort must prove effect" — not yet proven. |

---

## 4. Full initiative mapping (locked so far)

| Metric | Initiative(s) |
|---|---|
| Doctor CPO | (no number quoted; qualitative only — see above) |
| HA CPO | **gap — no owner** |
| CSR CPO | INIT-06 + INIT-08 (combined ₹7 target) |
| Pill Reminder CPO | **gap — no owner** |
| Assisted Commerce CPO + Cart converts | INIT-01 |
| Subs % | INIT-05 |
| Type 1 Order CPO/Contribution | **gap — no owner** |
| OP → OD | INIT-02 (cancellation/RTO) + INIT-04 (discards, diagnostic-only) + INIT-03 (High-Intent Reconnection, not yet discussed in this thread but already mapped earlier) |

---

## 5. Blockers / open items

- **Metabase MCP is broken** — confirmed earlier same session. `tm-chotu` plugin v0.1.20 ships an empty `.mcp.json` (`mcpServers: {}`), despite its own INSTALL.md claiming auto-wire. Cannot pull/verify live numbers (e.g. fresh discard root-cause breakdown) through Claude tonight. Needs either a manual `claude mcp add` workaround, or Mangesh/IT fixing the plugin's `.mcp.json` upstream.
- **HA CPO** — not yet discussed which initiative (if any) should own it, or whether it's presented as a gap like Pill Reminder/Type 1.
- **Discard root-cause data for tomorrow** — was asked whether Apurva has another path (ops team export, existing dashboard) since Metabase is down tonight. Not yet answered.
- **Output format** — asked twice, not yet answered: slide/deck vs one-pager vs just talking points for the actual meeting.
- **₹19.5 Cr/year framing** — that figure is Post-Order-charter-wide (Payments+Portals+Analytics+Eng+Product), not Apurva's slice alone. Capacity truth already on file in the JAS project (`CAP-01`–`CAP-06`: 6 engineers split 2 Payment/4 Portal, 1 SPM, 1 eng lead, 1 SBA+1BA) could support a rough headcount-based slice if Apurva wants to speak to "his share" of the investment, but this hasn't been discussed yet and shouldn't be invented without Finance/Anbu sign-off.

---

## 6. Next step when resuming

Pick up at: HA CPO ownership discussion, then decide output format, then (if time allows before the meeting) draft the actual one-pager/talking points using everything locked in section 3–4 above. Do not draft into any file until Apurva explicitly says go — this mirrors the JAS project's own rule (discuss a section fully before writing it).
