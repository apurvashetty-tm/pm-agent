---
description: Verify the OFFICIAL Metabase connector (not the unofficial one) + Mixpanel. Report persona + mood. Light, fast.
---

# tm-chotu tools-check

## Step 1 — identify WHICH Metabase connector is connected

🔴 **Two Metabase connectors exist and they are easy to confuse.** Do not assume — fingerprint by toolset, because the display names are nearly identical.

Inspect the available MCP tools and classify:

| Fingerprint | Verdict |
|---|---|
| Has **any two of** `search`, `construct_query`, `execute_query`, `query`, `create_question`, `create_dashboard` | ✅ **OFFICIAL** — correct. Namespace is UUID-prefixed (`mcp__<uuid>__*`); the UUID is per-install, never match on it. Toolset is configurable, so do **not** require the full list — some installs add `visualize_query`, some omit it. There is no `execute_sql` |
| Has `retrieve`, `execute`, `export`, `clear_cache`, `list` | 🔴 **UNOFFICIAL** — wrong connector, being sunset |
| Both present | ⚠️ Official wins; tell the user to disconnect the unofficial one |
| Neither | ✗ Not connected |

**If the UNOFFICIAL one is the only Metabase connector present, report it as a FAILURE, not as a working Metabase.** Say exactly this:

> 🔴 You have **Metabase (Unofficial)** connected, not the official one. tm-chotu will not use it. Go to claude.ai → Settings → Connectors, disconnect it, and connect the connector titled plain **Metabase** ("Query and explore your Metabase data", verified badge). See INSTALL.md → MCP wiring.

Do **not** fall back to the unofficial connector to make the check pass.

## Step 2 — probe the official connector

Only if Step 1 found the official one. Use its own toolset — never `list`, which belongs to the unofficial connector:

1. `query` or `execute_query` → confirm the connection responds. ⚠️ **Never probe with `search`** — it exists on both connectors and proves nothing. There is no `get_table` and no `execute_sql` on the official one.
2. Confirm **DB 170 (Redshift)** is visible
3. If the user asks stock/inventory questions, also confirm **DB 180 (PROD INVENTORY)** — live quantities live there, not on 170

## Step 3 — Mixpanel

Try `Get-Projects` or equivalent → confirm Production Env **2900163** is accessible.

## Step 4 — state read

Read `~/.claude/tm-chotu-state.json` if it exists.

## Step 5 — report

| Component | Status | Notes |
|---|---|---|
| Metabase connector | ✅ official / 🔴 unofficial / ✗ none | fingerprinted by toolset, not by name |
| DB 170 reachable | ✓ / ✗ | shared default |
| DB 180 reachable | ✓ / ✗ / n/a | needed for live inventory |
| Mixpanel MCP | ✓ / ✗ | Production Env 2900163 |
| Persona | value or "not set" | |
| Default mood | value or "not set" | |
| Onboarded | true / false | |

Any ✗ or 🔴 → give the fix from `INSTALL.md`, naming the specific step.

Caveman one-liner output, no preamble.
