# Updating tm-chotu

**For Claude:** the user wants to update the `tm-chotu` plugin. Follow these steps, run the commands, and report the result. Do **not** skip verification.

---

## 🔴 The two things that trip everyone up

**1. Use the qualified name `tm-chotu@tm-chotu`, not `tm-chotu`.**

```bash
claude plugin update tm-chotu@tm-chotu
```

Users have hit `Plugin "tm-chotu" not found` with the bare name, which reads like the plugin is broken or missing. It isn't — the format is `<plugin>@<marketplace>`, and both happen to be called `tm-chotu`, so the qualified form looks redundant and gets dropped. (On CLI 2.1.245 the bare name does resolve for some subcommands, so this looks version- or subcommand-specific. The qualified form works everywhere — always use it.)

**2. If you installed from the marketplace, never unzip anything.**

A marketplace install lives at `~/.claude/plugins/cache/tm-chotu/tm-chotu/<VERSION>/`. That folder is **named for the version** and is managed by the CLI. The release zip carries a top-level `tm-chotu/` prefix, so "extract into the parent" drops the files into a dead sibling `.../cache/tm-chotu/tm-chotu/tm-chotu/`. The live plugin is untouched, **no error is printed**, and you restart into the old behaviour with nothing to tell you why. Unzipping is only for a **local-folder** install.

---

## 🟢 Onboarding is never lost

Your persona and default mood live at **`~/.claude/tm-chotu-state.json`**, **outside** the plugin folder. Nothing here deletes it. You do **not** need to re-run `/tm-chotu-onboard` after updating.

---

## Step 1 — which route are you on?

The route depends on the **source**, and `claude plugin list` does not print the source. Use:

```bash
claude plugin marketplace list
```

Read the `tm-chotu` entry's **`Source:`** line:

| `Source:` shows | Route |
|---|---|
| a git remote / GitLab URL | **Route A — marketplace** |
| a local folder (e.g. `~/tm-chotu`) | **Route B — local zip** |

---

## Step 2 — note the current version

```bash
claude plugin list | grep -A3 tm-chotu
```

⚠️ **`-A3` is required.** The version is on its own line *underneath* the name, so a bare `grep tm-chotu` matches the name and hides the version:

```
  ❯ tm-chotu@tm-chotu
    Version: 0.4.3
    Scope: user
    Status: ✔ enabled
```

Write that number down — Step 5 compares against it.

---

## Step 3 — update

### Route A — marketplace (in place, nothing removed)

```bash
claude plugin marketplace update tm-chotu
claude plugin update tm-chotu@tm-chotu
```

Expected output:

```
✔ Plugin "tm-chotu" updated from <old> to <new> for scope user. Restart to apply changes.
```

If you are **asking Claude Code to run the update for you** rather than typing it yourself, add `-y`:

```bash
claude plugin update -y tm-chotu@tm-chotu
```

`--help` states `-y` is required when stdin/stdout is not a TTY; without it the confirmation prompt has nothing to read and the command stalls.

If the subcommands aren't in your CLI version, use the interactive menu: `/plugin` → **Manage plugins** → **tm-chotu** → **Update**.

**Do not unzip anything on this route.** See the warning at the top.

### Route B — local zip (overwrite the folder, then refresh)

1. Get the zip. Latest builds live in `Code/tm-chotu/dist/` — take the highest version number. Files are named `tm-chotu-v<version>.zip`.
2. Overwrite the **same folder** `marketplace list` showed you. The zip has a top-level `tm-chotu/` prefix, so extract into that folder's **parent** — for a marketplace at `~/tm-chotu`, the parent is `~/`.

```bash
unzip -o ~/Downloads/tm-chotu-v<version>.zip -d ~/
claude plugin marketplace update tm-chotu
claude plugin update tm-chotu@tm-chotu
```

`-o` overwrites without prompting. This does not touch `~/.claude/tm-chotu-state.json`.

> ⚠️ Do **not** try `claude plugin install <some/path>` — `claude plugin install` resolves plugin **names from configured marketplaces**, not filesystem paths. It fails with `Plugin "..." not found in any configured marketplace`, and if you uninstalled first you are left with no plugin. Re-point the marketplace instead: `claude plugin marketplace add ~/tm-chotu`.

---

## Step 4 — restart (required)

**Fully quit and reopen Claude Code** — not just the window. Skills and version metadata load at session start, so the update does nothing until a fresh session.

---

## Step 5 — verify (do not skip)

```bash
claude plugin list --json
```

Find the `tm-chotu@tm-chotu` entry: `"version"` must read the new number and `installPath` must end in `/<new-version>`. (`claude plugin list | grep -A3 tm-chotu` works too, but `--json` avoids grep fragility — `-A3` matches any plugin whose name *contains* "tm-chotu".)

🔴 **Two things that look like proof and are not.** Both are already true on a machine that has NOT updated:

- **`claude plugin details tm-chotu` reports the MARKETPLACE version, not the installed one.** It will print `tm-chotu 0.4.3` while `plugin list` still says `0.4.2`. It is the command a non-technical user reaches for first, and it tells them they are done when they are not. **`claude plugin list` is the only source of truth for what is loaded.**
- **The new version's cache folder already exists** at `~/.claude/plugins/cache/tm-chotu/tm-chotu/<new>/`, fully populated, before the update is applied. Downloaded is not active.

Then sanity-check behaviour in a fresh session. A check that also passes on the previous release cannot detect a failed update, so there is exactly **one** question that qualifies:

| Ask | Expected on 0.4.x |
|---|---|
| "which Metabase connector should I have, and what runs native SQL?" | **There is no `execute_sql`** — native SQL goes through **`execute_query`**. 0.3.10 tells you to use `execute_sql`, so this is the clean old-vs-new tell |

> ⚠️ **Only that one question discriminates.** Two obvious-looking checks do **not**, because 0.3.10 already gives the right answer: it already says the MCP caps at **2,000 rows** (only the *owning tool* changed), and it ships the **same 20 skill directories**, so "a new skill appeared" proves nothing.

Floor checks (these pass on 0.2.x+, so they prove the plugin loads, not that it updated):

| Ask | Expected |
|---|---|
| "what is cost?" | **Cost and COGS are the same basis**, differing only in scope — COGS on a sold line, cost on held stock |
| "when is customer 12345 due for a refill?" | **Refuses to predict** and points at DCOE |

If the version is still old, the restart didn't take. Fully quit Claude Code and reopen, then re-verify.

---

## What changed recently

| Version | What you'll notice |
|---|---|
| **0.4.x** | Metabase connector facts corrected against the connector's own tool schemas — **`execute_sql` does not exist** (native SQL is `execute_query`), the 2,000-row cap belongs to **`query`**, and the fingerprint now matches **any two** tools instead of demanding a full list that made correctly-connected users fail the check. Update instructions rewritten after the zip recipe was found to silently do nothing on marketplace installs. Contested facts tagged **⚠️ CONTESTED** where two skills disagree |
| **0.3.x** | New `tm-chotu-rx-cadence` skill. Doctor-portal status meanings corrected — `452` is *doctor consult done, awaiting HA* (and only fires when an HA is required), `209`/`215` serve both the doctor and HA legs, `317` is the scheduler's go-signal, `233` is pricing/catalogue not physical assignment. **chotu no longer predicts** — refill dates and overdue cohorts belong to DCOE |
| **0.2.x** | Failure ledger (`tm-chotu-learnings`), PII register with a hard guardrail, the Excel house standard with its verifier, and the ask-resolver fast path |
| **0.1.2x** | Intent-first gate on metrics, back-by-proof on every number, COGS/CM1 locked, HM/LM margin gate |

Full detail in [CHANGELOG.md](./CHANGELOG.md).

---

## If something looks wrong after updating

- **"Plugin not found"** → you used the bare name. Use `tm-chotu@tm-chotu`.
- **Version unchanged, no error** → on a marketplace install, you probably unzipped into the cache. That creates a dead sibling folder and changes nothing. Use Route A's two commands.
- **Version unchanged, restart done** → fully quit Claude Code, don't just close the window.
- **Version says NEW but the behaviour is OLD** → the release reused a version number after its content changed. The plugin cache is keyed on the **version number**, so a reused number is a cache hit: the CLI reports a successful update and serves the old tree, with `plugin list` confirming the number you expected. Prove it by diffing rather than trusting the string:

  ```bash
  diff -rq ~/.claude/plugins/marketplaces/tm-chotu ~/.claude/plugins/cache/tm-chotu/tm-chotu/<version> -x .git
  ```

  Fix is on the publisher's side — a new version number. **Never `git tag -f`, never amend under a live tag.** (Ledger L24.)
- **A skill isn't loading** → check `claude plugin list | grep -A3 tm-chotu` shows the new version first; skills are read at session start.
- **Answers look like the old behaviour** → you're in a session that started before the update. New session.
- **`claude plugin details` says 25 skills, the docs say 20** → both are right. The CLI counts our 5 slash-commands as skills; the repo counts 20 skills + 5 commands.
- **Something is wrong in the knowledge itself** → that's a content bug, not an install one. Draft a note in `SKILL_REQUESTS/` and send it to Mangesh.
