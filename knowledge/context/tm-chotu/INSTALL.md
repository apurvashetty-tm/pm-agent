# Install — tm-chotu

## Prerequisites

- Claude Code (latest)
- `superpowers` plugin installed (companion dep)
- Metabase account with at least DB 170 (Redshift) access
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

Restart Claude Code. The token is saved in Claude's marketplace cache only — won't be re-prompted.

**For updates later**, just run `claude plugin update tm-chotu` — the cached marketplace knows how to re-fetch.

### Path C — Local install from a zip (non-git, ask Mangesh for the file)

If you can't use git at all (corporate restrictions, etc.), ask Mangesh to send you a `tm-chotu-v0.1.5.zip` over Slack / email.

```bash
# 1. Unzip wherever you want
unzip ~/Downloads/tm-chotu-v0.1.5.zip -d ~/tm-chotu

# 2. Add as marketplace from local path
claude plugin marketplace add ~/tm-chotu

# 3. Install
claude plugin install tm-chotu@tm-chotu
```

Restart Claude Code.

**Updating** with this path requires Mangesh sending a new zip each release. Less convenient — Path A or B is preferred.

## MCP wiring

### Metabase MCP — auto-wired, zero config

The plugin ships `.claude-plugin/.mcp.json` declaring the Metabase MCP. Auto-registers on plugin install.

**First-use flow:** When tm-chotu first hits the Metabase MCP, your browser opens a one-time OAuth handshake against `https://one-truemeds.metabaseapp.com/api/mcp`. You authorise with your Truemeds Metabase account. After that, it's silent.

**DB visibility:** whatever your Metabase account is scoped to. DB 170 (Redshift) is the shared default and should be reachable for everyone.

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
claude plugin update tm-chotu
```

Then restart Claude Code. The cached marketplace re-fetches from GitLab automatically. **No new zip needed.**

### Path C (local zip) — overwrite-and-refresh

If you installed via Path C originally, the marketplace points at a local folder (e.g. `~/tm-chotu`). To take a new version:

```bash
# 1. Overwrite the SAME folder with the new zip contents (don't extract to a new path)
unzip -o ~/Downloads/tm-chotu-v0.1.5.zip -d ~/

# 2. Refresh marketplace metadata
claude plugin marketplace update tm-chotu

# 3. Update the installed plugin
claude plugin update tm-chotu

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
| Metabase MCP red | Check you're logged into Metabase in browser; the OAuth handshake needs an active Metabase session. Try `claude mcp list`. |
| Mixpanel MCP red | Not yet connected. Use claude.ai connector marketplace or `claude mcp add` per above. |
| Onboard didn't fire | Run `/tm-chotu-onboard` manually. |
| Caveman not active | Check `superpowers` plugin is installed (companion dep). |

## Uninstall

```bash
claude plugin uninstall tm-chotu
claude plugin marketplace remove tm-chotu   # optional, removes the marketplace registration too
```
