# Updating tm-chotu

**For Claude:** the user wants to update the `tm-chotu` plugin to the latest version. Follow the steps below, run the commands, and report the result. Do **not** skip the verification step.

> **Onboarding is never lost.** The per-user state (persona + default mood) lives at `~/.claude/tm-chotu-state.json`, **outside** the plugin folder. Nothing below deletes it — the user does **not** need to re-run `/tm-chotu-onboard` after updating.

---

## Step 0 — find out how it's installed

```bash
claude plugin list
```
Look at the `tm-chotu` row:
- If it shows a **marketplace source** (`tm-exp/tm-chotu` / a GitLab URL) → use **Path A**.
- If it shows a **local path / folder** (installed from a zip) → use **Path B**.

Also note the **current version** shown — you'll compare it after updating.

---

## Path A — marketplace install (in-place, nothing removed)

```bash
claude plugin marketplace update tm-chotu   # refresh marketplace, pull the latest tag
claude plugin update tm-chotu               # update the plugin in place
```

If those subcommands aren't available in this CLI version, tell the user to run the interactive menu instead: `/plugin` → **Manage plugins** → **tm-chotu** → **Update**.

Then go to **Step 2 (restart)**.

---

## Path B — zip install (overwrite in place — no uninstall)

1. Confirm the new zip's location with the user (e.g. `tm-chotu-0.1.13.zip` or later in their Downloads).
2. Get the installed folder from the `claude plugin list` output in Step 0 (the local path for `tm-chotu`). Call its **parent** `<PLUGIN_PARENT>`.
3. Overwrite the files in place:

```bash
unzip -o <path-to>/tm-chotu-<version>.zip -d <PLUGIN_PARENT>
```

`-o` overwrites without prompting; the zip's internal `tm-chotu/` prefix drops the files back into the same plugin folder. This does **not** touch `~/.claude/tm-chotu-state.json`, so onboarding is preserved.

> If overwrite-in-place isn't practical, `claude plugin uninstall tm-chotu` then `claude plugin install <PLUGIN_PARENT>/tm-chotu` also works — onboarding **still** survives because the state file is external.

Then go to **Step 2 (restart)**.

---

## Step 2 — restart

Fully **quit and reopen Claude Code**. Skills and version metadata load at session start, so an update won't take effect until a fresh session.

---

## Step 3 — verify (do not skip)

```bash
claude plugin list | grep tm-chotu
```
Confirm the version is the new one (higher than what Step 0 showed).

Then, in a session, sanity-check the two newest behaviours:
- Ask: **"how do I get CM-high customers?"** → should route to the **`tm-chotu-dcoe-cohorts`** skill (added in v0.1.12) and **explain the logic — definition, derivation, source table — before pulling any data** (the explain-logic-first default, v0.1.13).

If the version is still old or the `tm-chotu-dcoe-cohorts` skill isn't found, the restart didn't take — fully quit Claude Code (not just the window) and reopen, then re-verify.

---

## What's new (recent versions)

- **v0.1.13** — explain-logic-first default: on any specific-point/metric question, tm-chotu states the logic it knows (definition + derivation + source + caveat) **before** pulling data.
- **v0.1.12** — new skill `tm-chotu-dcoe-cohorts`: derive the DCOE cohort axes (CM-high `cm_net`, Generic Champions, Coupon dependency, Substitution propensity, composite cohorts) **on Metabase alone, no DCOE instance required**.
