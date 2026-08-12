---
description: Re-verify Metabase + Mixpanel MCPs. Report current persona + mood. Light, fast.
---

# tm-chotu tools-check

## Step 1 — MCP probes

Run:

1. `mcp__Metabase__list` with model="databases", limit=5 → check it returns DB 170 (Redshift) in the list
2. Mixpanel — try `Get-Projects` or equivalent → check Production Env 2900163 is accessible

## Step 2 — State read

Read `~/.claude/tm-chotu-state.json` (if exists).

## Step 3 — Tabular report

| Component | Status | Notes |
|---|---|---|
| Metabase MCP | ✓ / ✗ | DB 170 (Redshift) is default |
| DB 170 reachable | ✓ / ✗ | All 156 tmmumpsdb tables |
| Mixpanel MCP | ✓ / ✗ | Production Env 2900163 |
| Persona | <value or "not set"> | |
| Default mood | <value or "not set"> | |
| Onboarded | true / false | |

Any ✗ → suggest fix from `INSTALL.md`.

Caveman one-liner output, no preamble.
