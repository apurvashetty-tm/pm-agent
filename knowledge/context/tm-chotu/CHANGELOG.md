# Changelog

## [0.4.3] — 2026-08-25

**Content-only release. 0.4.2 was correct in the repo but could not be delivered.**

🔴 **A reused version number does not refetch.** v0.4.2 was tagged, then amended with the CONTESTED fast-path fixes under the *same* version number. Installing it produced:

```
✔ Plugin "tm-chotu" updated from 0.3.10 to 0.4.2 for scope user.
```

…and then served the **pre-amend** content. `claude plugin list` reported `0.4.2`. **18 files differed from the repo**, including the fast-path carve-out that was the headline fix. The plugin cache is keyed on the **version number**, not on content, so a reused number is a cache hit — the CLI never re-downloads and never warns.

This is the same failure shape as everything else this cycle: **a green signal sitting on top of wrong content.** It is also invisible to `preflight.py`, which checks the repo — the repo was right; delivery was wrong.

**The rule, now written into the ledger as L24 and into UPDATE.md:** once a version number has been tagged, it is burned. Any content change gets a **new** number, even a one-character fix. Never `git tag -f`, never amend under a live tag.

No knowledge content changed between 0.4.2 and 0.4.3. Everything in the 0.4.2 entry below is what actually ships here.

## [0.4.2] — 2026-08-25

**A re-review of v0.4.1 by a cold agent found ~25 more defects, including one that repeats the exact failure that broke Kunal's install.** This release fixes them and rebuilds the release gate around checks that can find problems nobody has listed yet.

### Install / update instructions — the ship-stopper

- 🔴 **The zip-update recipe in README and UPDATE silently did nothing on a marketplace install.** It said the plugin lives at `.../cache/tm-chotu/tm-chotu/` and to unzip "into the parent". That folder is **named for the version**, and the zip carries a top-level `tm-chotu/` prefix — so the files landed in a dead sibling `.../tm-chotu/tm-chotu/tm-chotu/`, the live plugin was untouched, and **no error was printed**. You restart, see the old behaviour, and have nothing to debug from. INSTALL.md had it right all along (`-d ~/`, for a *local-folder* marketplace); README and UPDATE had copied that recipe onto the wrong path.
- **`claude plugin list | grep tm-chotu` cannot show the version** — the version is on the *next* line. Every "verify the update worked" instruction now uses `grep -A3`.
- **`claude plugin list` cannot show the install source either.** Route detection now uses `claude plugin marketplace list`, which prints `Source:`.
- **`claude plugin install <path>` removed.** `install` resolves plugin **names from configured marketplaces**; handed a path it fails, and a user who had already uninstalled was left with nothing.
- **UPDATE.md had no Step 2**, and all three of its post-update verification asks were 0.3.x behaviours — they passed on the *previous* release, so the check could not detect a failed update. Renumbered, and the checks are now 0.4.x-specific.
- Path letters no longer collide (INSTALL's "Path B" meant something different from README's).

### Metabase connector — corrected against the connector's own tool schemas

Read live off the running connector rather than from memory. Third correction to this fact; the previous two were also asserted confidently.

- **`execute_sql` does not exist.** Native SQL goes through **`execute_query`**. Fixed at 18 sites.
- **The 2,000-row cap belongs to `query`**, not to a SQL runner — it auto-paginates in **200-row pages** with a `continuation_token`, and **a missing token is ambiguous** (budget spent *or* table smaller than one page). It never reports that it stopped early.
- **The fingerprint demanded six tools; only four are present on a normal install**, so `/tm-chotu-tools-check` reported "not connected" for a correctly-connected user. It now matches on **any two**, because the toolset is configurable per install.
- **`claude mcp list` does not print toolsets** — the docs told you to run it and then read a toolset off it. It prints name, URL and status; the **URL** is what discriminates.
- **Hardcoded per-install UUIDs removed** from the Mixpanel probe in `/tm-chotu-onboard` — that UUID was this machine's, so every other user's probe reported `mixpanel: false`.

### False claims in our own artefacts

- **CHANGELOG said "Seven facts … tagged CONTESTED at every site."** The real count is **four**, and "every site" was false. Corrected, with the overstatement named.
- **CHANGELOG claimed `400` was removed from KD.** It wasn't, and didn't need to be — KD's `400` sits under `order_details.workflow_status`, where it is correct.
- **README's token figures were wrong at both ends** (claimed ~5k / 0.25k–13.5k; actual ~5.6k always-on, ~0.44k–15.4k on-invoke). Now measured, with the command to re-measure.
- **README said `/tm-chotu-onboard` auto-fires on first session.** It doesn't — the SessionStart hook prints a reminder and nothing invokes it.
- **`m_courier_partner_master` has 14 partner IDs, not 13** — the table listed 14 while the prose said 13, counting ID 35 (Self / Hand Delivery) inside the external 3PLs.
- **PAT storage was described reassuringly and wrongly.** A `https://oauth2:<TOKEN>@…` marketplace URL is persisted **in cleartext in two on-disk locations**. Now stated, with the advice to scope and expire the token.
- **`KNOWLEDGE_DUMP.md` is no longer described as the master.** It opened "v0.0.1 draft — PRE-REDLINE" and called itself the source-of-truth, while carrying superseded readings and **zero CONTESTED tags**. It is now labelled a historical source, and the rule is explicit: **the skills win on conflict.**

### Content

- **`cm_net` COGS was `SUM(rate)` — rate alone, no quantity.** That under-counts cost and therefore **overstates** contribution margin, which shifts a percentile cut. Now `SUM(rate * quantity)`, matching the locked COGS rule. Two independent reviewers flagged this.
- **`order_tat_details.pickup_time` stated one side of a contested fact untagged** in `dcoe-cohorts` while `tat` carried the ⚠️ tag. Both sides are tagged now.
- **KD claimed the failure ledger has 19 entries; it has 23.** Found by the new drift check, not by a human.

### 🔴 The CONTESTED gate had a hole you could drive a truck through

A behavioural test asked a cold agent "which DB for Faridabad inventory?" It **passed** — stopped and asked, refused to pick a side. But it reported *why it nearly didn't*, and the reason was structural:

**`ASK_RESOLVER.md` is the designated FAST PATH.** The entry skill says a metric question that resolves there is answered on the locked default. A Faridabad stock question resolves to **"LOCKED — DB 180"** and **never reaches the CONTESTED gate at all.** Same bug on Golden Geese (`ASK_RESOLVER:117`). Two more sites asserted the contested side as fact with no tag: `METRIC_CATALOG` called DB 180 "universal across all active WHs incl. Vinculum-backed Faridabad", and `tm-chotu-inventory`'s own anti-pattern list declared the DB 432 reading "was misleading" — **ten lines from the tag saying the question is unresolved.**

That last one also **re-explains an earlier test failure.** A previous agent was recorded as "overriding the CONTESTED tag". It wasn't. It was reading that anti-pattern line and correctly reporting what the file said. The failure was a genuine internal contradiction, not a disobeyed warning.

Fixes:
- The fast path is now **void on any contested subject** — stated as a hard rule in `using-tm-chotu`, and carved out inline on both affected `ASK_RESOLVER` rows.
- Every ⚠️ CONTESTED tag now declares a machine-readable **`[subject: …]`**, and preflight fails any *untagged* line that asserts a declared subject with settled language (`LOCKED`, `settled`, `was misleading`, `universal across`). This generalises: a new contested fact is covered the moment its tag is written.
- The three offending sites now carry tags and a resolving probe instead of a verdict.

### Release gate — `scripts/preflight.py` v3

v2 was a list of ten mistakes already made. A reviewer injected **eight new false claims and v2 passed all eight**, most damningly because **a bare ⚠️ anywhere on a line exempted that line from every contradiction check** — the check the file advertised most loudly could be defeated with an emoji.

v3 keeps the regression list but adds checks that **do not encode the right answer**, so they can catch things nobody has listed:

- **CONSISTENCY** — a named fact must carry **one** value tree-wide. Fails on *drift*, without knowing which value is correct. This found the 19-vs-23 ledger contradiction on its first run.
- **CONTESTED symmetry** — if file A tags a fact disputed and names skill B as holding the other reading, **B must carry a tag too**. Otherwise a reader landing on B sees a confident answer with no hint it is disputed.
- **CLI verb validation** against the real `claude plugin` subcommand list — this is exactly how `plugin install <path>` shipped.
- **Skill-routing validation** — a skill told to load `tm-chotu-<x>` that doesn't ship now fails.
- Links resolve **relative to the containing file** (v2 resolved against the repo root, so genuinely broken links passed); counts checked in **every** file, not just README; bare `0.3.9`-style versions caught; exemptions must be a **specific phrase stating the correct reading**, never an emoji or a lone negation.

The docstring no longer claims the holes are "all closed". It states the structural limit instead: **a contradiction detector built from a list of contradictions already made cannot find the next one.** A green run means "no known regression, no detected drift" — not "the content is true".

## [0.4.1] — 2026-08-21 — Gate bypass fixed; stale version reference removed

v0.4.0 shipped with a preflight **failure outstanding**. The gate caught it correctly; the release command piped preflight's output to `tail`, which made the exit status `tail`'s, so the `&&` chain continued past a non-zero exit. A gate that is easy to bypass by accident is not a gate.

- `INSTALL.md` carried "Corrected in v0.3.10" — a version stamp that goes stale the moment the next version ships, which is exactly what preflight flagged. Replaced with version-free wording.
- **Release rule:** run `python3 scripts/preflight.py` as its own command and read the exit code. Never pipe it into `head`/`tail`/`grep` in a chain that gates the release — the pipeline's status is the last command's, not preflight's.

## [0.4.0] — 2026-08-21 — Consistency pass: 25 contradictions resolved, preflight rebuilt

Three independent cold reviews of the v0.3.10 zip found ~25 defects, **eight of which would have produced a wrong number or sent someone to the wrong database**. All three noted that `preflight.py` passed clean with every one present. This release resolves them and rebuilds the gate.

**The structural cause.** Every fact re-locked during the v0.3.x work was written as *new content* while the superseded reading survived elsewhere — including inside `KNOWLEDGE_DUMP.md`, which the README calls the master every skill derives from. So corrections created contradictions instead of resolving them, and fixing the skills alone would have let them regenerate.

### Resolved — would have produced a wrong number

- **`595` is dead everywhere.** It was marked dead in `tables-enums` while still being the HA definition in `definitions`, `business-flows`, `modules`, `functions`, KNOWLEDGE_DUMP — and, worst, inside a **runnable copy-paste query** in `joins` Recipe 2. An HA metric built on it returns zero and reads as "no HA activity".
- **`233` is a pricing/catalogue id, not physical assignment** — corrected in `definitions`, `modules`, `business-flows`, `tables-enums` and KD.
- **`452` is not a pharmacist/transcription state** — corrected in the `modules` Pharmacist section.
- **`317` is not "doctor confirmed"** — `/tm-chotu-onboard` shipped a persona test query counting `order_status_id = 317` as doctor-confirmed orders. That is the first query a new user ever runs. Replaced with the `register_details` route.
- **`400` removed from the dead-order set** in `METRIC_CATALOG` and `query-rigor` — it is a WORK FLOW code with no `orderstatus` counterpart. KD's `400 PORTAL INCOMPLETE ORDER` row stays: it sits under `order_details.workflow_status`, where it is correct. (Earlier wording here claimed it was removed from KD too — it wasn't, and didn't need to be.)
- **Three "locked" order-exclusion sets reconciled** by purpose: the revenue dead-order set vs DCOE's cohorting filter (which deliberately *keeps* cancelled) vs the overview's placed-per-day count. Each now says what it is for and cross-references the others.
- **Metabase toolset corrected** — `get_table`, `list` and `get_metric*` do not exist on the official connector; `search` exists on **both** and cannot discriminate. The dead `mcp__plugin_tm-chotu_metabase__*` namespace removed (a plugin-declared MCP server, which this plugin has none of).
- **`cm_net` mislabelled as CM1** in `customer` and `projects`, breaking the plugin's own never-call-it-CM1 rule.

### Resolved — wrong tool or wasted time

`/tm-chotu-ask`'s duplicate routing map (missing 7 of 20 skills, so Rx and stock questions routed nowhere) deleted in favour of the single source, and its pipeline restored to the full gate set. `SKILL_REQUESTS` path corrected everywhere to the versioned install dir, with the "replaced on every update" caveat. Excel red/purple contradiction fixed in both the skill and `xl_kit.py`'s docstring. MCP row cap disambiguated (2,000 for `execute_sql`, 200 for `query`). `git pull` removed as a phantom fourth update path. Counts corrected: README status line (was **v0.1.5, 15 skills, 1 MCP** — 20 versions stale), ledger 19→23, joins 7→8, bucket table 53-vs-54, functions list missing Analytics. Stale "Live OTIF" relabelled with its probe date. `UPDATE.md` had no Step 1.

### CONTESTED — flagged, not guessed

**Four** facts have two locked readings and could not be resolved from the files: Faridabad on DB 180 vs 432 · Golden Geese 5th axis (SA vs generic-share) · `actual_dispatch_date` populated vs 100% NULL · `order_tat_details.pickup_time` required vs forbidden. Each is tagged **⚠️ CONTESTED** in the skills that state it, so whichever a reader lands on they see it is disputed. These need a decision, not a patch.

⚠️ **Two caveats on that tagging, stated plainly because the earlier wording here overstated it.** (a) An earlier draft of this entry said *seven* facts tagged *at every site*; the real count is four, and coverage is the skills only. (b) `KNOWLEDGE_DUMP.md` carries **zero** CONTESTED tags while shipping both readings of Golden Geese — it is a historical source, not a synced one, and the skills win on conflict. See the README's Master-reference note.

### `scripts/preflight.py` rebuilt

v1 scanned three files and passed six injected false claims. v2 scans the whole tree and adds **contradiction detection** — a table of re-locked facts that fails the build when both readings appear. Also closed: bare-filename paths, markdown link targets, all count claims (not just the first match), skill `name:` vs directory, command references, commands/ and skills/ scope, and secrets across every text extension.

**Verified adversarially:** seven false claims injected into a copy of the tree — nonexistent script, broken markdown link, stale version, bare update command, 595-as-live, 452-as-pharmacist, unofficial-toolset-as-official — plus a skill-count drift. **v2 caught all of them. v1 caught none.**

## [0.3.10] — 2026-08-19 — Metabase: connect the OFFICIAL connector, not a hardwired MCP

v0.3.9 corrected the false auto-wiring claim but pointed users at `claude mcp add` with a URL. That is the wrong route. **Metabase is connected per-user through Claude's connector marketplace**, and the plugin must not hardwire it.

**The risk this documents: there are TWO Metabase connectors** and they sit side by side in search results with near-identical names.

- ✅ **Metabase** (verified badge) — "Query and explore your Metabase data" — the one to use
- ❌ **Metabase (Unofficial …)** — "A high-performance MCP server for Metabase analytics data access" — being sunset

Picking the wrong one fails in a confusing way: tm-chotu refuses to fall back to the deprecated connector, so it reports the native server as unauthenticated and the user sees a broken plugin rather than a wrong choice. INSTALL.md now shows both side by side, gives the connect steps, and adds a toolset fingerprint for telling them apart after the fact (official exposes `execute_query`/`construct_query`; unofficial exposes `retrieve`/`clear_cache`), plus a troubleshooting row for exactly that symptom.

**`/tm-chotu-tools-check` was itself probing the wrong connector.** Step 1 called `mcp__Metabase__list` — and `list` belongs to the *unofficial* toolset. The command that exists to verify your setup was contradicting the plugin's own namespace policy, and would have reported a working Metabase for someone on the deprecated connector. It now fingerprints by toolset (official: `execute_query`/`construct_query`/`query`/`get_table`/`search`; unofficial: `retrieve`/`execute`/`export`/`clear_cache`/`list`), reports the unofficial connector as a FAILURE with the exact remediation, and refuses to fall back to it to make the check pass. Also now probes DB 180 for inventory access.

**Two more commands were on the deprecated connector.** `/tm-chotu-onboard` — the first thing a new user runs — probed with `mcp__Metabase__list` and ran its test query through `mcp__Metabase__execute`; `/tm-chotu-freshness` used `execute` too. Both `list` and `execute` are unofficial-toolset names. So three of the five commands were wired to the connector the plugin's own HARD RULE forbids: v0.1.6 sunset the unofficial MCP in the *skills* and nobody updated the *commands*. A new user could onboard entirely against a connector chotu refuses to use at runtime. All three now use the official toolset, and onboard fingerprints the connector before probing and names the exact remediation if it finds the wrong one.

## [0.3.9] — 2026-08-19 — INSTALL.md corrected (found by Kunal on a fresh install)

Three defects in INSTALL.md, all of which hit every new user. Reported by Kunal Wani against the v0.3.8 zip.

- **🔴 Metabase MCP is NOT auto-wired.** The doc claimed the plugin ships `.claude-plugin/.mcp.json` which auto-registers on install. **That file has never existed in the repo** — and the root `.mcp.json` has declared zero servers since v0.1.6, when the unofficial Metabase MCP was sunset and never replaced with the native one. So the claim has been false for roughly fourteen versions. New users installed, got no Metabase connection, and the troubleshooting table only said "check you are logged in" — which could never fix it. Now documented as a one-command manual add, with a dedicated troubleshooting row and a warning to remove the deprecated community connector.
- **Path C pointed at v0.1.5.** Both the install and update instructions said `unzip ~/Downloads/tm-chotu-v0.1.5.zip`. Version references are now `v<version>` placeholders so they cannot rot again.
- **Prerequisites listed DB 170 only.** Live inventory runs off **DB 180 PROD INVENTORY** (`INVENTORY_SCHEMA.product_inventory_data`), so anyone asking a stock question was blocked without knowing why. Added to prerequisites, DB-visibility notes and the verify table.

**NEW `scripts/preflight.py`** — the process fix. v0.3.8 shipped after a check that verified zip integrity, version match and leaks, but never verified the docs were true. Preflight now checks that every file path a doc claims to ship actually exists, that no stale version strings remain, that the update command is qualified everywhere, that the README skill count matches, that every skill has frontmatter, that the CHANGELOG leads with the shipping version, and that no secrets are present. Exit 1 blocks the release. Run it before tagging.

## [0.3.8] — 2026-08-19 — README: zip-update path spelled out inline

The README's Updating section covered the marketplace path and linked out to UPDATE.md for everything else — but zip-install users are exactly the ones who need steps in front of them, not a link. Both paths are now inline, starting with how to tell which one you are on (`claude plugin list`).

The zip path calls out the mistake that actually breaks it: **unzip into the PARENT of the plugin folder, not the folder itself.** The archive carries an internal `tm-chotu/` prefix, so extracting into the plugin folder produces `tm-chotu/tm-chotu/` and the plugin silently fails to load. Includes a worked path example.

## [0.3.7] — 2026-08-19 — Update instructions fixed and surfaced

`UPDATE.md` and the README both told users to run `claude plugin update tm-chotu` — the **bare name, which fails** with `Plugin "tm-chotu" not found`. That error reads like the plugin is missing rather than like a syntax problem, so it is the most common cause of "the update does not work". Both now lead with the qualified form **`tm-chotu@tm-chotu`** and explain why it looks redundant (format is `<plugin>@<marketplace>`, and both are called tm-chotu).

- **README gains an `## Updating` section** — the one command, the restart requirement, the qualified-name warning, the onboarding-survives reassurance, and links to UPDATE.md and CHANGELOG.md. Previously the only mention of updating was a stale command buried in the knowledge-gap loop.
- **UPDATE.md rewritten** — verification checks now test 0.3.x behaviour (cost≡COGS, the no-predict boundary, Rx routing to register_details) instead of the v0.1.12/0.1.13 behaviours it still referenced. Adds a troubleshooting table for the five things that actually go wrong.
- **README master-reference line corrected** — claimed KNOWLEDGE_DUMP covers §1–§12; it covers §1–§25.

## [0.3.6] — 2026-08-19 — Rx-generation grain edges; changelog brought current

- `user_details` confirmed on **DB 170 `tmmumpsdb`** — same database as `register_details`, so the fresh-vs-reused join is local, not cross-DB. Two independent review agents had flagged its placement as unstated.
- Three grain edges added to the fresh-vs-reused test: **multi-doctor orders** (buckets can double-fire and not sum), **unresolved** `doctor_id` as its own bucket (never folded into fresh or reused), and the **name comparison is a string compare** (normalise case/whitespace, report a near-match tail separately).
- Framing guard: a large reused-Rx share is **not** a defect finding — it is the auto-confirm path working as designed. Consult **load**, not consult **failure**.
- **CHANGELOG backfilled** — 0.1.15 → 0.1.20 and 0.3.0 → 0.3.5 had shipped with tags and detailed commits but no changelog entry. The file is what people read on update; it is now continuous.

## [0.3.5] — 2026-08-19 — SDPBD database and order route pinned

`salt_dosage_prescribed_by_doctor` (DCOE shorthand **SDPBD**, now expanded on first use) lives on **MySQL — Main DB (2) or Mangesh DB (630)**, schema `TMMUMPSDB` uppercase. Both are prod: extract by indexed key, compute locally.

It carries `fsp_id`, not `order_id`. Route to an order: **`SDPBD.fsp_id → final_substitute_product.final_subs_id → .order_id`**, which is also how you reach `customer_id` and a delivery-date anchor. Two review agents had independently declared this missing.

## [0.3.4] — 2026-08-19 — 452 is HA-required-only; prescriber_name is in-house

- **`452 PARTIALLY DIGITIZED` fires ONLY when an HA consultation is required.** An order needing no HA goes from digitized straight to `317` without ever stamping it. So 452 counts **HA-required orders, not doctor consultations** — counting consults off it undercounts by every doctor-only order, and the 7,397-vs-24,476 ratio is the HA-required share, not a consult rate.
- **`prescriber_name` is the in-house Truemeds doctor only** — a saved copy of that doctor's name on the register, never the external prescriber off a customer's uploaded Rx. That is what makes the source-1-vs-source-2 comparison valid: both sides are in-house identities.

## [0.3.3] — 2026-08-19 — Rx generation: two ordered sources

The two sources are ordered, not parallel, and the **comparison between them is the test**:

- **Source 1** — `register_details.prescriber_name`: which doctor processed the order. Roll up distinct `(current_order_id, prescriber_name)`; `COUNT(*)` counts dispensed medicines, not prescriptions.
- **Source 2** — `register_details.doctor_id → user_details.id → user_details.doctor_invoice_name`.
- **MATCH ⇒ fresh consultation. MISMATCH ⇒ no consultation on this order** — the system used an Rx generated earlier, and **`previous_order_id` is the order that Rx came from**. A mismatch is a category, not a data error.

`order_status` is **not** the tool for Rx counts or doctor attribution — it is the event ledger, for actor tracking only (who stamped 452, who stamped 317, call attempts, holds).

Residuals cleared: the routing row still advertised due-date prediction, and `ASK_RESOLVER` still carried `400` in the dead-order set.

## [0.3.2] — 2026-08-19 — chotu does not predict

**Scope correction.** The plugin maps data and locked derivations; it does not forecast. Days-of-supply is reframed as a **documented derivation** so a reader can interpret DCOE's output, and DCOE's cadence rules (D1 gate, per-patient grain, empirical rate) are recorded as **DCOE's decisions**. Due dates, overdue cohorts and next-expected-order are DCOE model outputs — point there.

Evidence for the boundary: DCOE back-tested refill logics on **n = 956,453** held-out pairs and days-of-supply came out **worse than predicting a flat 34 days for everyone** (template DoS mdAE 20.2d, early 83% of the time; flat-34 11.0d; residual-life 6.4d). DoS answers "when does the cupboard run out", not "when should we message them".

## [0.3.1] — 2026-08-19 — 595 is dead code

`595 HEALTH ADVISOR CALL ATTEMPTED` is never stamped — zero rows across a ~62k-order probe. The HA leg reuses 209/215. A metric built on 595 returns zero and reads as "no HA activity" rather than a broken metric.

Added the measured corroboration of the two-leg flow: 209 fires 2.36× and 215 2.73× per order, while 452 and 317 fire exactly 1.00× as one-time checkpoints.

## [0.3.0] — 2026-08-19 — Rx lifecycle + cadence; status labels corrected

**NEW skill `tm-chotu-rx-cadence`.** The governing correction: **the status label is not the status meaning.**

- **`452 PARTIALLY DIGITIZED`** is not transcription — the doctor consult is **done**, awaiting HA.
- **`209 DOCTOR ASSIGNED` / `215 CALL ATTEMPTED`** are each used **twice**, doctor leg and HA leg, with no separate HA code. Position relative to 452 is the only discriminator.
- **`317 DR ORDER CONFIRMED`** = all consults complete **or not required** — the scheduler's go-signal. 23% are system-stamped on the auto-confirm path.
- **`233 WAREHOUSE ASSIGNED`** attaches a warehouse id for **pricing/catalogue**, not physical assignment.

Also: `register_details` documented; the DCOE days-of-supply model absorbed (decode master, consumable units, stale `dosage_master`, frozen tmprod mirror, the template-ceiling trap); `400 PORTAL INCOMPLETE ORDER` corrected to **WORK FLOW** (no `orderstatus` 400 — the working dead-order set is `49, 312, 174, 57`); `warehouse_details` locked as the WH master over `pincode_warehouse_master`; gap-loop promoted to a hard stop with hedge-detection triggers; never echo ARNs or account ids.

**Ledger +3:** L21 row count is not freshness · L22 a check that cannot fail is not a check · L23 a status label is not the status meaning.

## [0.2.2] — 2026-08-19 — Inventory valuation LOCKED + the warehouse-identity trap

### Inventory valuation — locked, and it is always DERIVED

**No table holds cost against held inventory.** Cost exists in exactly two forms: **COGS** (cost applied on orders, NSIB — only knows a unit once it ships) and **`medicine_warehouse_master.pts`** (what the system shows now, off the latest inward). `mwm` has **no `modified_on`** (verified), so a PTS value cannot be aged — it may be this week's or 2023's. Every valuation is therefore derived, never read, and must say so.

- **Locked method:** 90d NSIB **product × batch** weighted average — `SUM(rate*quantity)/SUM(quantity)`, `active=1`, `rate>0` — × quantity.
- **Two grains that must match:** product × WH (incl. stock blocked on consult / invoice / packing) → DB 180 `product_inventory_data` × product-level cost. Batch level → `wp_bin_product_batch_mapping` × **batch-level** cost.
- **`wp_bin_product_batch_mapping` is BIN-level** — roll up to product × batch × WH first or a split batch counts twice. It carries `mrp`, `printed_mrp`, `expiry`, `pts` and **all four are wrong to use**: batch attributes come from `BATCH_MASTER_V` only, status ∈ {LOCKED, VERIFICATION_NOT_REQUIRED}.
- **Non-pickable = bin types EXCESS (4) + QUARANTINE (5)** from the 5-row `wp_bin_type_master`. Valuations always ship **sellable / non-pickable / total** — the total alone hides quarantine build-up, sellable alone understates what we own.
- `ASK_RESOLVER` HOLDING VALUE: ⚠️ PROPOSED → **LOCKED**.

### 🔴 The warehouse-identity trap (new ledger entry L20)

**Every MFC has its own database. The Metabase connection is the warehouse identity — the schema name is not.**

Measured on live data: schema `prod_picker` holds **798,325 rows / warehouse 20 (Mumbai)** on **DB 174**, but **206,459 rows / warehouse 23** on **DB 202**. Same name, different host, different stock — reading it from the wrong connection returns a populated, plausible, entirely wrong warehouse. DB 202 and DB 399 return identical rows for the same MFC schema (two connections onto one host), so `information_schema` visibility proves nothing about the right route.

Rules: use the warehouse's own connection; **assert `warehouse_id` from inside the table** (each holds exactly one); cross-WH work unions across **connections**, client-side, never cross-schema on one connection.

This was caught because the claim was challenged during review, not by the probe that produced it — the probe checked catalog visibility and I read it as data. Same family as L12, now recorded as its own entry.

### Also locked

- **`net_suite_invoice_batch.rate` is a per-unit COST**, not a selling price — stated explicitly because it has been mis-read before.
- **generic vs branded = `medicine_master.generic_branded` ONLY.** The `medicine_warehouse_master` flags are procurement's and must not be used for analysis.
- **`ORDER_RETURN` / `WH_ADJUSTMENT` inward lines carry corrupted unit costs** — the bulk of apparent inventory losses. Suspect by default.
- New `wp_bin_*` table family + the 5-code `wp_bin_type_master` enum in `tm-chotu-tables-enums`.

### Corrections

- **Snowflake DB 993:** v0.2.0 said native SQL is blocked there. That is true **of the MCP only** — the Metabase REST path (`POST /api/dataset/csv`, `x-api-key`) runs native SQL against 993 and bypasses the row cap. The old wording would have told someone a working path did not exist.
- **Excel kit lookup** now prefers the installed `cache` copy (`sort -V`) instead of resolving alphabetically to a dev clone.

KNOWLEDGE_DUMP § 24.


## [0.2.1] — 2026-08-19 — Two hard rules: Excel standard bundled, ask-resolver locked

Two user-mandated hard rules.

### Rule 1 — the Excel standard ships with the plugin

**NEW `tm-chotu-excel-deliverable`** — the house standard for any `.xlsx` a human other than the script author will open, now bundled so every employee gets the same rules *and the same tooling*: `xl_kit.py` (builder), `verify.py` (pass/fail gate), `demo.py` (reference implementation).

- No dead totals, no embedded constants, native types only, rounding display-only, zero formula errors.
- README sheet 1; Inputs / Workings / Outputs separated; cross-sheet links never copies.
- Colour is meaning; **negatives always red** via an explicit `[Red]` format section (font colour alone does not survive a green link or grey forecast cell).
- Forecasts declare their editable surface; scenario switch not copied sheets; Checks sheet with tie-outs.
- **The gate:** run `verify.py` and paste its output into chat before handover. Exit 1 = do not ship. **A FAIL is not a suggestion.**
- Paths made portable — the personal `~/.claude/skills` path is gone from `SKILL.md`, `xl_kit.py` and `demo.py`, replaced by a `find`-based lookup and self-location, so the kit works from any plugin install directory.
- The plugin copy is now **canonical**; the personal copy carries a pointer banner so the two cannot drift.

Verified end to end after bundling: `demo.py` builds, `verify.py` returns **PASS** with a clean recalc.

### Rule 2 — `ASK_RESOLVER.md`: many phrasings, one locked answer

**NEW `skills/tm-chotu-query-rigor/ASK_RESOLVER.md`** — people ask the same thing a dozen ways. The resolver collapses the wording so chotu stops re-litigating vocabulary.

- **Fast path (locked behaviour):** a resolved ask is answered immediately on its DEFAULT branch, with the branch **named in one line**, the alternate named, and full back-by-proof (SQL + capped sample + breakdown). The Intent-First branch dialogue does not run.
- **The gate still runs** when the ask does not resolve, crosses an ambiguity killer without picking a side, asks for something derived off a metric, or is gated with the gate shut.
- **The fast path removes the vocabulary question, never the branch declaration.** Answering without naming the branch is the failure the rule exists to prevent.
- **Six ambiguity killers** recorded — the places where interchangeable words hide two different numbers: placed vs delivered revenue · CM1 vs cm_net · cost vs COGS · MRP vs selling price vs PTS · inventory qty vs ₹ value · which ROAS/CAC variant.
- **Full sweep** across every metric the plugin knows: money (revenue, GMV, net revenue, AOV, cart value, invoiced, savings), margin & cost, price, inventory, customer (FTC/FOP, retention, LTV, order rank, tiers, cohorts), marketing (ROAS, CAC, attribution), operations (TAT, OTIF, PDD, in-transit, AWB, RTO, dead-order set), substitution.
- Rows are graded **LOCKED** / ⚠️ **PROPOSED** (awaiting confirmation — chotu must say so) / ❔ **gap** (never assert).

### `COST ≡ COGS` — LOCKED (user-stated)

Same cost basis; **only the scope differs** — COGS is that cost on a **sold** line, cost is that cost on **held** stock. One unit-cost concept asked at two stages of the same goods; never presented as rival definitions. The FIFO disclosure fires on both.

⚠️ Open: the unit-cost source for **on-hand** batches is not locked (NSIB is invoice-side and only knows a unit's cost once it ships), so **inventory holding value** ships as PROPOSED — flag the gap rather than substituting MRP or PTS.

### Also

- `tm-chotu-query-rigor` gains the resolver as its leading rule; `METRIC_CATALOG.md` now defers to it for routing and keeps owning the derivations.
- `using-tm-chotu`: routing rows for both new skills, resolver step in the prompt flow, two new don'ts (never ship an unverified .xlsx; never answer a metric without naming its branch).
- 18 → 19 skills.


## [0.2.0] — 2026-08-19 — Learnings bake: failure ledger, PII register, Mongo + logistics + Snowflake sources

The bake of everything learned since v0.1.20 (2026-07-23), framed as **learnings** — what we now know *and how we found out*. Two new skills, ten updated, six new KNOWLEDGE_DUMP sections, two latent defects fixed.

### New skills

- **`tm-chotu-learnings`** — the failure ledger. 19 entries, each `BELIEF → WHAT BROKE → LOCKED NOW → MEASURED COST`. Every rule in the plugin is now traceable to the mistake that paid for it: cached-cohort reuse (**227× off**), column-alias drift (**89.8% silent under-detection**), Redshift bigint division (**132×**), zero-sentinel IDs (**66% of fraud fires were artifact**), loose substitution matching (**hid 2 real mismatches, invented ~220 false ones**). The meta-lesson is stated up front: every entry is a *silent wrong answer, not an error*.
- **`tm-chotu-pii-register`** — where customer and staff PII actually sits, so queries and exports are built to avoid it. The `tm_view_nopii` access model, the confirmed-plaintext register, which "encrypted" columns are genuinely encrypted, the Redshift 170 exposure posture, and a hard guardrail (no `SELECT *` on register tables, no identity exports, flag before complying, never widen a grant to fix a `permission denied`).

### New knowledge

- **Mongo `OrderFootPrintTracking` (DB 3)** — the canonical per-order event log and the **only** source that sees cart activity (`order_status` records transitions only). Doc shape, the `$elemMatch` + `comments_date` access path that turns a 3.6 TB scan into a 0.9 s index scan, the UTC-vs-IST rule, the completeness caveat, and the raw-API path (the Metabase MCP cannot query Mongo at all).
- **Courier / AWB / logistics** — `courier_partner_id` mapping (XpressBees = 6), AWB lives on `net_suite_shipment_details` **DB 630 only**, `orderstatus 60` is sticky and collapses all post-dispatch states, and **`logistics_tracker` has been Airbyte-dead since 2026-07-20** despite mapping 100% cleanly.
- **`WMS.BATCH_MASTER_V` (Snowflake DB 993)** — batch-level locked-MRP source. Trailing space in the DB name, MBQL-only access, CDC change-stream grain (dedupe to max `VERSION`, tiebreak `EVENT_TIME`), and the locked-MRP rule on `MRP_REFORMED`.
- **Substitution defect classes** — MISMATCH / FORM_CHANGE / consent-misfire / DEACTIVATED_LINE_SHIPPED as four distinct things, the invoice-is-truth layer model, the "magnet fallback" runtime root cause, the two traps that caused a 7× overcount, and the Org-Subs engine parity result (98.56%, 2,282 lost subs).
- **`product_details.src_type_id`** — the PRODUCT_SOURCE_TYPE master, which separates algo behaviour from staff action.
- **`fsp_id` chain** — recovered from an unpushed commit; the only correct way to resolve what a shipped line replaced.

### New query-rigor rules

- **The named source is a constraint** — never switch data source silently.
- **A fresh scope means a fresh pull** — never narrow a new question to a cached cohort.
- **All-zero identifiers are absent, not values** — normalise at the substrate boundary; IDs only, amounts and flags keep their zeros.
- **Prod is prod** — one controlled scan for the id list, then index-only; classify locally. `order_id` is not a date proxy.
- **Normalise row shapes at the read boundary** — alias drift is silent.
- **Check for truncation on every pull** — MCP 2,000 / CSV API 1,048,575 / Snowflake MBQL 200.
- **Consult the PII register** before any identity column.
- **Verify freshness and coverage, not just existence.**
- **Someone else's flag is a lead, not a verdict** — and conversely, the ops tracker is truth for action state.

### Fixes

- **State-path drift (latent since v0.1.14)** — `using-tm-chotu` and `tm-chotu-mood-router` read persona/mood from `~/.claude/plugins/tm-chotu/.state.json`, which is not where onboarding writes it. Both now point at the canonical `~/.claude/tm-chotu-state.json` (outside the plugin, so it survives reinstalls). Persona and mood recall was silently broken after any reinstall.
- **Unpushed knowledge recovered** — the `fsp_id`-chain commit existed only in a second local clone and was never pushed; cherry-picked in.
- **Stale project row** — `tm-chotu-projects` still described this plugin as "building v0.0.1".
- **DB 3 mis-described** — data-sources called Mongo a "product catalog / unstructured data" store; it is the order event log.

### Also

- `medicine_quarter_master` refreshed to the v2 load (636,228 rows, new `quarter_label_fy`, 2026-Q3 threshold 19%) plus the DMS-reload grant-loss gotcha. Gate behaviour unchanged.
- `customer_details` on DB 170 was emptied 2026-08-13 with no backup — flagged in data-sources, query-rigor and the PII register. Probe row count before using it.
- KNOWLEDGE_DUMP § 18–§ 23.
- 16 → 18 skills.


## [0.1.20] — 2026-07-23 — HM/LM gate: no echo, no deny

When the gate is shut and the user names HM/LM first, do not echo the term or confirm/deny that the table exists — pivot.

## [0.1.19] — 2026-07-23 — HM/LM gate closes silently

Gate closure is silent: never narrate the gate check, and never surface the branded≠margin decoupling insight (that insight *is* the gated crux).

## [0.1.18] — 2026-07-23 — HM/LM product-margin segregation (gated)

`medicine_quarter_master` — per-product-×-quarter HM/LM tag. Hard gate: leadership persona **and** a margin-health goal; otherwise fall back to CM1/cm_net.

## [0.1.17] — 2026-07-22 — COGS + CM1 gross margin locked

COGS = `SUM(nsib.rate * nsib.quantity) WHERE active = 1`. CM1 = product revenue ex-GST − COGS. Mandatory FIFO disclosure on every COGS/margin answer: NSIB rate is the latest batch rate at invoice-creation, not NetSuite FIFO, and will not reconcile to the P&L.

## [0.1.16] — 2026-07-22 — dead-order status set

"Net of cancels" means the whole dead-order set, never just `57` — excluding only 57 leaks incomplete, discarded and scrapped rows into revenue.

## [0.1.15] — 2026-07-22 — Intent-First Protocol + back-by-proof

Every metric ask hard-gates on structure and interpretation branches before pulling, and every number ships with its SQL, a capped raw sample and an aggregate breakdown. Adds `METRIC_CATALOG.md`.


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
