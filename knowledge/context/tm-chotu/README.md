# tm-chotu

Truemeds' chotu (छोटू = little helper). Claude Code plugin packaging full Truemeds knowledge for every employee — non-engineers included.

**Status:** see `.claude-plugin/plugin.json` for the shipping version and [CHANGELOG.md](./CHANGELOG.md) for what changed. 20 skills + 5 commands + 1 SessionStart hook. **No bundled MCP** — Metabase is a per-user connector, see [Install](#install).

## What it gives you

Every Claude Code session at Truemeds gets:

- **Caveman mode default** — short, technical, no filler
- **Soft onboarding wizard** — persona × mood × tool check × real test query, 90 seconds, with personality
- **Skill-aware routing** — your question auto-routes to the right knowledge area
- **Hard-stop query rigor** — rejects "all time" queries, sample-first pipeline, table-freshness verification
- **Knowledge gap loop** — when you ask something not loaded, plugin drafts a skill-request for the analytics team

## What's loaded

20 skills, mapping KNOWLEDGE_DUMP §1–§25:

| Skill | Covers |
|---|---|
| `tm-chotu-overview` | Truemeds biz model, 4.2M MAU, 5 FCs, ~₹76 cr/mo GMV, headline metrics |
| `tm-chotu-dcoe-cohorts` 🆕 | Derive DCOE cohort axes on Metabase alone (no DCOE instance): CM-high (`cm_net` formula + margin-proxy SQL), Generic Champions (`generic_share`), Coupon dependency, Substitution propensity + composite cohorts (Golden Geese) |
| `tm-chotu-functions` | 12 functions × sub-teams (Marketing×7, PM×5, CMT, Analytics/Data Science, Ops×9, CX×4 portals, Doctor×4 arms, Diagnostics, Tech, Finance, Legal/HR, Leadership) |
| `tm-chotu-customer` | DCOE 5-axis cohorts + Golden Geese, Gold/Silver/Bronze persona tiers, FTC compute-on-the-fly |
| `tm-chotu-business-flows` | Order lifecycle, AUTO-CONFIRM path, HA position, RTO chain (60→RTO-IT→RTD→reverse putaway), return flow |
| `tm-chotu-modules` | Search PRD + Substitution 6-step algo + Live Inv + 3 Picklist variants + 8 Putaway types + Logistics 14 partner IDs + 6 portals + Diagnostics + Pincode Mapping |
| `tm-chotu-inventory` 🆕 | DB 180 PROD INVENTORY `product_inventory_data` is universal live-qty source (covers Vinculum-backed ANKW Faridabad too). 4-bucket reservation model (total / available / pending_consult / invoice / shipped). Layered stockout def. MFC vs FC via pincode JIT/BULK demand on `product_wh_avg_daily_tracker`. Cold chain at PINCODE level. 4 decommissioned WHs flagged (ids 3, 5, 7, 11). 5 PTS-restricted cols. |
| `tm-chotu-tat` 🆕 | `delivery_date_tracker` (DDT) canonical for promised-vs-actual. One row per order, `promised_*` set once + never changes, `metadata` JSON = full PDD audit. network OTIF **62.59%** (probed 2026-05-26 — re-measure before quoting; see `tm-chotu-tat`). Doctor 08:00–22:00, WH per-`warehouse_details`, courier `courier_partner_schedule`. WH processing 4-bucket grid (SDD/NON_SDD × INVENTORY/NON_INVENTORY). RTO chain across 6 master groups. Refund SLA per REFUND_TO. |
| `tm-chotu-data-sources` | 53 Metabase DBs in 8 buckets + decision tree (DB 170 shared default, DB 180 PROD INVENTORY for live qty, DB 432 Min Max Redshift for demand trackers) |
| `tm-chotu-tables-enums` | 96 ORDER STATUS codes + WORK FLOW + ORDER_TYPE + MEDICINE_STATUS + 20 smaller masters |
| `tm-chotu-joins` | 8 ready-to-run SQL recipes + join key reference + Redshift gotchas (bigint cast, LOWER trap, DB typos) |
| `tm-chotu-definitions` | 100+ canonical terms — FTC, GMV, TS, ROAS variants, CAC variants, Order Type 1/2/3, etc. |
| `tm-chotu-projects` | Active projects + substitution-quality and data-governance workstreams + tminsights umbrella + knowledge-gap loop |
| `tm-chotu-rx-cadence` 🆕 | Rx lifecycle + molecule-dosage cadence. The doctor-portal flow with what each status ACTUALLY means (452 = doctor consult done, awaiting HA; 209/215 reused for both actors; 317 = scheduler go-signal), the Rx register `register_details`, the salt-dosage decode, and the locked days-of-supply / run-out / next-expected-order formula with its per-patient grain and D1 gate |
| `tm-chotu-excel-deliverable` 🆕 | House standard for every .xlsx a human will open — live formulas not dead numbers, native types, README sheet, editable-vs-computed split, negatives always red, and a pass/fail verifier gate. Bundled `xl_kit.py` + `verify.py`; a FAIL blocks handover |
| `tm-chotu-learnings` 🆕 | The failure ledger — 24 entries, each `BELIEF → WHAT BROKE → LOCKED NOW → MEASURED COST`. Every rule in the plugin traced to the mistake that paid for it (227× cohort reuse, 89.8% alias drift, 132× bigint division, 66% sentinel artifact, ~220 false form-changes). Load before any non-trivial analysis |
| `tm-chotu-pii-register` 🆕 | Where customer and staff PII actually sits, the `tm_view_nopii` role, which "encrypted" columns are real, Redshift 170 exposure posture — plus the handling guardrail (no `SELECT *`, no identity exports, never widen a grant to fix a permission error) |

Plus 3 behavioural skills (entry / mood-router / query-rigor) and 5 slash commands.

### `tm-chotu-query-rigor` — standing hard rules

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

Restart Claude Code. On first session the SessionStart hook prints a reminder to **run `/tm-chotu-onboard` yourself** — it does not fire it for you. Run it once; your answers persist in `~/.claude/tm-chotu-state.json` and survive every later update.

**Don't have GitLab SSH access?** See INSTALL.md — Path B (HTTPS + Personal Access Token) or Path C (local zip from Mangesh).

## Updating

**Two update routes.** Which one you need depends on how the plugin was installed — check that first, because running the wrong one silently does nothing.

```bash
claude plugin marketplace list
```

Find the `tm-chotu` entry and read its **`Source:`** line:

- a **git remote / GitLab URL** → **Marketplace update** below
- a **local folder** (e.g. `~/tm-chotu`) → **Local-zip update** below

⚠️ `claude plugin list` does **not** show the source — it prints name, version, scope and status only. Use `marketplace list` for the *source*, `plugin list` for the *version*.

Note your current version before you start:

```bash
claude plugin list | grep -A3 tm-chotu
```

⚠️ `-A3` is required. The version sits on its own line **underneath** the name, so a bare `grep tm-chotu` matches the name line and hides the version:

```
  ❯ tm-chotu@tm-chotu
    Version: 0.4.3
    Scope: user
    Status: ✔ enabled
```

### Marketplace update

```bash
claude plugin marketplace update tm-chotu
claude plugin update tm-chotu@tm-chotu
```

> **Use the qualified name `tm-chotu@tm-chotu`.** Users have hit `Plugin "tm-chotu" not found` with the bare name. On CLI 2.1.245 the bare name resolves for some subcommands, so the failure appears to be version- or subcommand-specific — but the qualified form works everywhere, so use it always.

🔴 **Never unzip into the plugin cache.** A marketplace install lives at `~/.claude/plugins/cache/tm-chotu/tm-chotu/<VERSION>/` — that folder is **named for the version**, and it is managed by the CLI. The zip carries a top-level `tm-chotu/` prefix, so "extracting into the parent" lands the files in a dead sibling `.../cache/tm-chotu/tm-chotu/tm-chotu/`. The running plugin is untouched and **nothing reports an error** — you restart, see the old behaviour, and have no idea why. On this route the two commands above are the entire procedure.

### Local-zip update

Only if `marketplace list` showed a **local folder**. Overwrite that folder in place, then refresh:

```bash
# the zip contains a top-level tm-chotu/ folder, so extract into the folder's PARENT.
# marketplace at ~/tm-chotu   ->   parent is ~/
unzip -o ~/Downloads/tm-chotu-v<version>.zip -d ~/
claude plugin marketplace update tm-chotu
claude plugin update tm-chotu@tm-chotu
```

`-o` overwrites without prompting. This does **not** touch `~/.claude/tm-chotu-state.json`.

### Both routes — restart, then verify

**Fully quit and reopen Claude Code** — not just the window. Skills load at session start, so the update does nothing until a fresh session.

```bash
claude plugin list | grep -A3 tm-chotu
```

The `Version:` line must be higher than the one you noted. If it isn't, the update didn't take — re-read which route you're on.

> 🟢 **Onboarding survives either route.** Your persona and default mood live at `~/.claude/tm-chotu-state.json`, outside the plugin folder. You never need to re-run `/tm-chotu-onboard` after an update.

Verification checks and troubleshooting are in **[UPDATE.md](./UPDATE.md)**; version history in **[CHANGELOG.md](./CHANGELOG.md)**.


## Requires

- Claude Code (latest)
- `superpowers` plugin (companion dep)
- Metabase account (OAuth handles auth — zero setup)
- Mixpanel account (each user connects own via Claude connector marketplace — see INSTALL.md)

## Token cost

**~5.6k tokens always-on** per session. Per-skill **on-invoke ~0.44k – ~15.4k** (heaviest: `tm-chotu-modules` ~15.4k, `tm-chotu-query-rigor` ~12.4k).

These drift every release — measure rather than trust this line:

```bash
claude plugin details tm-chotu
```

⚠️ That command reports **`Skills (25)`** because the CLI counts our 5 slash-commands as skills. In repo terms it is **20 skills + 5 commands**. Both numbers are right; they count different things.

## Knowledge sources

- Whimsical bird's-eye view (full Truemeds product architecture)
- Search Engine PRD V1.2 (April 2026, Sujith Cheedella)
- probab-subs-persona ALGO_CONTEXT.md (6-step substitution algo, 5 FCs)
- TMEXP4 DCOE cohort definitions
- Live DB 170 probes verifying every table reference
- `m_system_value_master` sweep (200+ masters)
- `m_courier_partner_master` (13 3PL partners)

## Master reference

`KNOWLEDGE_DUMP.md` (in this repo) is the **historical source** the skills were originally lifted from. ⚠️ **It is NOT kept in sync and it does NOT win on conflict — the skills are authoritative.** Corrections since v0.2.0 (status semantics, Metabase toolset, inventory valuation, contested facts) landed in the skills only; KD still carries superseded readings and no ⚠️ CONTESTED tags. Read it for history and for sections a skill doesn't cover; verify against the skill before acting on it. Sections **§1–§25** cover Overview / Functions / Customer / Business Flows / Modules / Data Sources / Tables & Enums / Joins / Definitions / Projects / Inventory / TAT / fraud logic / DCOE cohorts / fsp_id chain / Mongo event log / courier & AWB / PII register / learnings ledger / Snowflake MRP / substitution defects / inventory valuation / Rx lifecycle & cadence. If you spot something wrong, redline that file and re-translate into the affected skill.

## Knowledge-gap loop

When you ask something the plugin doesn't know:

1. Plugin drafts a skill-request markdown at `SKILL_REQUESTS/<date>_<topic>.md`
2. You email it to the analytics team
3. Team ships a plugin update
4. You update — see [Updating](#updating) (use `tm-chotu@tm-chotu`, the bare name fails)

This is how the plugin gets smarter over time.

## Contributing

Plugin-update PRs go to `git@gitlab.com:tm-exp/tm-chotu.git`. Reviewer = Mangesh. Cadence TBD (see § 10 of `KNOWLEDGE_DUMP.md`).

## License

UNLICENSED — Truemeds internal use only.
