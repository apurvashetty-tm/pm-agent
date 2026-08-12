# tm-chotu

Truemeds' chotu (छोटू = little helper). Claude Code plugin packaging full Truemeds knowledge for every employee — non-engineers included.

**Status:** v0.1.5 — Inventory + TAT skills shipped with locked, live-probe-verified content. 15 skills + 5 commands + 1 hook + 1 MCP.

## What it gives you

Every Claude Code session at Truemeds gets:

- **Caveman mode default** — short, technical, no filler
- **Soft onboarding wizard** — persona × mood × tool check × real test query, 90 seconds, with personality
- **Skill-aware routing** — your question auto-routes to the right knowledge area
- **Hard-stop query rigor** — rejects "all time" queries, sample-first pipeline, table-freshness verification
- **Knowledge gap loop** — when you ask something not loaded, plugin drafts a skill-request for the analytics team

## What's loaded

16 skills covering 13 sections:

| Skill | Covers |
|---|---|
| `tm-chotu-overview` | Truemeds biz model, 4.2M MAU, 5 FCs, ~₹76 cr/mo GMV, headline metrics |
| `tm-chotu-dcoe-cohorts` 🆕 | Derive DCOE cohort axes on Metabase alone (no DCOE instance): CM-high (`cm_net` formula + margin-proxy SQL), Generic Champions (`generic_share`), Coupon dependency, Substitution propensity + composite cohorts (Golden Geese) |
| `tm-chotu-functions` | 12 functions × sub-teams (Marketing×7, PM×5, CMT, Ops×9, CX×4 portals, Doctor×4 arms, Diagnostics, Tech, Finance, Legal/HR, Leadership) |
| `tm-chotu-customer` | DCOE 5-axis cohorts + Golden Geese, Gold/Silver/Bronze persona tiers, FTC compute-on-the-fly |
| `tm-chotu-business-flows` | Order lifecycle, AUTO-CONFIRM path, HA position, RTO chain (60→RTO-IT→RTD→reverse putaway), return flow |
| `tm-chotu-modules` | Search PRD + Substitution 6-step algo + Live Inv + 3 Picklist variants + 8 Putaway types + Logistics 13 partners + 6 portals + Diagnostics + Pincode Mapping |
| `tm-chotu-inventory` 🆕 | DB 180 PROD INVENTORY `product_inventory_data` is universal live-qty source (covers Vinculum-backed ANKW Faridabad too). 4-bucket reservation model (total / available / pending_consult / invoice / shipped). Layered stockout def. MFC vs FC via pincode JIT/BULK demand on `product_wh_avg_daily_tracker`. Cold chain at PINCODE level. 4 decommissioned WHs flagged (ids 3, 5, 7, 11). 5 PTS-restricted cols. |
| `tm-chotu-tat` 🆕 | `delivery_date_tracker` (DDT) canonical for promised-vs-actual. One row per order, `promised_*` set once + never changes, `metadata` JSON = full PDD audit. **Live network OTIF = 62.59%** (last 30d). Doctor 08:00–22:00, WH per-`warehouse_details`, courier `courier_partner_schedule`. WH processing 4-bucket grid (SDD/NON_SDD × INVENTORY/NON_INVENTORY). RTO chain across 6 master groups. Refund SLA per REFUND_TO. |
| `tm-chotu-data-sources` | 53 Metabase DBs in 8 buckets + decision tree (DB 170 shared default, DB 180 PROD INVENTORY for live qty, DB 432 Min Max Redshift for demand trackers) |
| `tm-chotu-tables-enums` | 96 ORDER STATUS codes + WORK FLOW + ORDER_TYPE + MEDICINE_STATUS + 20 smaller masters |
| `tm-chotu-joins` | 7 ready-to-run SQL recipes + join key reference + Redshift gotchas (bigint cast, LOWER trap, DB typos) |
| `tm-chotu-definitions` | 100+ canonical terms — FTC, GMV, TS, ROAS variants, CAC variants, Order Type 1/2/3, etc. |
| `tm-chotu-projects` | Mangesh's 8 active projects + tminsights umbrella + knowledge-gap loop |

Plus 3 behavioural skills (entry / mood-router / query-rigor) and 5 slash commands.

### `tm-chotu-query-rigor` upgrades in v0.1.3–v0.1.5

- **Schema-case HARD RULE** — MySQL = `TMMUMPSDB.` UPPERCASE / Redshift = `tmmumpsdb.` lowercase / DB 180 = `INVENTORY_SCHEMA.`. Wrong case → "Unknown database" error.
- **SELECT COUNT(*) before locking** — never use any table without verifying it has data. Caught: `scm_wh_stock_threshold_master` empty, `order_tat_base_model` stale.
- **Stale `warehouse_details.status`** — 4 WHs (ids 3, 5, 7, 11) decommissioned despite status=1. Use `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active=1` (32 truly active WHs).

## Install

See [INSTALL.md](./INSTALL.md) — repo is private GitLab, pick the path that matches your setup (SSH key / HTTPS+PAT / local zip).

Short version (assumes you have GitLab SSH access):

```bash
claude plugin marketplace add git@gitlab.com:tm-exp/tm-chotu.git
claude plugin install tm-chotu@tm-chotu
```

Restart Claude Code. On first session, `/tm-chotu-onboard` auto-fires.

**Don't have GitLab SSH access?** See INSTALL.md — Path B (HTTPS + Personal Access Token) or Path C (local zip from Mangesh).

## Requires

- Claude Code (latest)
- `superpowers` plugin (companion dep)
- Metabase account (OAuth handles auth — zero setup)
- Mixpanel account (each user connects own via Claude connector marketplace — see INSTALL.md)

## Token cost

~2.7k tokens always-on per session. Per-skill on-invoke: 0.25k–13.5k.

## Knowledge sources

- Whimsical bird's-eye view (full Truemeds product architecture)
- Search Engine PRD V1.2 (April 2026, Sujith Cheedella)
- probab-subs-persona ALGO_CONTEXT.md (6-step substitution algo, 5 FCs)
- TMEXP4 DCOE cohort definitions
- Live DB 170 probes verifying every table reference
- `m_system_value_master` sweep (200+ masters)
- `m_courier_partner_master` (13 3PL partners)

## Master reference

`KNOWLEDGE_DUMP.md` (in this repo) is the master document — every skill is lifted from there. Sections §1–§12 cover Overview / Functions / Customer / Business Flows / Modules / Data Sources / Tables & Enums / Joins / Definitions / Projects / **Inventory (§11, v0.1.3)** / **TAT (§12, v0.1.5)**. If you spot something wrong, redline that file and re-translate into the affected skill.

## Knowledge-gap loop

When you ask something the plugin doesn't know:

1. Plugin drafts a skill-request markdown at `SKILL_REQUESTS/<date>_<topic>.md`
2. You email it to the analytics team
3. Team ships a plugin update
4. You `claude plugin update tm-chotu`

This is how the plugin gets smarter over time.

## Contributing

Plugin-update PRs go to `git@gitlab.com:tm-exp/tm-chotu.git`. Reviewer = Mangesh. Cadence TBD (see § 10 of `KNOWLEDGE_DUMP.md`).

## License

UNLICENSED — Truemeds internal use only.
