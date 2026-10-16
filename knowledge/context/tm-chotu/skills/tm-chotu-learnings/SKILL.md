---
name: tm-chotu-learnings
description: The failure ledger — every analysis mistake Truemeds analytics has actually made, what it cost, and the rule that replaced it. Each entry is BELIEF → WHAT BROKE → LOCKED NOW → MEASURED COST. Load BEFORE running any non-trivial analysis, when a result looks suspiciously clean, when a number seems too big or too small, when about to switch data source / reuse a cached cohort / infer a relationship, or when the user asks "how do we know that", "has this bitten us before", "why is that the rule". Also load when a stated rule feels arbitrary — the ledger holds the evidence behind it.
---

# Learnings ledger — how we know what we know

Every rule in tm-chotu was paid for. This file holds the receipts.

**Use it two ways:**
1. **Before** an analysis — scan for a matching failure mode. Most new analyses re-run an old mistake in a new costume.
2. **After** a result lands — if the output is unusually clean, round, small, or large, find the entry that predicts that shape.

**A rule you cannot trace to an entry here is a rule you have not verified.** Say so rather than asserting it.

---

## The meta-lesson

Every entry below is the same shape: **a silent wrong answer, not an error.** Nothing crashed. No test failed. The number just came back confidently wrong. That is the threat model for Truemeds analytics — not bugs, not outages. Quiet, plausible, wrong.

So the check is never "did it run". It is **"what population did I actually measure, and what got dropped without telling me".**

---

## L1 — The named source is a constraint, not a default

**Belief:** if the named source is slow, any source that produces the same ids is an acceptable substitute.
**Broke:** asked for cart activity "from Mongo", hit a query wall, quietly used Redshift `order_status` to build the candidate order list. `order_status` records **status transitions only** — it structurally cannot see product add / remove / qty change, which was the entire question.
**Locked:** the named source is a constraint. If it can't answer, solve *inside* it (index probing, partitioning, direct driver) or say it can't — never route around it silently. If a second source is genuinely unavoidable, say so up front and **measure the completeness gap against ground truth before running**, not after.
**Cost:** 1 of 67 known-active orders missing even inside a tiny cohort. Payoff for solving in-source: **0.9 s** vs >5 min of failed workarounds.

## L2 — A fresh scope means a fresh pull

**Belief:** the cohort already on disk is a reasonable starting population.
**Broke:** asked for "any activity in this window", filtered a cached 513-order cohort because it was already local. Reported 437 events / 67 orders.
**Locked:** cached data is an input to **validation**, never a substitute for the population. New time window or new entity scope ⇒ new pull.
**Cost:** true answer was **99,287 events / 22,528 orders**. Off by **227×**.

## L3 — An all-zero ID is not an ID

**Belief:** a populated column holds a value.
**Broke:** `offer_id = 0`, `device_id = '00000000-0000-0000-0000-000000000000'`, `ip = '0.0.0.0'` all mean *no data available*. Grouping on them collapses every record with missing data into one bucket that **appears to share an identity**. They also defeat naive guards — the null-UUID is a truthy string, and `offer_id` casts to BIGINT `0` and sails past an `is None` check.
**Locked:** normalise sentinels → NULL **once at the substrate boundary**, not per query. Test guards with the real sentinel, not `None`. **IDs only** — for amounts and flags `0` is genuine data (`tm_cash=0`, `ftc_flag=0` are real values).
**Cost:** in tm-fraud-engine, **66% of app / 43% of web** `device_id_recurrence` HIGH-weight fires were this artifact — false FRAUD verdicts sent to ops for weeks. Measured prevalence: `offer_id=0` on 91.6% of orders, null-UUID device 3.3% (the #1 `device_id` bucket).

## L4 — Upstream column aliases drift

**Belief:** SQL aliases survive into the persisted rows.
**Broke:** upstream JSONL emitted raw DB names (`orderstatus`, `address_line`, `is_ftc_order`) instead of canonical aliases (`order_status_id`, `address_line1`, `ftc_flag`). Every lookup returned `None`; every dependent signal became a silent no-op. No error, no failing test.
**Locked:** normalise at the **read** boundary with an explicit RAW→CANONICAL map — canonical wins when set, raw fills only when missing. Idempotent, pure, regression-tested on the exact bad row shape. Different pulls of the *same* SQL can produce different key shapes; compare key sets across a start-file and an end-file.
**Cost:** **89.8% of orders scored with half the engine.**

## L5 — Redshift integer division truncates

**Belief:** `SUM(bigint)/1e6` does the obvious thing.
**Locked:** always cast — `SUM(col)::numeric / 1000000.0`.
**Cost:** one total was **132× wrong**.

## L6 — "Cancelled" is a set, not a code

**Belief:** excluding `orderstatus = 57` removes non-revenue orders.
**Broke:** discarded / incomplete / scrapped ₹0 rows leaked into a "revenue yesterday" answer.
**Locked:** dead-order set = `orderstatus NOT IN (49, 274, 668, 57, 232, 174, 312)` — incomplete + cancelled + discard + scrapped. `284 DELIVERY FAILED` is **real billed** (RTO), not dead. Match the *intent* of the word, never the literal code.
**Cost:** inflated revenue on a leadership-facing number. **Measured 2026-08-19** over 30 days (19 Jul – 17 Aug, `organisation_id = 1`): the codes that actually occur as current status are `49` (525,776 orders), `312` (493,170), `174` (91,065) and `57` (54,700) — so excluding only `57` leaves **~1.11M dead orders** in the population. `400` is a **WORK FLOW** code with no `orderstatus` counterpart (0 rows), and `274` / `668` / `232` also returned 0 as current status — the working set is `(49, 312, 174, 57)`.

## L7 — Never infer what a shipped line replaced

**Belief:** you can work out the displaced original by comparing the shipped product to the cart.
**Broke:** comparing a shipped product against *any* cart line silently excuses a real defect whenever an unrelated cart line happens to share the salt.
**Locked:** the deterministic chain, always — `net_suite_invoice_batch.fsp_id → final_substitute_product.final_subs_id → .product_id → product_details.product_details_id → .product_code`. One invoice line pairs 1:1 with one cart line, so **an "ambiguous original" cannot exist**; if a build emits one, the chain was not used. Verdict is **line-level: shipped vs ITS OWN original.**
**Cost:** on a 163k-order run the loose rule **hid 2 real mismatches** (ISTAMET metformin+sitagliptin → GLIMP glimepiride, masked by an unrelated glimepiride line) and **invented ~220 false form-changes** (233 → 12 once pinned to the true original).

## L8 — The cart is not the shipment

**Belief:** `product_details` and the substitution tables tell you what the customer received.
**Broke:** `product_details` = what was **added to cart**. `final_substitute_product` **can be corrected after the wrong item already shipped** — so FSP can show the right sub while the invoice shows the wrong product that actually reached the customer.
**Locked:** shipped truth = `net_suite_invoice_batch` (`active = 1`). FSP is context for algo-vs-shipped divergence, never the verdict. "The sub code appears on the order" is not a shipped test — customers often ordered both, or kept the original.
**Cost:** a triangulated "**0 wrong subs shipped**" conclusion was invalid. Redone on invoice: **86 genuinely-wrong subs shipped across 63 orders — 3 already delivered** (one antidiabetic combo replaced by INPAMIDE, a diuretic). Safety-relevant, not pitch-quality.

## L9 — Invoice lag makes recent days a lower bound

**Belief:** today's mismatch count is today's mismatch rate.
**Locked:** only ~30% of a day's orders are invoiced at any moment. Same-day = **lower bound**; today often reads ≈ 0. Use a fully-invoiced 30d window for a true rate. Cancelled (57) orders can legitimately carry mismatch subs — invoiced-then-cancelled is often the *remediation* of a caught mismatch.

## L10 — `order_id` is not a date proxy

**Belief:** an id range approximates a date window.
**Locked:** date-scope on `created_on`, always. Ids are assigned at a different lifecycle point than placement, incomplete orders leave gaps, and ordering is not placement order. An order created today can carry an old id.

## L11 — Compute belongs off the transactional DB

**Belief:** a WHERE clause is cheap.
**Broke:** `WHERE created_on >= CURDATE()` on `order_details` = **87 s full-table scan** (`created_on` is not indexed; FSP `created_at` likewise).
**Locked:** on live MySQL — no analytical joins, no GROUP BY over big tables, no correlated subqueries at scale. Accept **one** controlled single-pass scan to get the day's `order_id` list, then hit everything else **by `order_id` index**. Extract minimal raw rows; join, parse and classify **locally in Python**. Metabase MCP is not a free scratchpad — it loads the same prod.

## L12 — Existence is not usability

**Belief:** the table is there and the mapping is clean, therefore use it.
**Broke:** `logistics_tracker` maps 100% cleanly to courier data — and its Airbyte feed has been **dead since 2026-07-20** (0 rows in 7d, all partners). Same family: `customer_order_rank` (13mo stale, 3% coverage), `cx_lifetime_metrics` (73% coverage, 7d lag), `order_tat_base_model` (stale), `mobile_otp` (superseded).
**Locked:** before locking any table into an answer, probe **freshness and completeness against a known reference** — `MAX(created_on)`, row count vs expectation, coverage vs a table you trust. A clean join proves mapping, never currency.

## L13 — Grants and pipelines don't mean what you'd guess

- `SELECT *` **fails** under a column-level grant — the grantee must name columns, or read a view.
- Column-level privileges live in `mysql.columns_priv` and **survive a table-level revoke**. Undo both.
- Column-level-only grants **break connector metadata discovery** — MySQL hides ungranted columns from `information_schema.columns` and refuses `SHOW CREATE TABLE`, so DMS fails "no table definition found" and Airbyte fails "SHOW command denied". The symptom appears only on the column-scoped tables; fully-granted ones sync fine.
- **Grants never filter the binlog.** `REPLICATION SLAVE` streams every column of every base table regardless of grants, and views don't exist in the binlog at all. A column-scoped role constrains only the query path; CDC stays wide open. For any binlog-CDC pipeline, PII exclusion must live in the **connector** (DMS `remove-column`, Airbyte `column.exclude.list`), not in MySQL.
- A **DMS full reload recreates the Redshift target table from scratch → every GRANT is lost** (reads start failing `permission denied for relation`). Re-grant after any reload.
- On Redshift, emptying a table **auto-commits and cannot be rolled back**.
- `sys:superuser` bypasses every permission check, including column-level restrictions. Before recommending any grant-based control, check whether the target already holds it — or the control is decorative.

## L14 — `_` is a wildcard

`column_name ILIKE '%pan_%'` matches `company_nm`. Escape it (`LIKE '%pan\_%'`) when hunting column names, or false positives swamp the result.

## L15 — Index bounds on array fields need `$elemMatch`

**Broke:** bare dot-notation (`footPrintTrackingList.createdOn`) does **not** get index bounds on a multikey array — it scans. On a 3.6 TB collection that is a >5 min timeout.
**Locked:** use `$elemMatch` and give the leading indexed field a full range so the compound index can bound the second. **0.9 s** vs timeout. Also: `.explain()` in pymongo **executes** the query — pass `verbosity='queryPlanner'` or skip it.

## L16 — A CDC change-stream view is not a master

**Broke:** `BATCH_MASTER_V` looks like a batch master; it is a DynamoDB→Kinesis change stream. Multiple rows per key from real `VERSION` bumps **and** from backfill re-emissions (same VERSION reloaded ~3× on one day, differing only by load time).
**Locked:** dedupe to **latest per key — max `VERSION`, tiebreak max `EVENT_TIME`** — before using anything from it.

## L17 — Someone else's flag is a lead, not a verdict

**Broke:** a team-produced "Molecule Mismatch" sheet over-counted **~5×** — of 602 flagged rows only 129 were truly disjoint (409 = intentional partial-overlap, 64 = exactly the same molecule). Of those 129, **28 were synonym artifacts** (methylcobalamin vs mecobalamin coded as different molecule ids).
**Locked:** re-derive the verdict from source before acting on any hand-built flag, and normalise molecule **synonyms** before any disjointness test.
**Converse also holds:** the ops **tracker is truth for ACTION state, and system status lags it** — two orders read CANCELED on the tracker while prod still showed 60 DISPATCHED with zero cancel events across 45–50 status rows. Don't call a tracker row wrong on system-status evidence alone.

## L18 — Row caps are silent

- Metabase **MCP `query` caps at 2,000 rows** (200-row pages, `continuation_token`; a missing token does NOT prove you got everything).
- The Metabase **CSV API caps at 1,048,575 rows** — chunk big pulls into weekly slices.
- A big IN-list blows **ARG_MAX** on the command line → write the SQL to a file, build the JSON with `jq --rawfile`, pass `query@file`.

None of these announce themselves as truncation. Check the returned row count against expectation every time.

## L19 — Explaining a metric is cheaper than re-pulling it

**Broke, twice, from live use:** inventory tables were **summed across warehouses** into a meaningless total, and revenue was **invented from incomplete orders**.
**Locked:** this is why the Intent-First Protocol exists — structure and interpretation branches stated, goal confirmed, branch chosen, *then* pull; and every number ships with its SQL, a raw sample and a breakdown. See `tm-chotu-query-rigor`.

## L20 — A schema name is not an identity. The connection is.

**Belief:** the same schema name on two connections means the same data, and a schema visible in `information_schema` is reachable from that connection.
**Broke:** `prod_picker` exists on **two different hosts holding two different warehouses** — DB 174 has 798,325 rows for **warehouse 20 (Mumbai)**, DB 202 has 206,459 rows for **warehouse 23**. Reading `prod_picker` from the wrong connection returns a fully populated, perfectly plausible, **entirely wrong warehouse**. Separately, DB 202 and DB 399 return byte-identical rows for the same MFC schema — two connections onto one host — so catalog visibility told me nothing about which route was correct.
**Locked:** every warehouse goes through **its own DB connection**; the Metabase database name is the warehouse identity, never the schema name. **Assert `warehouse_id` from inside the table before using the rows** — each `wp_bin_product_batch_mapping` holds exactly one. Cross-WH work unions **across connections**, client-side; never a cross-schema union on one connection.
**Cost:** caught during validation, pre-ship — because the user challenged the claim. Had it shipped, every batch-level inventory answer for Mumbai would have silently returned warehouse 23's stock. The generalisation: **`information_schema` proves a name exists, never that the data behind it is the data you want.** Same family as L12 (existence ≠ usability).

## L21 — Row count is not freshness

**Belief:** a table holding 25.5 million rows is obviously live.
**Broke:** `analytics_salt_dosage_prescribed_by_doctor` on tmprod was declared queryable and the MySQL extract declared unnecessary. The table is **frozen at 2026-02-14** — zero rows after 1 August. The row count was enormous and completely uninformative.
**Locked:** freshness is `MAX(date)` and a recent-window row count, never total size. A big table can be a big **dead** table. Check the tail, not the volume.
**Cost:** a source declared usable that could not answer anything about the current period; the extract it was supposed to replace was still required. Same family as L12 and L20 — this is the third distinct way "the data exists" has been mistaken for "the data is usable".

## L22 — A check that cannot fail is not a check

**Belief:** the days-of-supply formula was validated — all five lines computed to exactly 180 days.
**Broke:** the check divided `prescribed_quantity` by a rate and recovered `prescribed_duration`. But both sides are **the same `salt_dosage_master` template row expressed two ways** (`max_allowed_quantity` 720 ÷ `max_allowed_duration` 6×30). The identity was arithmetic, not evidence. It could never have disagreed.
**Locked:** before trusting a validation, ask **what result would have falsified it.** If no realistic input could have produced a mismatch, it validated nothing. Prefer checks on data the template cannot vouch for — the same formula was eventually settled on **edited-quantity lines only** (where line ≠ template, so the answer isn't circular) and on **realised reorder behaviour**, which agreed.
**Cost:** a formula carried as "validated" while its key term was still unresolved; it took a second, non-circular test to find that the disputed `uq` multiplier was right after all (488 vs 27, 94.8%).

## L23 — A status label is not the status meaning

**Belief:** an enum's English name tells you what it means and who did it.
**Broke:** in the doctor-portal flow — `452 PARTIALLY DIGITIZED` is not a transcription state at all, it means *the doctor consultation is done and the order is waiting on the HA*. `209 DOCTOR ASSIGNED` and `215 CALL ATTEMPTED` are each used **twice**, once for the doctor leg and once for the HA leg, with no separate HA code. `317 DR ORDER CONFIRMED` means *all consultations complete or not required* — the scheduler's go-signal — not "a doctor confirmed it"; 23% of them are stamped by a system account on the auto-confirm path. `233 WAREHOUSE ASSIGNED` means a warehouse id was attached **for pricing and catalogue**, not that anything reached a warehouse.
**Locked:** for any status-driven analysis, confirm what the code *means in the flow* and **which actor sets it**, before counting it. Where one code serves two actors, position in the sequence is the discriminator (before/after `452`). Never infer workload, ownership or physical state from a label.
**Cost:** caught in review before shipping, but it invalidated a doctor-TAT approach built on `215`, and a battery answer confidently inverted `452` to mean the opposite of what it means.

---

## L24 — A version number is not the content

**BELIEF:** the version string tells you what you are running. `claude plugin list` says `0.4.2`, so you have 0.4.2.

**WHAT BROKE:** v0.4.2 was tagged, then amended with more fixes under the same number. The update ran clean — `✔ Plugin "tm-chotu" updated from 0.3.10 to 0.4.2` — and delivered the **pre-amend** tree. **18 files** differed from the repo, including the headline fix. The plugin cache is keyed on the version number, so a reused number is a **cache hit**: no re-download, no warning, and `plugin list` confirms the number you expected.

**LOCKED NOW:** a tagged version number is **burned**. Any content change gets a new number, even a one-character fix. Never `tag -f`, never amend under a live tag. And when verifying a release, **diff the installed tree against the repo** — the version string is not evidence:

```bash
diff -rq <repo> ~/.claude/plugins/cache/<plugin>/<plugin>/<version> -x .git
```

**MEASURED COST:** caught pre-distribution by an end-to-end install test. Had it shipped, every user would have run the old content under a version number that said otherwise — undetectable from inside a session, and it would have looked like the fixes simply didn't work.

**GENERALISES TO:** any content-addressed-by-label cache — Docker tags, S3 keys, `latest` pointers, a Metabase question id reused for a changed query. The label is a promise; only a hash is evidence. Related: [[L21]] row count is not freshness, [[L22]] a check that cannot fail is not a check.

## Adding to this ledger

New entry when an analysis produced a **confidently wrong** answer and the reason generalises. Keep the `BELIEF → BROKE → LOCKED → COST` shape, and **the cost must be measured, not estimated** — the number is what makes the next person believe it.
