# Install — tm-chotu

## Prerequisites

- Claude Code (latest)
- **`superpowers`** plugin installed (companion dep — supplies brainstorming / TDD / systematic-debugging)
- **`caveman`** plugin installed (`caveman@caveman`) — tm-chotu defaults to caveman tone but does **not** ship the skill; without this plugin the tone default silently does nothing
- **Python `openpyxl`** if you'll build Excel deliverables (`pip install openpyxl`); LibreOffice optional, it enables the verifier's recalc check
- Metabase account with at least **DB 170 (Redshift)** access — the shared default
- **DB 180 (PROD INVENTORY)** access if you'll ask stock/inventory questions — live quantities run off `INVENTORY_SCHEMA.product_inventory_data` there, not off 170
- Mixpanel account with access to Production Env (project ID 2900163)
- **Access to** `gitlab.com/tm-exp/tm-chotu` (Truemeds GitLab — ask Mangesh / IT)

## Install — pick one path

The repo is **private**. The CLI shortcut `tm-exp/tm-chotu` doesn't work because Claude Code defaults that form to GitHub. Pick the path that matches your setup.

### Path A — SSH (recommended for engineers, default)

If you already use GitLab over SSH (you've pushed code to a Truemeds repo before), this just works.

```bash
claude plugin marketplace add git@gitlab.com:tm-exp/tm-chotu.git
claude plugin install tm-chotu@tm-chotu
```

Restart Claude Code.

**Don't have SSH set up?** Quick guide:

```bash
# 1. Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@truemeds.in"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy

# 3. Add to GitLab: gitlab.com → Preferences → SSH Keys → paste → Add key

# 4. Test
ssh -T git@gitlab.com
# Expect: "Welcome to GitLab, @your-username!"

# Now retry the install command above.
```

### Path B — HTTPS with GitLab Personal Access Token (no SSH setup)

If you don't want to deal with SSH keys, use a Personal Access Token (PAT).

**One-time setup:**

1. Go to gitlab.com → Profile (top-right) → Edit profile → Access tokens
2. Create a token:
   - Name: `claude-code-plugins`
   - Scopes: just `read_repository`
   - Expiry: 1 year (or whatever your security policy allows)
3. Copy the generated token (you won't see it again)

**Install:**

```bash
# Replace <TOKEN> with your PAT, then:
claude plugin marketplace add "https://oauth2:<TOKEN>@gitlab.com/tm-exp/tm-chotu.git"
claude plugin install tm-chotu@tm-chotu
```

Restart Claude Code. You won't be re-prompted for the token.

🔴 **Where the token ends up — read this before pasting a PAT.** The marketplace source string is persisted **verbatim, in cleartext, in at least two places**: `~/.claude/plugins/known_marketplaces.json`, and as the git remote in `~/.claude/plugins/marketplaces/tm-chotu/.git/config`. Your `https://oauth2:<TOKEN>@...` URL sits readable on disk in both. Use a **scoped, expiring** PAT (`read_repository` only), and revoke it in GitLab when you're done. If you can use SSH (Path A), prefer it — nothing is written in cleartext.

**For updates later**, run `claude plugin update tm-chotu@tm-chotu` — the cached marketplace knows how to re-fetch. ⚠️ **Use the qualified name.** Users have hit `Plugin "tm-chotu" not found` with the bare `tm-chotu`; on CLI 2.1.245 the bare name does resolve for some subcommands, so the failure looks version- or subcommand-specific. The qualified form works everywhere. See [UPDATE.md](./UPDATE.md).

### Path C — Local install from a zip (non-git, ask Mangesh for the file)

If you can't use git at all (corporate restrictions, etc.), ask Mangesh to send you the latest `tm-chotu-v<version>.zip` over Slack / email (builds live in `Code/tm-chotu/dist/` — take the highest version number).

```bash
# 1. Unzip into the PARENT — the archive already contains a top-level tm-chotu/ folder.
#    Extracting into ~/tm-chotu would give you ~/tm-chotu/tm-chotu/ and the next step fails.
unzip ~/Downloads/tm-chotu-v<version>.zip -d ~/

# 2. Add as marketplace from local path
claude plugin marketplace add ~/tm-chotu

# 3. Install
claude plugin install tm-chotu@tm-chotu
```

Restart Claude Code.

**Updating** with this path requires Mangesh sending a new zip each release. Less convenient — Path A or B is preferred.

## MCP wiring

### Metabase MCP — connect the OFFICIAL connector (per-user)

⚠️ **This plugin does NOT auto-wire Metabase, and it must not be hardwired.** Older versions of this doc claimed the plugin ships a `.claude-plugin/` MCP file that auto-registers on install — that file has never existed. Each user connects Metabase themselves, through Claude's connector marketplace. This doc has been corrected.

#### 🔴 There are TWO Metabase connectors. Pick the right one.

Search `metabase` in the connector list and you will see both, side by side:

| | Connector | Description | Use it? |
|---|---|---|---|
| ✅ | **Metabase** *(verified badge)* | "Query and explore your Metabase data" | **YES — this one** |
| ❌ | **Metabase (Unofficial …)** | "A high-performance MCP server for Metabase analytics data access…" | **NO** |

They sit next to each other in the results and read almost identically. The unofficial one is being sunset, and **tm-chotu will refuse to use it** — it will tell you the native server isn't authenticated rather than silently falling back to a deprecated connector, so if you pick the wrong one everything looks broken for a reason that isn't obvious.

#### Connect it

1. Go to [claude.ai](https://claude.ai) → **Settings → Connectors**
2. Search `metabase`
3. Choose the **official** one — plain title **Metabase**, verified badge, "Query and explore your Metabase data"
4. **Connect** → authorise with your Truemeds Metabase account
5. It becomes available in Claude Code automatically

#### Check which one you actually have

```bash
claude mcp list
```

⚠️ This prints **name + URL + status only — not the toolset.** What it *does* print that discriminates is the **URL**: the official connector shows `https://one-truemeds.metabaseapp.com/api/mcp`.

```
claude.ai Metabase: https://one-truemeds.metabaseapp.com/api/mcp - ✔ Connected
```

To fingerprint on tools instead, ask Claude in-session which Metabase tools it can see (`/tm-chotu-tools-check` does this):

- **Official (correct):** `search`, `construct_query`, `execute_query`, `query`, `create_question`, `create_dashboard` — namespace `mcp__<uuid>__*`, and **the UUID differs per install**, so never match on the UUID itself
- **Unofficial (remove it):** `retrieve`, `execute`, `export`, `clear_cache`, `list`

⚠️ **`search` is on BOTH connectors** — it cannot tell them apart. Fingerprint on `execute_query` + `construct_query` (official) vs `retrieve` / `clear_cache` (unofficial).

⚠️ **Match on ANY TWO of the official set, never all of them.** The toolset is configurable per install — some installs also expose `visualize_query`, some don't. Demanding the full list makes a correctly-connected user fail the check. There is **no `execute_sql`** on the official connector; native SQL goes through `execute_query`.

If you have the unofficial one connected, disconnect it in **Settings → Connectors** and connect the official one instead. Having both is fine only if the official one is present — tm-chotu picks by namespace and ignores the other — but the cleanest state is official only.

### Mixpanel MCP — per-user, add via Claude's connector marketplace

Each user authorises their own Mixpanel account. Two paths:

**Path A — claude.ai connector (easiest, recommended):**

1. Go to [claude.ai](https://claude.ai) → Settings → Connectors
2. Find Mixpanel → click Connect → authorise with your Mixpanel account
3. The connector becomes available in Claude Code automatically (HTTP MCP, OAuth-handled)
4. Verify with `claude mcp list` — should show `claude.ai Mixpanel: ✓ Connected`

**Path B — CLI (if you prefer config-as-code):**

```bash
claude mcp add mixpanel --transport http https://mcp.mixpanel.com/mcp
```

Then trigger first use; Claude prompts the OAuth flow.

**Project to use:** Production Env, project ID **2900163**. Once authorised you'll see the project in your Mixpanel MCP scope.

## Verify

In a fresh session:

```
/tm-chotu-tools-check
```

Should report:

| Component | Status |
|---|---|
| Metabase MCP | ✓ |
| DB 170 access | ✓ |
| DB 180 access (inventory questions) | ✓ if granted |
| Mixpanel MCP | ✓ (after you've connected) |

## First-time onboarding

Run if not auto-fired:

```
/tm-chotu-onboard
```

Picks persona (function) + default mood + runs a real test query on DB 170 + saves state to `~/.claude/tm-chotu-state.json`.

## Update to a new version

### Path A (SSH) / Path B (HTTPS+PAT) — one-liner

```bash
claude plugin update tm-chotu@tm-chotu
```

Then restart Claude Code. The cached marketplace re-fetches from GitLab automatically. **No new zip needed.**

### Path C (local zip) — overwrite-and-refresh

If you installed via Path C originally, the marketplace points at a local folder (e.g. `~/tm-chotu`). To take a new version:

```bash
# 1. Overwrite the SAME folder with the new zip contents (don't extract to a new path)
unzip -o ~/Downloads/tm-chotu-v<version>.zip -d ~/

# 2. Refresh marketplace metadata
claude plugin marketplace update tm-chotu

# 3. Update the installed plugin
claude plugin update tm-chotu@tm-chotu

# 4. Restart Claude Code
```

`unzip -o` overwrites in place. Important: extract to the **same parent directory** you used originally. If you used `~/tm-chotu` before, use `-d ~/` again (the zip already contains a top-level `tm-chotu/` folder).

> If you can't remember which path you used, run `claude plugin marketplace list`. If it shows a git URL, you're on Path A/B (use one-liner). If it shows a local path, you're on Path C (use overwrite-and-refresh).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Failed to clone marketplace repository: HTTPS authentication failed` | You're using the bare HTTPS URL without auth. Switch to Path A (SSH) or Path B (HTTPS+PAT). |
| `terminal prompts disabled` during clone | Same as above — auth not configured. |
| `Failed to add marketplace: Failed to parse marketplace file` | The plugin manifest changed format. `claude plugin marketplace update tm-chotu` then retry install. |
| Skills not loading after install | Restart Claude Code. Check `claude plugin list` shows `tm-chotu@tm-chotu`. |
| Metabase MCP missing entirely | **It is not auto-wired.** Connect the **official** Metabase connector via claude.ai → Settings → Connectors. See MCP wiring above. |
| chotu says "native Metabase MCP not authenticated" but you *did* connect one | You almost certainly connected **Metabase (Unofficial)**. Check `claude mcp list` — the official one has `execute_query`/`construct_query`; the unofficial has `retrieve`/`clear_cache`. Disconnect the unofficial, connect the official. |
| Metabase MCP red (added but failing) | Check you're logged into Metabase in the browser — the OAuth handshake needs an active Metabase session. Then `claude mcp list`. |
| Mixpanel MCP red | Not yet connected. Use claude.ai connector marketplace or `claude mcp add` per above. |
| Onboard didn't fire | Run `/tm-chotu-onboard` manually. |
| Caveman not active | Install the **`caveman`** plugin — it is a separate plugin (`caveman@caveman`), not part of `superpowers`, and tm-chotu does not ship it. |
| Excel verifier errors on import | `pip install openpyxl`. Without it `verify.py` raises ImportError rather than reporting FAIL. |

## Uninstall

```bash
claude plugin uninstall tm-chotu
claude plugin marketplace remove tm-chotu   # optional, removes the marketplace registration too
```
