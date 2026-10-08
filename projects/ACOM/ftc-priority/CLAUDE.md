# Context primer — ACOM × FTC Priority

*Scoped `CLAUDE.md` for this project folder. Fast onboarding for any agent working on this project: current state, the rules of the road, and where the detail lives.*

## Workspace memory

Before project-specific work, also read:
- `../../../AGENTS.md`
- `../../../context/Claude.md`
- relevant files in `../../../knowledge/context/`
- `../CLAUDE.md` (ACOM umbrella — the cart-recovery problem this initiative serves, and its sibling initiatives)

Use project-local files for project truth and handoff. Use root knowledge files only for reusable company/system context.

## What this is
Quick-win change to the **current BAU cart-recovery process** — independent of
`ring-ai/`, ships **before** it. Not a new vendor, not a new build track: one
extra lead-selection query in front of the existing "Assign Order" query, so
FTC carts are served before the BAU queue.

Status: **spec complete, in review.** Canonical spec: **`docs/ftc-priority-prd.md`**
(also on Confluence — see Pointers).

## Locked decisions
- **FTC signal = `iod.is_ftc`.** Derived from `order_details` with additional
  run-time computation; derivation undocumented and unvalidated against the
  canonical FTC definition (first *delivered* order). **Accepted as-is** with a
  written call-out. Supersedes the earlier working definition (zero delivered
  orders in `order_details`) — we are not computing FTC ourselves.
- **Threshold = `order_value > 700`, hardcoded.** Changing it requires a
  deployment. Deliberate, to keep the build to one release.
- **Two queries.** Query 1 (FTC priority) → 0 rows → Query 2 (BAU, unchanged).
- **All agents get FTC-first.** No dedicated FTC agent pool, no agent categorisation.
- **The threshold is the only throttle.** No cap, no ratio, no counter.
- **Re-attempts:** existing hold-order behaviour, inherited. Nothing built.
- **Manual Google Sheet calling stops once live** — portal verified first, so
  there is no coverage gap on cutover.

## Why ₹700
Two independent legs, both in PRD §3: the **delivery-fee floor** (no delivery fee
above ₹550; ₹700 leaves buffer for cart shrinkage) and **agent capacity**
(~2,300 carts/day ≈ 23% of dials, morning backlog cleared in ~1.5–2 hrs instead
of ~7). Treated as a **starting point** — Analytics to re-derive it from
bucket-level conversion probability across the full AOV range.

## Guardrails — do NOT do these (settled)
- **Don't modify the BAU query** — it is the unchanged Step-2 fallback.
- **Don't add a cap, ratio or counter** — the threshold does the throttling.
- **Don't build retry/re-attempt logic** — hold-order already covers it.
- **Don't make the threshold configurable in this phase** — that is Phase 2, a
  separate Jira raised after Phase 1 ships.
- **Don't bring Ring AI into this project's docs** — decided in review; the two
  initiatives are kept separate for now.
- **Don't attribute claims to a team** in the PRD ("Engineering has confirmed…") —
  state the fact, or list it as an open question.
- **Never sync to Confluence/Atlassian unless explicitly told "sync."**

## Open questions
Tracked in PRD §8 — NFTC "starved" threshold, live confirmation of the ~2,300/day
volume, bucket-level conversion model, `final_score` composition, Metabase cards.

## Pointers
- Spec (source of truth) → `docs/ftc-priority-prd.md`
- Confluence: *ACOM — FTC Priority* (page 1981251599, space PROD) —
  generated from the markdown; markdown wins on conflict
- Current-process reference (read-only) → `../ring-ai/CLAUDE.md`
- ACOM umbrella → `../CLAUDE.md`
