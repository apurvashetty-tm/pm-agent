# Intent-First Metrics + Back-by-Proof — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make tm-chotu hard-gate every metric request behind a goal-clarification + interpretation-branch dialogue, and ship every number with the raw SQL/sample/breakdown it was computed on.

**Architecture:** Content-only change to the tm-chotu plugin (markdown skill files). The gatekeeper skill `tm-chotu-query-rigor` gets its one-way "explain-logic-first" section replaced by a hard-gated Intent-First Protocol that reads a new `METRIC_CATALOG.md` reference. The catalog cites section skills rather than copying formulas. Two section skills get grounding edits, entry skill gets a pointer, version bumps to 0.1.15.

**Tech Stack:** Markdown skills, Claude Code plugin format, git. No runtime code — "tests" are `grep` content assertions + a scenario-replay read-through. Spec: `docs/superpowers/specs/2026-07-22-intent-first-proof-design.md`.

**Repo:** `~/.claude/plugins/marketplaces/tm-chotu` (remote `git@gitlab.com:tm-exp/tm-chotu.git`). All paths below are relative to that repo root. Do all work on branch `impl/v0.1.15-intent-first-proof` (never `main`).

---

## File Structure

- **Create** `skills/tm-chotu-query-rigor/METRIC_CATALOG.md` — the interpretation-branch reference (Task 1).
- **Modify** `skills/tm-chotu-query-rigor/SKILL.md` — replace explain-logic-first block (lines 8–23) with the Intent-First Protocol; update frontmatter `description:` (Task 2).
- **Modify** `skills/tm-chotu-inventory/SKILL.md` — add never-sum anti-pattern line in the anti-patterns block (Task 3).
- **Modify** `skills/using-tm-chotu/SKILL.md` — rewrite "on any user prompt" step 4 to intent-first + proof (Task 4).
- **Modify** `.claude-plugin/plugin.json` — version `0.1.14` → `0.1.15` (Task 5).
- **Modify** `KNOWLEDGE_DUMP.md` — add the intent-first protocol note (Task 5).
- **Ship** — secret-scrub, commit, tag, push, rebuild zip (Task 6).

---

### Task 0: Branch

- [ ] **Step 1: Create the feature branch**

```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
git checkout -b impl/v0.1.15-intent-first-proof
git status
```

Expected: `On branch impl/v0.1.15-intent-first-proof`, clean tree (spec already committed on main; branch from it).

---

### Task 1: Metric Interpretation Catalog (new reference file)

**Files:**
- Create: `skills/tm-chotu-query-rigor/METRIC_CATALOG.md`

- [ ] **Step 1: Write the catalog file**

Write `skills/tm-chotu-query-rigor/METRIC_CATALOG.md` with EXACTLY this content:

````markdown
# Metric Interpretation Catalog

Presentation index for the Intent-First Protocol (see `SKILL.md`). For each metric: the branches chotu presents at **Step 0**, each citing the **authoritative section skill** for the full derivation. Do NOT copy formulas here — cite, so this never drifts from the owning skill.

Two grades of claim:
- **LOCKED** — formula / status code / anti-pattern quoted verbatim from a section skill. Ship as fact.
- **SLICE** — a chotu-derived re-slice a user may want. Must NOT contradict the skill; label it a slice, never a locked fact.

If a requested metric is not listed → derive branches from the owning section skill, present them, and add a stub here.

---

## Revenue — authority: `tm-chotu-definitions`

| Branch | Grade | Derivation | When |
|---|---|---|---|
| (a) Daily-trend / placement momentum | **SLICE** | `SUM(order_details.order_value)` at order-placed stage, all placement rows, no delivery filter, `organisation_id = 1`. **Flag inline:** `order_value` is cart pre-bill — momentum proxy, NOT billable revenue. | Day-over-day placement trend only |
| (b) Placed − canceled | **SLICE** | (a) minus `orderstatus = 57` (canceled). `57 = canceled` is LOCKED (definitions); the "minus cancelled" re-slice is chotu-derived. Do not use the undefined token "discarded" — cite a discard code from `tm-chotu-tables-enums` first if needed. | Placed net of cancels |
| (c) Business / delivered = **GMV** | **LOCKED** | `SUM(final_calculated_amount.final_amount) WHERE order_details.orderstatus = 55 AND organisation_id = 1`. **Never** `order_details.order_value`. | Board / business revenue |
| (d) Net revenue | **LOCKED** | GMV − returns − refunds. | Revenue net of returns |

**Anti-pattern (Rahul's failure), LOCKED:** counting all orders incl. incomplete, or using `order_value` as revenue. Flag explicitly.

## Inventory — authority: `tm-chotu-inventory`

| Branch | Grade | Source | When |
|---|---|---|---|
| (a) Business / analytics live qty | **LOCKED** | DB 180 `INVENTORY_SCHEMA.product_inventory_data` (real-time NetSuite sync, universal across all active WHs incl. Vinculum-backed Faridabad). Cross-DB joins → DB 432 `tmmumpsdb.product_inventory_data` (Airbyte mirror). | Business case, availability, stockout% |
| (b) WH / physical / rack-level ops | ⚠️ **VERIFY-GAP** | Exact rack/bin-level table NOT yet locked in `tm-chotu-inventory`. Do NOT name a table. State the gap; route to WMS/NetSuite bin data. | Physical/rack ops |

- **Caveat (anchored):** live onhand qty diverges from the *manual* `medicine_warehouse_master.availability` Catalogue flag (JIT → non-onhand ≠ unavailable; flag not real-time). The stronger "live vs a physical/rack source may not reconcile" stays conditional on resolving the VERIFY-GAP.
- **Anti-pattern (Kunal's failure), LOCKED:** **never SUM a quantity across inventory tables** — pick one source by use-case; they don't reconcile. Grounded in `tm-chotu-inventory` anti-patterns block. Legacy `inventory_tracking` / `medicine_stock_details` deprecated — never use.

## Margin — two distinct concepts; never conflate labels

| Branch | Grade | Derivation | Authority |
|---|---|---|---|
| (a) Customer / cohort contribution margin | **LOCKED** | `cm_net` / `cm_net_90d`. **Fully-loaded** (rev − COGS − zone shipping − COD − return logistics − packaging − promo/comms − coupon − tm_cash − adjustment − price-lock − CPO). **NOT** COGS-only CM1 (nearer CM2/CM3) — never report as "CM1". Cohorts skill ships an exact-source spec AND a runnable raw **PROXY** (omits zone-shipping/return-logistics/promo-comm/CPO) — proxy = rank-and-cut tool, not an exact ₹ figure. | `tm-chotu-dcoe-cohorts` §1 |
| (b) Item-level margin | **LOCKED** | **route-A** = Formula − all 4 discount layers. "route-A" is NetSuite item-margin terminology ONLY — never attach it to `cm_net`. | NetSuite item-margin reference |

If the user means COGS-only CM1, confirm against `tm-chotu-definitions` before locking a label. Do NOT invent a margin formula.

## Extensible stubs (add branches on first real ask)

- **GMV** → = Revenue (c), delivered-only. LOCKED in definitions.
- **AOV** → GMV / delivered-order count. LOCKED in definitions.
- **Active users** → install vs signup vs FTC-delivered vs FOP-placed are NOT the same — cite definitions anti-patterns; ask which.
- **Retention** → M1 / M3 / M6 — cite definitions; M1 = order-1 AND order-2 within 30 days.
````

- [ ] **Step 2: Verify content assertions**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
grep -q "is NetSuite item-margin terminology ONLY" skills/tm-chotu-query-rigor/METRIC_CATALOG.md && echo OK1
grep -q "never SUM a quantity across inventory tables" skills/tm-chotu-query-rigor/METRIC_CATALOG.md && echo OK2
grep -q "order_value.*cart pre-bill\|cart pre-bill" skills/tm-chotu-query-rigor/METRIC_CATALOG.md && echo OK3
! grep -q "route-A layered" skills/tm-chotu-query-rigor/METRIC_CATALOG.md && echo OK4
```
Expected: `OK1 OK2 OK3 OK4` (all four print). OK4 confirms the old mislabel is absent.

- [ ] **Step 3: Commit**

```bash
git add skills/tm-chotu-query-rigor/METRIC_CATALOG.md
git commit -m "feat(query-rigor): metric interpretation catalog — revenue/inventory/margin branches, cited not copied"
```

---

### Task 2: Intent-First Protocol in query-rigor

**Files:**
- Modify: `skills/tm-chotu-query-rigor/SKILL.md` — frontmatter `description:` (line 3) + the block at lines 8–23.

- [ ] **Step 1: Update the frontmatter description**

Replace line 3 (the `description:` line) with:

```
description: HARD STOP rules for data queries. Intent-first hard gate (structure + interpretation branches → clarify goal → confirm branch BEFORE pulling), back-by-proof (every number ships SQL + raw sample + breakdown), sample-first pipeline, time-window guard, index check, DB preference, backoff. Enforced on every data-bound prompt.
```

- [ ] **Step 2: Replace the explain-logic-first block**

Replace the entire block from `## RULE: explain the logic BEFORE pulling data` through the line ending `...never pull first and explain later.` (current lines 8–23) with EXACTLY:

````markdown
## RULE: Intent-First Protocol — HARD GATE on every metric

Fires on ANY request for a metric, number, count, rate, or aggregate. Mandatory order — do not skip steps.

**Step 0 — Structure + branches.** From the loaded section skill + `METRIC_CATALOG.md` (read it now), state up front:
- *Where the data lives* + structural caveats (inventory → live DB 180 vs rack/physical source, which may not sync; revenue → placed → confirmed → dispatched → delivered → returned lifecycle).
- *The interpretation branches* — each with derivation/formula + source table + a one-line caveat. Mark each **LOCKED** (verbatim from a skill) or **SLICE** (chotu re-slice, not a locked fact).

**Step 1 — Goal HARD STOP.** Ask the user's goal + which branch. **Do not pull until answered.** Frame as "what are you trying to do with this?" so the branch falls out of the goal (daily-trend vs board number vs ops decision).
- **Session-lock:** once a `(metric, branch)` pair is confirmed this session, reuse it silently — do not re-ask that metric. *Silent = suppress only the re-ask.* The one-line branch tag + the Step-4 proof STILL ship every turn. A locked repeat is never a bare number.

**Step 2 — Sample-first** (existing rule below): `LIMIT 100` / single-day sample on the CHOSEN branch → shape + caveman hypothesis.

**Step 3 — Confirm + proof-scope.** Show the sample, ask together: "Pull full? And do you want **all raw data**, or just the capped proof rows?" *Skip this confirm-halt if `mood = research` and the window is already small (existing sample-first exemption — do not override it).*

**Step 4 — Deliver with proof.** The number ALWAYS ships with: (1) the exact SQL, (2) a capped raw sample (10–20 rows), (3) an aggregate breakdown (e.g. revenue by status bucket; inventory by source). If the user asked for **all raw data** → deliver via export (CSV to scratchpad / saved Metabase question); chat can't hold thousands of rows and the 200-row MCP cap truncates silently.

**Escape hatch.** "just the number" / "skip the explanation" → collapse Steps 1 and 3 (no hard-stop, no confirm-halt), run the pull, ship **number + one-line branch tag + minimal cited proof** (one-line SQL + breakdown). Offer the 10–20-row sample "(say 'show rows')" rather than dumping it. The branch and the SQL are NEVER hidden — that is the whole point.

Why intent-first: lets the user catch a wrong definition before a wasted query (Rahul's revenue), and stops chotu silently summing incompatible sources (Kunal's inventory). Reuses locked knowledge instead of re-deriving from raw.
````

- [ ] **Step 3: Verify**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
grep -q "Intent-First Protocol — HARD GATE" skills/tm-chotu-query-rigor/SKILL.md && echo OK1
grep -q "Session-lock" skills/tm-chotu-query-rigor/SKILL.md && echo OK2
grep -q "Escape hatch" skills/tm-chotu-query-rigor/SKILL.md && echo OK3
grep -q "read it now" skills/tm-chotu-query-rigor/SKILL.md && echo OK4
! grep -q "explain the logic BEFORE pulling data" skills/tm-chotu-query-rigor/SKILL.md && echo OK5
grep -q "Intent-first hard gate" skills/tm-chotu-query-rigor/SKILL.md && echo OK6
```
Expected: `OK1 OK2 OK3 OK4 OK5 OK6`. OK5 confirms the old one-way rule is gone; OK6 confirms the frontmatter update.

- [ ] **Step 4: Verify the rest of the file is intact**

Run:
```bash
grep -c "^## " skills/tm-chotu-query-rigor/SKILL.md
grep -q "Time-window rules" skills/tm-chotu-query-rigor/SKILL.md && grep -q "Sample-first pipeline" skills/tm-chotu-query-rigor/SKILL.md && grep -q "Verify table before lock" skills/tm-chotu-query-rigor/SKILL.md && echo "downstream-rules-intact"
```
Expected: prints a section count ≥ 12 and `downstream-rules-intact` (the window/sample/verify-table/index/backoff rules must survive untouched).

- [ ] **Step 5: Commit**

```bash
git add skills/tm-chotu-query-rigor/SKILL.md
git commit -m "feat(query-rigor): replace explain-logic-first with intent-first hard gate + back-by-proof"
```

---

### Task 3: Ground the never-sum anti-pattern in the inventory skill

**Files:**
- Modify: `skills/tm-chotu-inventory/SKILL.md` — anti-patterns block (insert after the `inventory_tracking` line, current line 299).

- [ ] **Step 1: Add the anti-pattern line**

In the `## Anti-patterns — DO NOT do these` block, immediately after the line:
```
- ❌ Use `medicine_stock_details` or `inventory_tracking` — both **legacy/deprecated**
```
insert a new line:
```
- ❌ **SUM a quantity across inventory tables** (live DB 180 + mirror + rack/physical) — they don't reconcile. Pick ONE source by use-case: business/analytics → `product_inventory_data`; physical/rack ops → WMS/NetSuite bin data. Summing double-counts.
```

- [ ] **Step 2: Verify**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
grep -q "SUM a quantity across inventory tables" skills/tm-chotu-inventory/SKILL.md && echo OK
```
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add skills/tm-chotu-inventory/SKILL.md
git commit -m "feat(inventory): ground never-sum-across-tables anti-pattern (Kunal failure)"
```

---

### Task 4: Point the entry skill at intent-first + proof

**Files:**
- Modify: `skills/using-tm-chotu/SKILL.md` — "On any user prompt" step 4 (current line 20).

- [ ] **Step 1: Rewrite step 4**

Replace the current line 20:
```
4. **On a specific-point / metric question: EXPLAIN the logic first (definition + derivation + source + caveat from the loaded skill), THEN pull data** — `tm-chotu-query-rigor` leading rule
```
with:
```
4. **On any metric / number question: run the Intent-First Protocol** — state data structure + interpretation branches, HARD-STOP for the user's goal + branch, then sample, then pull. Every number ships **back-by-proof** (SQL + raw sample + breakdown). Never a bare number; never silently pick one interpretation. See `tm-chotu-query-rigor`.
```

- [ ] **Step 2: Verify**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
grep -q "Intent-First Protocol" skills/using-tm-chotu/SKILL.md && grep -q "back-by-proof" skills/using-tm-chotu/SKILL.md && echo OK
! grep -q "EXPLAIN the logic first (definition + derivation" skills/using-tm-chotu/SKILL.md && echo OK2
```
Expected: `OK` and `OK2` (old one-way phrasing gone).

- [ ] **Step 3: Commit**

```bash
git add skills/using-tm-chotu/SKILL.md
git commit -m "feat(using-tm-chotu): route metric asks through intent-first + back-by-proof"
```

---

### Task 5: Version bump + KNOWLEDGE_DUMP

**Files:**
- Modify: `.claude-plugin/plugin.json` — `version`.
- Modify: `KNOWLEDGE_DUMP.md`.

- [ ] **Step 1: Bump the version**

In `.claude-plugin/plugin.json` change `"version": "0.1.14"` to `"version": "0.1.15"`.

- [ ] **Step 2: Add the KNOWLEDGE_DUMP note**

Append to `KNOWLEDGE_DUMP.md` a new section:
```markdown
## Intent-First + Back-by-Proof (v0.1.15)

Every metric request is hard-gated: chotu states the data structure + interpretation branches (from `tm-chotu-query-rigor/METRIC_CATALOG.md`), HARD-STOPS for the user's goal + branch, then sample-first, then pulls. Every number ships back-by-proof — exact SQL + capped raw sample (10–20 rows) + aggregate breakdown; "all raw data" → export path. Session-lock stops re-asking the same metric; "just the number" collapses the dialogue but still discloses branch + SQL. Catalog cites section skills (never copies formulas). Grounds two failures: Kunal (summed across inventory tables) → never-sum anti-pattern in `tm-chotu-inventory`; Rahul (invented revenue from incomplete orders) → revenue branch table with LOCKED GMV vs SLICE placement-momentum.
```

- [ ] **Step 3: Verify**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
grep -q '"version": "0.1.15"' .claude-plugin/plugin.json && echo OK1
grep -q "Intent-First + Back-by-Proof (v0.1.15)" KNOWLEDGE_DUMP.md && echo OK2
```
Expected: `OK1 OK2`.

- [ ] **Step 4: Commit**

```bash
git add .claude-plugin/plugin.json KNOWLEDGE_DUMP.md
git commit -m "chore(release): bump to v0.1.15 + KNOWLEDGE_DUMP note"
```

---

### Task 6: Ship (secret-scrub → merge → tag → push → zip)

**Files:** none new — release mechanics.

- [ ] **Step 1: Secret-scrub the diff (shared repo — MANDATORY)**

Run:
```bash
cd ~/.claude/plugins/marketplaces/tm-chotu
git diff main...impl/v0.1.15-intent-first-proof | grep -iE "AKIA|secret|password|api[_-]?key|token|BEGIN (RSA|OPENSSH)|[0-9]{12}|maindb|\.rds\.amazonaws" || echo "clean"
```
Expected: `clean`. If anything prints, STOP and scrub before continuing.

- [ ] **Step 2: Merge to main**

```bash
git checkout main
git merge --no-ff impl/v0.1.15-intent-first-proof -m "release: v0.1.15 intent-first metrics + back-by-proof"
```

- [ ] **Step 3: Tag**

```bash
git tag v0.1.15
git tag --list | tail -3
```
Expected: `v0.1.15` present.

- [ ] **Step 4: Push main + tag** (requires user confirmation — outward-facing on shared repo)

```bash
git push origin main
git push origin v0.1.15
```
Expected: both refs pushed to `git@gitlab.com:tm-exp/tm-chotu.git`.

- [ ] **Step 5: Rebuild the leak-safe zip**

```bash
git archive --format=zip --prefix=tm-chotu/ -o ~/Desktop/tm-chotu-v0.1.15.zip v0.1.15
unzip -l ~/Desktop/tm-chotu-v0.1.15.zip | grep -E "METRIC_CATALOG|plugin.json" && echo "zip-ok"
```
Expected: catalog + plugin.json listed, `zip-ok`. `git archive` = tracked-only, so no stray secrets.

---

## Post-implementation verification (per audit-after-ship rule)

After Task 6, run a scenario-replay read-through (not a code test):
1. Mentally run "chotu show me all inventory" against the new protocol → must explain 2 sources + may-not-sync, HARD-STOP for goal, never sum. Confirm the anti-pattern line + catalog branch (b) VERIFY-GAP make this the only possible behavior.
2. Mentally run "revenue yesterday" → must present the 4-branch table (LOCKED GMV vs SLICE momentum), HARD-STOP, deliver with SQL + sample + status breakdown.
3. Run a 6–10 metric-question round through `tm-chotu-query-rigor` to confirm the gate fires and proof ships.

Report results; if any scenario doesn't resolve cleanly, open a follow-up task — do not silently pass.
