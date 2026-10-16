---
name: tm-chotu-projects
description: Mangesh's active projects (tm-chotu, probab-subs-persona TMEXP1, TMEXP3, TMEXP4 DCOE, tm-po-analytics, search-validator, marketing-analytics, tm-fraud-engine) + tminsights umbrella + cross-project stack patterns + knowledge-gap loop mechanism. Load when user asks about a specific project, "what's TMEXP4", "what's DCOE", "what projects are running", or how to push new knowledge into the plugin.
---

# Projects

## Mangesh's active projects (shareable)

| Project | Status | Repo / location | What it does |
|---|---|---|---|
| **tm-chotu** (this) | see `plugin.json` / CHANGELOG for current version | `gitlab.com:tm-exp/tm-chotu` | Claude Code plugin packaging full Truemeds knowledge for every employee. 20 skills + 5 commands. Caveman default, soft onboard wizard, Intent-First Protocol + back-by-proof, query-rigor HARD STOPs, a failure ledger (`tm-chotu-learnings`) and a PII register |
| **probab-subs-persona** (TMEXP1) | Active — 2026-04-06 last update | `~/Desktop/Truemeds /Claude/probab-subs-persona/` | Customer persona model (Gold/Silver/Bronze) + substitution probability across 5 FCs. Produces persona signals that DCOE consumes |
| **TMEXP3 algo hit** | Active probe pattern | `~/Desktop/Truemeds /Claude/` | Bulk `findBestSubForProducts` replay (~1k products × 5 warehouses, concurrency=10, rate=100/min). Validates sub-coverage across hubs |
| **TMEXP4 DCOE** | Active build — main at ~85% dashboard, §3 next (2026-05-15) | `~/Desktop/Truemeds /Claude/TMEXP4-DCOE/` | Dynamic Cohort Optimization Engine — multi-axis bandit (5 dimensions: LTV / `cm_net` / Lifecycle / Coupon / generic-share). M1 retention thesis (order-1 → order-2 within 30 days). Pipeline live, not yet powering production decisioning |
| **tm-po-analytics** | SHIPPED 2026-05-12 | `gitlab.com:tm-exp/tm-po-dashboard` | Faridabad inventory-adjustment dashboard. DuckDB + FastAPI + daily SES digest. 50/50 tests green |
| **search-validator** | v2 SHIPPED 2026-05-11 | `~/Desktop/Truemeds /Claude/` (under `tminsights/`) | Two-stage search validation (suggestions + results) vs Mixpanel ground truth. Replay-dual harness. Validates Search Engine PRD V1 implementation |
| **marketing-analytics** | Active — Google ready, Meta pending HEVO sync | `~/Desktop/Truemeds /Claude/tminsights/marketing-analytics/` | Paid-ad ROAS / CAC under `tminsights` umbrella. Uses DB 663 `maranalytics` schema. Burned a 132× wrong-total once via Redshift bigint division — taught us the `::numeric / 1000000.0` cast rule |
| **tm-fraud-engine** | **P1 SHIPPED & LIVE 2026-05-29** · all-channel since 2026-06-01 · SES prod 2026-06-12 | `gitlab.com:tm-exp/tm-fraud-engine` | Daily rule-based fraud detection for affiliate orders across **all channels (web/app/ios)**. Fraud/marketing team drops a curated scope file → engine scores every order against **24 signals** (9 families) over a 30-day customer-keyed substrate → CSV email (AWS SES) + colour-coded Google Sheet for ops feedback. **Architecture:** scoped-ELT — file-scope → indexed parallel raw fetch → DuckDB compute → score (`scope-file` mode; legacy `daily` full-scan retired). Runs on shared DCOE EC2 via **systemd timer 06:30 IST**. First prod file: **34.2% FRAUD** (4,549/13,312). 6 prod bugs caught across the build — all by live EC2 probes, none by unit tests (ARN, JSON secret, X-API-Key, MySQL CAST, 300s timeout, HTTP 202). Famous lesson: column-alias drift → 89.8% silent under-detection (`normalize.py` fix). All specs merged to `main`. **Next:** P2 AI augmentation gated on 7d-stable + 30d ops feedback. **⛔ tm-chotu scope:** reuse the 24-signal detection *logic* to find new frauds ad-hoc on trigger (via Metabase, DB 630/170) — tm-chotu does **NOT** run, deploy, trigger, or operate the engine on DCOE EC2. Full canonical detail → KD §15. |

## Substitution-quality workstream (Aug 2026)

| Project | Status | What it does |
|---|---|---|
| **Subs leakage validation** | Phase 1–3 done 2026-08 | Is the substitution algo pitching clinically-wrong subs? Root cause traced to the **runtime** selection path ("magnet fallback"), not the nightly precompute. Confirmed wrong subs do reach customers. Correctness contract, buckets and traps → `tm-chotu-modules` + `tm-chotu-joins` |
| **Subs daily scanner** | Banked, awaiting a scheduler | Productised the above as a 3-stage daily scan (Redshift `created_on` pull → local classify → live status enrich). Frozen regression fixture gates any logic change. Next step is a systemd timer on DCOE + a digest of open rows only |
| **Org-Subs engine validation** | Complete | Parity of the new runtime enrichment engine vs the stored per-hub Org-Subs tables. 98.56% substitution agreement; 2,282 genuinely lost substitutes escalated. Engine quirks → `tm-chotu-modules` |
| **Algo re-run after status 317** | Banked mid-analysis | Post-317 algo re-execution behaviour, traced through Mongo footprints. Found one internal account sweeping 2,369 orders in 106 minutes on a single day |

## Data-governance workstream (Aug 2026)

| Project | Status | What it does |
|---|---|---|
| **PII grant remediation** | In progress, 7 open items | Prod MySQL CDC users moved off blanket `SELECT` onto the `tm_view_nopii` role; six confirmed plaintext-PII leaks revoked. Register + handling rules → `tm-chotu-pii-register` |
| **Redshift DB 170 DE handover** | Handed over 2026-08-13 | DE team took ownership; three `sys:superuser` grants issued, and `customer_details` was emptied without a backup. Consequences for anyone querying 170 → `tm-chotu-data-sources` |

## Project umbrellas

| Umbrella | Repo | Scope |
|---|---|---|
| **tminsights** | `gitlab.com:tm-exp/tminsights` | Default home for analytics projects — EXCEPT `tm-po-analytics` (moved out 2026-05-12 after divergence). Currently hosts: marketing-analytics, search-validator |
| **tm-po-analytics standalone** | `gitlab.com:tm-exp/tm-po-dashboard` | Faridabad inventory dashboard repo (moved out of umbrella after divergence) |

## Stack / patterns adopted across projects

- **Subagent-driven plan execution** — all plan execution via `superpowers:subagent-driven-development`, never inline executing-plans
- **Feature-branch always** — implementation on `impl/<phase>-<feature>`, never main; never worktrees unless asked
- **Pre-install deps in main session** — never let subagent run pip/brew
- **Metabase MCP primary** for tm-po-analytics; direct DB deprecated
- **DB 170 (Redshift) default** for tm-chotu (shared); DB 663 (Mangesh Redshift) is personal-scoped only; DB 630 for tm-po-analytics
- **No Claude attribution** in commits / docs — use neutral LLM phrasing

## "Everyone" projects (BAU + revamp tracker)

Placeholder. Pushed by analytics team via tm-chotu plugin updates.

**Update pattern (proposed):**

1. Analytics team author drafts entry as a skill-request file at `SKILL_REQUESTS/<YYYY-MM-DD>_<topic>.md` **inside the installed plugin folder** (find it with `claude plugin list`; it is versioned, e.g. `.../cache/tm-chotu/tm-chotu/<version>/`). ⚠️ That directory is **replaced on every update** — email the file to Mangesh the same day, don't leave it as your only copy
2. Mangesh (or designated reviewer) approves + folds into `KNOWLEDGE_DUMP.md`
3. Plugin version bumps (semver)
4. Users update per [UPDATE.md](../../UPDATE.md) — `claude plugin update tm-chotu@tm-chotu`, or unzip-over-parent for zip installs. **Not `git pull`** — that is not a supported install path

## Knowledge-gap loop (live mechanism)

When a question asked of tm-chotu doesn't match any loaded skill content:

1. Plugin drafts a skill-request markdown at `SKILL_REQUESTS/<YYYY-MM-DD>_<topic>.md` **inside the installed plugin folder** (find it with `claude plugin list`; it is versioned, e.g. `.../cache/tm-chotu/tm-chotu/<version>/`). ⚠️ That directory is **replaced on every update** — email the file to Mangesh the same day, don't leave it as your only copy
2. Prompts user: "Email this to Mangesh"
3. Analytics team beefs up plugin → ships a new version; users update per UPDATE.md

This grows the plugin's knowledge over time without every user needing to be an analytics person.
