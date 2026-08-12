# Changelog

## [0.1.14] — 2026-07-07 — UPDATE.md (Claude-executable update guide)

Adds `UPDATE.md` at repo root — a self-contained, Claude-actionable guide for updating an already-installed tm-chotu. A user can point their Claude at it ("read UPDATE.md and update the plugin") and it runs the right path.

### Changes

- **NEW `UPDATE.md`** — detect install type (marketplace vs zip) → in-place update per path (no uninstall needed) → restart → verify version + the two newest behaviours. Leads with the key reassurance: onboarding is **never lost** because state lives at `~/.claude/tm-chotu-state.json`, outside the plugin folder.
- `.claude-plugin/plugin.json` — version 0.1.13 → 0.1.14.

### Why

User request (2026-07-07): give an update file the recipient's Claude can read and follow, so updating doesn't mean uninstall/reinstall (which the user worried would force a re-onboard — it wouldn't, but the in-place path is cleaner regardless).

## [0.1.13] — 2026-07-07 — Explain-logic-first default

Behaviour rule: on a specific-point / metric question, tm-chotu now **states the logic it already knows — definition + derivation + source table + caveat — BEFORE pulling any data.** Lets the user catch a wrong definition before a wasted query, ships every number self-explaining, and reuses locked knowledge instead of re-deriving from raw data.

### Changes

- `tm-chotu-query-rigor` — new **leading rule "explain the logic BEFORE pulling data"** (fixed order: explain from the loaded section skill → then pull; skip only if user says "just the number" or logic already given this session). Description updated for discoverability.
- `using-tm-chotu` — "On any user prompt" flow reordered: load section skill → **explain logic first** → then query-rigor window/sample/index rules → pull.
- `.claude-plugin/plugin.json` — version 0.1.12 → 0.1.13.

### Why

User request (2026-07-07): "first explain the logic that tm-chotu knows when asked about a specific point and only then pull data." Codifies the review-before-query discipline the plugin already values (see `feedback_validate_before_lock`) into the standing behaviour.

## [0.1.12] — 2026-07-07 — DCOE cohort axes, derivable on Metabase alone

New skill so the plugin can be shared with someone who has Metabase but **no DCOE instance** (EC2/RDS). Teaches how to rebuild DCOE's customer scoring from tmprod tables alone.

### Changes

- **NEW skill `tm-chotu-dcoe-cohorts`** — how to DERIVE each DCOE axis from scratch on DB 170: **CM-high** (full `cm_net` contribution-margin formula + ready-to-run margin-proxy SQL + component gotchas), **Generic Champions** (`generic_share` off `medicine_master.generic_branded`), **Coupon dependency** (`coupon_order_ratio_180d` + true-burn cashback leg), **Substitution propensity** (`subs_accept_rate`, with the F1 pivot flagged). Plus composite cohorts (Golden Geese etc.) and Metabase execution notes. Every query is self-contained tmprod SQL — no `app.*`/`dm_dcoe.*`/EC2 required.
- `tm-chotu-customer` — 5-axis table corrected for the **F1 pivot** (5th axis is now generic-adoption `generic_share`, not `subs_accept_rate`); Golden Geese redefined `CM++ ∩ HV ∩ S1 ∩ ACT`; cross-link to the new skill.
- `using-tm-chotu` — routing row added for CM-high / generic-champions / coupon-dependent / cm_net questions → `tm-chotu-dcoe-cohorts`.
- `KNOWLEDGE_DUMP.md § 16` — condensed canonical mirror of the four axes + shared rules + parity caveats.
- `.claude-plugin/plugin.json` — version 0.1.11 → 0.1.12.

### Why

Sharing tm-chotu with a colleague who pulls via his own Metabase-connected Claude and cannot reach the DCOE instance. He needs the cohort *logic* (how to get / derive / what the rule is), not the pipeline. All logic transcribed from the DCOE repo's locked specs (`CM_CALCULATION.md`, `COHORT_DEFINITIONS.md`, `cohort_thresholds.yaml`, `feature_sql.py`, `predicates.py`) and re-expressed as runnable DB 170 SQL. [memory `project_tmexp4_dcoe`, `feedback_metabase_only_no_direct_db`]

## [0.1.11] — 2026-06-18 — tm-fraud-engine: reframe as reusable detection LOGIC (not infra operability)

Scope correction on top of 0.1.10. The §15 knowledge added in 0.1.10 was infra-heavy (EC2 / systemd / SES / deploy path front-and-centre), which could nudge tm-chotu toward thinking it should *operate* the deployed engine. Intent is the opposite: tm-chotu should carry the **reusable fraud-detection logic** (24 signals + SQL mechanisms + verdict thresholds) and apply it **ad-hoc on trigger** via its normal Metabase path to surface new frauds — and must **never** run / deploy / trigger / SSH / schedule the engine on the DCOE EC2 instance.

### Changes

- `KNOWLEDGE_DUMP.md § 15` — retitled to lead with detection LOGIC. New **⛔ Scope guardrail** box at top (what tm-chotu does = reuse logic ad-hoc; what it must never do = operate the deployed engine; decline "run the fraud engine" asks). New **✅ Applying the signals ad-hoc** section (the actual tm-chotu fraud job: pull candidates + 30d substrate via Metabase → evaluate signals as predicates → apply verdict rule → return flagged orders + evidence; no engine/EC2/DuckDB). **Architecture** + **Deployment** sections relabelled "the deployed engine's internals / REFERENCE ONLY (NOT operated by tm-chotu)".
- `tm-chotu-projects` / `tm-chotu-modules` / `tm-chotu-definitions` skills — guardrail clause added to each tm-fraud-engine entry: reuse the *logic* ad-hoc via Metabase, do NOT operate the engine on DCOE EC2.
- `.claude-plugin/plugin.json` — version 0.1.10 → 0.1.11.

### Why

Explicit user scoping decision (2026-06-18): "the ship needs to be reusable detection logic and not the ability to run on infra." tm-chotu is a knowledge + ad-hoc-detection layer; the production engine is operated separately and is reference-only in the plugin. [memory `feedback_tm_chotu_fraud_logic_not_infra`]

## [0.1.10] — 2026-06-18 — tm-fraud-engine current state (SHIPPED & LIVE, all-channel)

Knowledge refresh — folds the **current** tm-fraud-engine state into the plugin. The plugin's prior fraud knowledge (§13 Spec 1, §14 Spec 2) was build-history from late May and described it as "on branch, pending EC2 deploy, affiliate **web** orders". Reality at repo HEAD `5a6d68e`: all specs merged to `main`, **SHIPPED & LIVE since 2026-05-29**, **all-channel (web/app/ios) since 2026-06-01**, SES production access granted 2026-06-12, running daily on EC2 via systemd timer. All facts taken from the repo docs (CLAUDE.md, PROJECT_CHECKLIST, DATA_SOURCES, DEPLOYMENT, SIGNALS, LEARNINGS_SPEC1/2/APR2026) — **secret-scrubbed**: no ARNs / AWS account / EC2 IP / RDS host / GCP SA / Drive folder ids / personal emails enter this shared plugin (placeholders only; real values stay in Secrets Manager + repo REFERENCE).

### Changes

- `KNOWLEDGE_DUMP.md` — new **§ 15 — tm-fraud-engine SHIPPED & LIVE (canonical state)**: one-liner, status, scoped-ELT architecture (per-module table + 3 run modes), 24-signal model (9 families, weight tiers, verdict logic, append-only rule), data sources (DB 630, 7 tables, `ctt` INDEX, channel discriminator, dead `odm.platform`), deployment (EC2 / systemd 06:30 IST / SES / Sheet output), key learnings (6 live-only bugs + 89.8% column-drift lesson + S9 profiler + N2/N3 device-collapse), performance (22.4s, 13.3k file 2m50s, 34.2% first prod FRAUD). §13/§14 marked HISTORICAL with pointer to §15. §10 project row + §9 def-table row + §5 modules-fraud row updated web→all-channel + live.
- `tm-chotu-projects/SKILL.md` — tm-fraud-engine row rewritten: SHIPPED & LIVE, all-channel, 24 signals, scoped-ELT, systemd 06:30 IST, 34.2% first prod FRAUD, 6 live bugs, normalize lesson, P2 gating. Points to KD §15.
- `tm-chotu-modules/SKILL.md` — Affiliate Fraud sub-system row updated web→all-channel + SHIPPED & LIVE; added pointer to KD §15 for full detail.
- `.claude-plugin/plugin.json` — version 0.1.9 → 0.1.10.

### Why

Per `feedback-dump-learnings-to-tm-chotu` rule + explicit ask to "make tm-chotu learn tm-fraud-engine". Key locks: scoped-ELT is the shipped production path (not a branch); scope-file mode is what the systemd timer fires; 24 signals (not 19 — N6/N7/N8/N10/N11 added P1.5); weight tiers HARD_HIGH=99/HIGH=3/MED=1/LOW=0.3 hardcoded in `score.py` (yaml is spec only); `odm.source` is the channel discriminator while `odm.utm_source` is NULL on app/ios; column-alias drift is the canonical cautionary tale [memory `feedback_normalize_upstream_rows`].

## [0.1.9] — 2026-06-05 — molecule-level invoiced sales + pincode→state chain

Knowledge dump from a live Pregabalin molecule sales pull (all products, Jan–Sep 2024, invoiced value by state & month). Every fact validated live on DB 630 / 170.

### Changes

- `tm-chotu-joins/SKILL.md` — **Recipe 8: molecule-level invoiced sales by state & month** (full runnable SQL). New join-key rows (`net_suite_invoice_batch ↔ order_details/medicine_molecule`, pincode→state chain). Gotchas 5–7: `amount` NULL → `rate*quantity`; state only via pincode chain; "all products of a molecule by name" via `molecule_combination_cd` token. Description 7→8 recipes.
- `tm-chotu-tables-enums/SKILL.md` — new **Molecule & geography tables** section + `net_suite_invoice_batch` line-grain/`amount`-NULL note. Canonical state chain documented.
- `tm-chotu-query-rigor/SKILL.md` — broken-cols added (`net_suite_invoice_batch.amount` NULL, `d_address_master.state_id`/`city_id` NULL). New "Native MCP — execution gotchas": base64 envelope, 200-row cap → pivot, MariaDB `lines` reserved word, DB 630 pool drops.
- `KNOWLEDGE_DUMP.md` — molecule-by-name vs substitution-exact-match caution near the sub algo; new "Product/molecule-level invoiced sales + geography" master block.
- `.claude-plugin/plugin.json` — version 0.1.8 → 0.1.9.

### Why

Per `feedback-dump-learnings-to-tm-chotu` rule. Key locks: molecule universe via `molecule_combination_cd` token (PREGABALIN=1527 → 1,512 SKUs); invoiced value = `rate*quantity` (`amount` NULL); state recoverable 100% only through `pincode_id → pincode_warehouse_master → m_city_master → m_state_master` (state_id/city_id are NULL); latest-month invoice data can be partial.

## [0.1.8] — 2026-05-28 — tm-fraud-engine Spec 2 scoped-ELT learnings

Knowledge dump from tm-fraud-engine Spec 2 scale re-architecture (scoped ELT, 16-task plan, branch impl/spec2-scoped-elt). Also catches up plugin.json version (was stuck at 0.1.6 despite 0.1.7 commit).

### Changes

- `tm-chotu-data-sources/SKILL.md` — scoped ELT pattern (5-step: scope → resolve keys → indexed parallel fetch → DuckDB JOIN → score). MySQL DB 630 4× faster than Redshift DB 170 for selective `customer_id IN (...)` lookups (1.4s vs 6.1s). Substrate is customer-keyed, not date-keyed.
- `tm-chotu-query-rigor/SKILL.md` — new RULE: "respect indexes — never assume the source DB will scan freely". Leading-index check via `information_schema.statistics`, no function-wrapping on indexed cols, decompose mega-JOINs. Validated: scoped ELT 22.4s vs old 300s timeout.
- `tm-chotu-tables-enums/SKILL.md` — fraud-engine 7-table index map (DB 630, probed 2026-05-28): order_details, order_device_mapping, customer_details, d_address_master, customerrtoorder_percentage, customer_device_tracker, customer_traffic_tracking (128M rows, INDEX(order_id) added). Redshift vs MySQL-only split noted.
- `tm-chotu-projects/SKILL.md` — tm-fraud-engine entry updated: Spec 2 scoped-ELT on branch, scale solved (22.4s), 6 prod bugs context, pending EC2 deploy.
- `KNOWLEDGE_DUMP.md § 14` — Spec 2 summary: problem, fix, performance, branch refs, 6-prod-bug reinforcement.
- `.claude-plugin/plugin.json` — version 0.1.6 → 0.1.8 (catches up skipped 0.1.7 bump).

### Why

Per `feedback-dump-learnings-to-tm-chotu` rule: end of every task → route schema/infra/pattern learnings into plugin. tm-fraud Spec 2 Task 15 (final task).

## [0.1.7] — 2026-05-27 — tm-fraud-engine Spec 1 learnings dump

Knowledge dump from tm-fraud-engine v2 prod-hardening (Spec 1, 21 plan tasks, 6 families). No new interactive skills — purely knowledge propagation.

### Changes

- `tm-chotu-tables-enums/SKILL.md` — `customer_device_tracker` schema (DB 630/TMMUMPSDB), multi-device history cols, MAX-collapse anti-pattern, derived `customer_devices_30d` DuckDB table
- `tm-chotu-modules/SKILL.md` — fraud engine signal windowing semantics: per-order event-date endpoint, substrate window for batch scoring, 6 affected signal families
- `tm-chotu-query-rigor/SKILL.md` — new RULE: "window endpoint = event date, NOT job/run date". Wrong/right SQL patterns, daily-cron-only-accident caveat, validated 2026-05-27 (6 signals, Family F commits)
- `tm-chotu-projects/SKILL.md` — tm-fraud-engine entry updated: Spec 1 shipped to branch, 21 tasks across 6 families, marquee fixes (N2, Family F, S11), pending EC2 deploy
- `KNOWLEDGE_DUMP.md § 13` — Spec 1 fixes summary (6 families), key learnings cross-reference, branch state at dump time

### Tables / signals

- `customer_device_tracker` — added to schema reference (previously undocumented in plugin)
- `customer_devices_30d` — derived DuckDB table noted as fraud-engine substrate

### Why

Per `feedback-dump-learnings-to-tm-chotu` rule: end of every task → route schema/infra/pattern learnings into plugin. tm-fraud Spec 1 Task 20 of 21.

## [0.1.6] — 2026-05-27 — Metabase MCP sunset + namespace HARD RULE

Cleanup release. Drops the duplicate Metabase server entry from the plugin's `.mcp.json` (project-scope `~/.claude.json` already registers it — kept one OAuth prompt instead of two), and locks a HARD RULE preferring the **native Metabase MCP** over the deprecated **Unofficial Community** connector.

### Changes

- `.mcp.json` — `mcpServers` emptied. Native Metabase connection now registered exclusively at user/project scope in `~/.claude.json` (was duplicated here). Removes redundant OAuth prompt on every fresh session.
- `tm-chotu-query-rigor/SKILL.md` — new section "**Metabase MCP — namespace policy (HARD RULE)**". Defines native vs unofficial by URL, namespace, and toolset signature. Refuses silent fallback to the unofficial server. Tells user to auth the native MCP instead.
- `tm-chotu-data-sources/SKILL.md` — top-banner "**MCP routing (HARD RULE)**" block mirroring the query-rigor rule. Surfaced upfront so DB routing answers carry the MCP routing rule.
- `KNOWLEDGE_DUMP.md § 6` — same rule added under "MCP routing — HARD RULE (v0.1.6)". Old `mcp__Metabase__list` reference updated to "native Metabase MCP `list`".

### Why

Two Metabase MCPs were surfacing in sessions: the new native Metabase 0.55+ server (`one-truemeds.metabaseapp.com/api/mcp`, UUID-prefixed namespace, rich toolset incl. `execute_query` / `construct_query` / `get_metric`) and the deprecated community npm `metabase-mcp` (`mcp__Metabase__Unofficial___Community___*`, thin toolset `list / retrieve / execute / export / clear_cache`). The unofficial one is registered cloud-side (Anthropic Connectors UI) and must be removed there by the user — plugin can only enforce the namespace preference at query time. v0.1.6 locks that preference.

### Sunset path (user action, not plugin)

To fully remove the unofficial server: Claude.ai → Settings → Connectors → find "Metabase (Unofficial / Community)" → delete. Restart session.

### Tables / signals

No table or signal changes.

## [0.1.5] — 2026-05-26 — TAT deep-rewrite (live-probe-locked + DDT model)

`tm-chotu-tat` rewritten from v0.1.2 scaffold-with-14-gaps to a locked, live-probe-verified skill. Major model shift: from "order_status transition log is everything" to "delivery_date_tracker is canonical for promised-vs-actual; order_status is for operational state-hop deltas".

### Big corrections from interview + DB probes

- **Source-of-truth shift to `delivery_date_tracker` (DDT)** — DB 630 MySQL with DB 170 Airbyte mirror `append_only_delivery_date_tracker`. One row per order, `promised_*` set ONCE and never changes (unless order goes INCOMPLETE), `current_*` updates each step, `actual_*` set when actuals happen then frozen.
- **5 promise-vs-actual pairs tracked:** delivery, dispatch, doctor_call, warehouse_processing, air_delivery (no actual col on last).
- **`metadata` longtext JSON carries full PDD audit** — `wh_processing_type`, `wh_processing_mins`, `doctor_working_hours` (08:00–22:00), per-WH `warehouse_work_start/_end`, `is_sdd`, `is_inventory`, `is_mfc`, buffer config, `pb_audit_source`. Every PDD has provenance.
- **OTIF locked LIVE: 62.59%** (last 30d, 624,149 delivered / 390,663 on-time, probed 2026-05-26 on DB 170).
- **OTIF formula:** `actual_delivery_date <= promised_delivery_date` (use promised directly — it IS the original commitment).
- **Business hours decomposed:** Doctor 08:00–22:00 / WH per-`warehouse_details.work_start/_end` / Logistics per-`courier_partner_schedule.courier_partner_schedule_time`. WH week-off applies to non-inventory orders only via `wh_weekoff_schedule`.
- **WH processing TAT 4-bucket grid:** SDD/NON_SDD × INVENTORY/NON_INVENTORY in `wh_processing_time`. Filter `active=1`; inactive rows are audit history.
- **RTO chain decoded across 6 master groups** — RTON 119 → RTO 120 → RTO-IT 121 → RTO-OFD 123 → RTD 124 → RTU 125 (branch). NOT all under `name='ORDER STATUS'` — but share the `order_status_id` column.
- **Customer return chain separate** — 56/190/191/192/200/218/263/272/273/301.
- **Module-internal SLAs locked:** Doctor TAT = `promised_doctor_call_time` on DDT (no separate config). Pharmacist Type-1 digitize = NO formal SLA. Putaway = NO formal SLA. HA single-call connect % gap.
- **Refund SLA per REFUND_TO destination:** TM_CREDIT (206) / TM_CASH (207) / TM_CASHBACK (264) = instant. CASHFREE (208) = 5–7 working days.

### Tables flagged DON'T USE / NEEDS DEEP-DIVE

- ❌ `order_tat_base_model` (DB 170) — **stale**. Tempting 40-col pre-computed deltas (op2od, drc2ful, etc.) but data unreliable. Caveat added to query-rigor known-broken list.
- ⚠️ `order_tat_details` (DB 170) — needs deep-dive on promise_tat / supposed_tat / delay_days semantics before locking. v0.1.6+ gap.
- ⚠️ `pincode_tat_adherence_data` + `_mfc` (DB 630/170) — rich 21 cols (ideal_tat / final_tat / supposed_tat / breach buckets / adherence_percentage) but need deep-dive. v0.1.6+ gap.

### Updated files

- `tm-chotu-tat/SKILL.md` — full rewrite. Description + body. Adds 6 engine-correct SQL recipes (OTIF live, E2E TAT P50/P90, WH processing lookup, RTO TAT via order_status, courier cutoff lookup, PDD re-promise history). 14 v0.1.2 [GAP] items resolved; 8 lower-priority gaps carried to v0.1.6+.
- `KNOWLEDGE_DUMP.md §12` — mirrors locked skill content. Adds OTIF live number, RTO 6-master decode, refund destination table, WH processing 4-bucket grid sample.
- `tm-chotu-query-rigor/SKILL.md` — known-broken list extended with `order_tat_base_model` (stale) + `order_tat_details` + `pincode_tat_adherence_data` (need deep-dive). 

### Why this matters

v0.1.2 TAT skill said "use order_status for everything". That's the right ad-hoc pattern but **misses the entire promised-vs-actual + audit model Truemeds actually runs**. DDT is the customer-facing truth; order_status is operational. v0.1.5 routes correctly.

### Sources

DB 630 (probed 2026-05-26): order_status, delivery_date_tracker (with live sample row), delivery_date_timeline, wh_processing_time, wh_weekoff_schedule, courier_partner_schedule, m_system_value_master RTO chain.
DB 170 (probed 2026-05-26): append_only_delivery_date_tracker mirror, OTIF query (62.59%), order_tat_base_model + order_tat_details + tat_adherence_master + pincode_delivery_tat schemas.
DB 994 SF LOGISTICS — MFA-blocked, gap.

### Process

Per `feedback-audit-after-plugin-ship` rule — next step is audit + 10-Q test round vs v0.1.5 before declaring TAT closed.

## [0.1.4] — 2026-05-26 — Inventory audit-driven patch

Audit + test round (10 common Qs) after v0.1.3 ship caught 3 real issues. Patching now.

### Fixed (3 issues from audit)

1. **Universal live-qty source corrected.** v0.1.3 said Faridabad (warehouse_id 11, 21) on Vinculum needs DB 432 mirror; v0.1.4 confirms ANKW Faridabad (id=21) IS synced into DB 180 PROD INVENTORY despite Vinculum being the underlying WMS. DB 180 is the **universal live-qty source for ALL active WHs**. DB 432 is for cross-DB joins with demand trackers, not a separate Faridabad-only path.
2. **Decommissioned WH list added.** `warehouse_details.status=1` is stale — ids 3, 5, 7, 11 (old Intellihealth Mumbai Hub, Delhi Hub, Kolkata Raikva FC, Faridabad Hub) are decommissioned. Truly active WHs = 32 (verified via `SELECT DISTINCT warehouse_id FROM INVENTORY_SCHEMA.product_inventory_data WHERE active=1`).
3. **SQL recipe schema case fixed.** v0.1.3 recipes used lowercase `tmmumpsdb.` everywhere; on DB 630/2 MySQL the schema is `TMMUMPSDB.` UPPERCASE — wrong case returns "Unknown database". Fixed all 5 recipes to use engine-correct case + added schema-case rule to `tm-chotu-query-rigor`.

### Test round (10 questions vs v0.1.3 skill)

7/10 PASS, 1 PASS-by-refusal (no canonical stockout %), 1 PARTIAL (cold-chain SQL fails due to schema case), 1 FAIL (Faridabad WH-id claim). All 3 caught by audit now fixed in v0.1.4 → should be 10/10 on re-test.

### Updated

- `tm-chotu-inventory/SKILL.md` — description rewrite, universal-source callout, decommissioned-WH table, schema-case rule, SQL recipes fixed (`TMMUMPSDB.` for DB 630/2 MySQL, `tmmumpsdb.` for DB 432 Redshift), anti-patterns updated
- `KNOWLEDGE_DUMP.md §11` — universal-source correction + decommissioned-WH table mirrored
- `tm-chotu-data-sources/SKILL.md` — DB 432 description updated (no longer "Faridabad-only" — it's a Redshift mirror for cross-DB joins)
- `tm-chotu-query-rigor/SKILL.md` — new HARD RULE "DB schema-name case" with per-DB case table + active-WH-list caveat

### Process

Verification via `superpowers:verification-before-completion`. New durable rule: every plugin ship runs audit + test round before declaring done. Saved to memory as `feedback-audit-after-plugin-ship`.

## [0.1.3] — 2026-05-26 — Inventory deep-rewrite (live-probe-locked)

`tm-chotu-inventory` rewritten from scaffold-with-gaps to a locked, live-probe-verified skill. Major corrections to assumed architecture; 25 `[GAP]` items resolved.

### Big corrections from interview + DB probes

- **Multi-WMS reality** — inventory source depends on which WMS each WH runs. Faridabad on Vinculum (Airbyte-mirrored into DB 432); rest on WMS 2.0 with NetSuite real-time-sync into DB 180 `INVENTORY_SCHEMA.product_inventory_data`. NetSuite is the underlying IMS.
- **Live qty table found** — `INVENTORY_SCHEMA.product_inventory_data` on DB 180 PROD INVENTORY: per-(warehouse_id, product_cd) row with `total_inventory_qty`, `available_qty`, `pending_consult_qty` (HA/Doctor), `pending_invoice_qty` (post-confirm), `pending_shipped_qty` (packed), `threshold`, NetSuite `ns_item_id` / `ns_onhand_qty` / `last_synced_on`. Conservation identity: `available_qty = total − consult − invoice − shipped`.
- **Layered stockout model** — there is NO single canonical stockout def. Search OOS uses `mwm.availability` (MANUAL flag, Catalogue-managed). WH routing uses `available_qty`. Backorder uses `package_details_tracking.is_back_order`. `is_searchable` only hides broken catalog rows.
- **MFC vs FC split via JIT/BULK pincode demand** — demand classified per-pincode on `product_wh_avg_daily_tracker` (DB 432, 180M rows, daily-fresh). BULK → MFC (553), JIT → FC (454). "Own Demand" (`_own_*` cols) = customers searching directly for generic after first-time substitution.
- **Cold chain serviced at PINCODE level**, not WH level. `pincode_warehouse_master.is_cold_chain_deliverable` on `priority = 1` rows. Driven by cold-package distance-radius from WH.
- **Backorder set at WH Assignment** (orderstatus 233), not at pick or by batch job.
- **Quarantine / write-off two-path**: inward damage → VRA; post-inward → try VRA → if vendor rejects → adjustment-down.
- **5 PTS-restricted cols on `inward_product_details` confirmed**: `pts`, `verified_pts`, `final_pts`, `invoiced_final_pts`, `verified_pts_by_cp`.
- **Daily canonical inventory snapshot**: `tmmumpsdb.product_wh_inventory_daily_tracker` (DB 432).
- **`scm_wh_stock_threshold_master` is empty / unused** — remove from any "Min-Max master" recommendations.
- **`medicine_stock_details` + `inventory_tracking` flagged legacy** in query-rigor and inventory skill.

### Updated

- `tm-chotu-inventory/SKILL.md` — full rewrite (description + body) replacing scaffold with locked content. Adds 4 SQL recipes (WMS 2.0 live qty, Faridabad live qty, cold-chain pincode check, daily inventory trend).
- `KNOWLEDGE_DUMP.md §11` — mirrors locked skill content. Replaces 11 `[GAP]` items with confirmed answers; carries forward 5 lower-priority gaps for v0.1.4+.
- `tm-chotu-data-sources/SKILL.md` — DB 180, 432, 993 entries expanded with new context (PROD INVENTORY schemas, Min Max Redshift role for Faridabad + demand-tracker, Snowflake WMS aggregate scope).
- `tm-chotu-query-rigor/SKILL.md` — Known-broken-table list extended (`scm_wh_stock_threshold_master`, `medicine_stock_details`, `inventory_tracking`). Added hard rule from Mangesh 2026-05-26: *any table without data, do not use* — `SELECT COUNT(*)` before locking.

### Why this matters

v0.1.2 scaffold had several incorrect assumptions (single-WMS model, cold-chain WH-level, mwm holds qty, threshold master is canonical Min-Max). v0.1.3 replaces guesswork with what was actually probed and locked in interview. Future questions on inventory now route to verified routing, verified tables, verified columns.

### Sources

DB 180 PROD INVENTORY (probed 2026-05-26), DB 432 Min Max Redshift (probed 2026-05-26), DB 630 Mangesh DB (probed 2026-05-26), Mangesh interview Round 1 / 2 / 3.

## [0.1.2] — 2026-05-26 — Inventory + TAT skills

Two new section skills. Plugin coverage now spans 15 skills.

### Added
- **`tm-chotu-inventory` skill** — Live Inventory mechanics, INVENTORY_TYPE master (281/282/283/370/371), per-WH stock pools (MFC/HUB/WAREHOUSE), NetSuite as financial source-of-truth, OOS + backorder triggers, pre-confirmation block on original + substitute, replenishment (Min-Max, Bulk Zone, JIT Zone), putaway (8 types), bin / batch / expiry mgmt, cold-chain SKU handling, Hub Config, data tables (`inward_product_details` with 5 PTS-restricted cols, `package_details_tracking` backorder flag, `net_suite_*` mirrors), anti-patterns, SQL stub for OOS check. Marked 11 `[GAP]` items for Mangesh to dump.
- **`tm-chotu-tat` skill** — Order lifecycle TAT segments (Placed → Digitized → Doctor Confirmed → Order Confirmed → HA → WH Assigned → AWB Printed → Dispatched → OFD → Delivered), module-internal TAT (Catalog approval, Doctor approval, Pharmacist Type-1 digitize, HA call, Picklist, Putaway, Procurement, Refund), measurement pattern using `tmmumpsdb.order_status` transition log with `MIN(modified_on)` per status + percentile delta, PDD / OTIF / Hub Transit Days / courier-partner pincode TAT, RTO TAT chain, breach-detection pattern, anti-patterns (snapshot-vs-history, cross-join inflation, business-hours basis), 14 `[GAP]` items for Mangesh to dump.
- **KNOWLEDGE_DUMP §11 + §12** appended (canonical source).
- **`using-tm-chotu` routing map** updated with 2 new rows (inventory triggers + TAT triggers).

### Why this matters
Existing modules skill had ~10 lines on Live Inventory; TAT was scattered as KPI mentions across functions / modules with no math or recipes. SCM / Ops / Logistics / Doctor / Pharmacist KPI questions now have dedicated context. Gaps are explicit so analytics team can fill in next pass.

## [0.1.1] — 2026-05-15 — docs fix: GitLab install paths

Critical INSTALL.md fix discovered during first colleague-share attempt.

### Fixed
- **GitLab install instructions** — the `claude plugin marketplace add tm-exp/tm-chotu` shortcut prompts for GitHub login because Claude Code defaults the `owner/repo` form to GitHub, not GitLab. Replaced with 3 explicit install paths:
  - **Path A (SSH, default):** `claude plugin marketplace add git@gitlab.com:tm-exp/tm-chotu.git` — works for engineers with GitLab SSH keys (most Truemeds folks already have this). Includes SSH-key setup guide for those who don't.
  - **Path B (HTTPS + Personal Access Token):** for users who don't want SSH. Token URL form: `https://oauth2:<PAT>@gitlab.com/tm-exp/tm-chotu.git`. One-time GitLab PAT generation with `read_repository` scope.
  - **Path C (local zip):** non-git fallback for users with corporate restrictions. Mangesh distributes `tm-chotu-vX.Y.Z.zip` over Slack/email; user extracts + uses `claude plugin marketplace add ~/path/to/extracted`.
- **README install snippet** — points to INSTALL.md and uses the SSH URL by default.
- **Troubleshooting table** — added rows for the HTTPS auth-fail error and `terminal prompts disabled` message.

### Why this matters
The `owner/repo` shorthand silently defaults to GitHub. Anyone running `claude plugin marketplace add tm-exp/tm-chotu` (the obvious-looking command, exactly what we had in v0.1.0 docs) hits a GitHub auth prompt for a repo that doesn't exist there. No clear error pointing at the real problem.

## [0.1.0] — 2026-05-15 — first shareable

First end-to-end working release. Onboard tested live. Ready to install for colleagues.

### Added
- **13 skills** packaging full Truemeds knowledge (overview, functions, customer, business-flows, modules, data-sources, tables-enums, joins, definitions, projects + 3 behavioural: using-tm-chotu, mood-router, query-rigor)
- **5 wired commands** with real action sequences:
  - `/tm-chotu-onboard` — 2-stage persona picker + mood confirm + MCP probe + real test query + state save (with personality)
  - `/tm-chotu-update` — change persona / default mood
  - `/tm-chotu-tools-check` — re-verify Metabase + Mixpanel MCPs
  - `/tm-chotu-freshness` — probe data freshness on 6 key tables
  - `/tm-chotu-ask <q>` — force-route through full pipeline
- **SessionStart hook** — auto-fires on first session, suggests onboard
- **Metabase MCP auto-wired** via `.claude-plugin/.mcp.json` (OAuth, no token in repo)
- **KNOWLEDGE_DUMP.md** — 2,056-line master reference (all 10 sections deep)
- **Onboard wizard with personality** — Hindi-light intro, anti-corporate tone, riffs across runs

### Knowledge sourced from
- Whimsical bird's-eye PDF (full Truemeds product architecture, every node)
- Search Engine PRD V1.2 (April 2026, Sujith Cheedella)
- probab-subs-persona/memory/ALGO_CONTEXT.md (6-step substitution algo, 5 FCs)
- TMEXP4 DCOE COHORT_DEFINITIONS.md (5-axis cohorts + Golden Geese)
- `m_system_value_master` sweep (200+ masters, 96 ORDER STATUS codes decoded)
- `m_courier_partner_master` (13 3PL partners locked)
- Live DB 170 probes verifying every table reference

### Locked rules
- DB 170 (Redshift) is the shared default — DB 663 (Mangesh Redshift) is personal-scoped only
- `customer_order_rank` is 🔴 broken (13mo stale, 3% coverage) — compute on-the-fly
- `cx_lifetime_metrics` is ⚠️ partial (73% coverage, 7d lag) — reference only
- DB column typos `consider_poduct`, `keep_orginal` must be used as-typed
- Order Type 1 → Pharmacist Type 1 queue; Type 2 + 3 → Doctor directly
- `medicine_status` 61=SUBSTITUTE / 62=ORIGINAL / 211=NO SUBSTITUTE
- `workflow_status` 242=NO_DOCTOR_CALL (auto-confirm path)

### Token cost
- ~2.7k tokens always-on per session
- Per-skill on-invoke: 0.25k–13.5k

### Requires
- `superpowers` plugin (companion dep)
- Metabase account (OAuth handled on first connect)
- Mixpanel account (each user adds own via Claude connector marketplace)

## [0.0.1] — 2026-05-15 — initial scaffold

Skeleton scaffold; not user-ready. See git log `9a5fef7` for full commit.
