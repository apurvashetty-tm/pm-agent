# tm-chotu local integration

`knowledge/context/tm-chotu/` contains the preserved TrueMeds `tm-chotu` v0.1.20 package from the local ZIP. It is reusable reference context for Claude, Codex, and other tools working from this repository.

## Read order

1. Read `knowledge/context/tm-chotu/skills/using-tm-chotu/SKILL.md`.
2. Read only domain skills relevant to the task.
3. Use `knowledge/context/tm-chotu/KNOWLEDGE_DUMP.md` as dated reference, not live truth.
4. For SQL or metrics, read `tm-chotu-query-rigor` and verify freshness/source.

## Truth handling

- Separate sourced facts, assumptions, derived values, and recommendations.
- Mark uncertain items `[UNVERIFIED]`; mark user-provided items `[USER-PROVIDED]`; mark inferences `[INFERRED]`.
- Do not invent metrics, schema, permissions, workflows, or operational policy.
- Live data still requires authorized connectors or user-provided exports.
- Do not store credentials, customer PII, or raw production extracts here.

## Tool switching

Open `/Users/mac/src/pm-agent` as project root in Claude/Codex. These root files govern agent behavior:

- `AGENTS.md` — shared agent protocol, **including the mandatory tm-chotu routing table** (Truemeds trigger → which skill file to read)
- `CLAUDE.md` — Claude-specific workspace guidance
- `context/Claude.md` — short global context
- this file — tm-chotu adapter and read order

For ChatGPT, add this repository to a Project or attach this adapter plus the relevant files under `knowledge/context/tm-chotu/`. Local files do not become global model memory automatically.

### Codex specifically — what you get vs. what you don't

Codex reads `AGENTS.md` automatically at session start; that's the *only* automatic
part. Everything past that is Codex reading plain markdown files as instructions —
there is no equivalent of the Claude Code plugin's mechanics:

| Claude Code plugin (if installed) | Codex (this repo, no install) |
|---|---|
| `SessionStart` hook auto-sets caveman mode | Not automatic — ask explicitly if wanted |
| Skills auto-route by description match | Codex must be told to read `AGENTS.md`'s routing table; it won't infer it from a skill description the way Claude Code's Skill tool does |
| `/tm-chotu-onboard`, `/tm-chotu-ask` etc. as slash commands | Don't exist in Codex — the command `.md` files under `knowledge/context/tm-chotu/commands/` are readable as reference text only, not invokable |
| Metabase/Mixpanel MCP auto-wired via plugin's `.mcp.json` | Codex uses its own `.codex/config.toml` MCP wiring (separate, already configured for other tools in this repo) — tm-chotu's `.mcp.json` is not read by Codex |
| Query-rigor / caveman / gap-loop enforced by hook | Enforced only if Codex actually follows `AGENTS.md`'s "Hard rules" — no runtime enforcement, so restate the rule if a session seems to drift |

Net effect: Codex gets the same underlying knowledge (definitions, table names,
join recipes, algo logic) but none of the automation. Treat `AGENTS.md`'s routing
table as the substitute for what the plugin's hook would otherwise do for you.

## Updates

Replace only `knowledge/context/tm-chotu/` when a newer ZIP is approved. Review its `CHANGELOG.md` and `UPDATE.md` first. Keep this adapter and root instructions. Do not modify or push automatically.
