#!/usr/bin/env python3
"""Pre-release gate for tm-chotu. Run from the repo root BEFORE tagging:

    python3 scripts/preflight.py        # exit 1 = do not ship

Run it as its OWN command and read the exit code. Piping it (`preflight.py | tail`)
makes the pipeline's status the last command's, so `&&` walks straight past a
failure — that is how v0.4.0 shipped with an outstanding FAIL.

────────────────────────────────────────────────────────────────────────────
WHAT THIS CANNOT DO — read before trusting a green run.

This gate is a REGRESSION guard plus a DRIFT detector. It is not a proof of
correctness, and its PASS line is deliberately narrow about what it checked.

v1 scanned three files and passed six injected false claims. v2 added a
CONTRADICTIONS table and a reviewer then injected EIGHT more that it also
passed, because:
  - a bare warning emoji anywhere on a line exempted that line from every
    contradiction check — the check the file advertised most loudly was
    defeated by an emoji
  - count checks read README.md only, so the same claim in INSTALL/UPDATE was free
  - link targets resolved against the repo root, not the containing file
  - no CLI command, MCP tool name, or referenced skill name was ever validated
  - the version regex needed a leading "v", so a bare "0.3.9" walked past

v3 closes those. But the structural limit stands and is worth stating plainly:

    A contradiction detector built from a list of contradictions already made
    cannot find the next one.

CONTRADICTIONS below is a list of past mistakes. It re-detects regressions. It
will NOT catch a novel contradiction. The only checks here that generalise are
CONSISTENCY (a named fact must carry ONE value tree-wide — it fails on drift
without needing to know the right answer) and CONTESTED symmetry (if one file
says a fact is disputed, the file it names must say so too). Everything else is
hygiene. A green run means "no known regression and no detected drift", not
"the content is true". Content truth still needs a reader.

KNOWN RESIDUAL GAP, measured not guessed. Re-running the reviewer's eight
injections against v3 catches six. The one that structurally cannot be caught
is a DOMAIN NUMBER STATED ONCE AND WRONG ("the plugin locks all 142 ORDER
STATUS codes"). CONSISTENCY only fires when a fact appears in two places with
two values; a single confident wrong number has nothing to disagree with. No
structural rule can find it — only ground truth can. Assume this gate is blind
to it and check domain numbers by hand.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ["README.md", "INSTALL.md", "UPDATE.md", "CHANGELOG.md"]
TEXT_EXT = {".md", ".json", ".py", ".sh", ".yaml", ".yml", ".txt", ".toml"}
fails, warns = [], []


def read(rel):
    p = ROOT / rel
    return p.read_text(errors="ignore") if p.exists() else ""


def tree(skip_docs_superpowers=True, skip_history=False):
    """Every shipped text file — skills, commands, docs, scripts.

    skip_history drops CHANGELOG.md: it is a historical record and is *supposed*
    to describe superseded facts. Contradiction/path checks on it are noise.
    """
    for f in sorted(ROOT.rglob("*")):
        if not f.is_file() or ".git/" in str(f) or f.suffix not in TEXT_EXT:
            continue
        if skip_docs_superpowers and "docs/superpowers" in str(f):
            continue
        if skip_history and f.name == "CHANGELOG.md":
            continue
        if f.name == "preflight.py":       # this file quotes the patterns it hunts
            continue
        yield f.relative_to(ROOT), f.read_text(errors="ignore")


version = json.loads(read(".claude-plugin/plugin.json") or "{}").get("version", "?")
skills = sorted(d.name for d in (ROOT / "skills").iterdir() if (d / "SKILL.md").exists())
commands = sorted(p.stem for p in (ROOT / "commands").glob("*.md"))

# -- 1. CONTRADICTIONS - regression guard over past mistakes ------------------
# (label, wrong-reading regex, exemption regex). A line matching `wrong` and NOT
# matching `ok` is a live contradiction.
#
# RULE: an exemption must be a SPECIFIC PHRASE that states the correct reading.
# Never a bare emoji, never a lone negation word. v2 allowed a warning emoji as
# an exemption, so decorating a reversed fact with it made the fact invisible to
# the very check meant to catch it. Do not reintroduce that.
CONTRADICTIONS = [
    ("595 presented as a live HA status (it is never stamped)",
     r"\b595\b", r"DEAD|never stamped|NOT 595|never 595|reuses 209|209/215|zero rows|stale"),
    ("233 presented as physical warehouse assignment",
     r"233\s*(WAREHOUSE ASSIGNED|=)", r"pricing|catalogue|not physical|NOT physical"),
    ("452 presented as transcription / a pharmacist state",
     r"452[^\n]*(pharmacist|transcription|digitis|Pharmacist)",
     r"doctor consult|awaiting HA|HA-required|HA path|clinical checkpoint|not a|NOT a"),
    ("317 presented as 'a doctor confirmed it'",
     r"doctor.confirmed[^\n]*317|317[^\n]*=\s*doctor.confirmed",
     r"scheduler|not \"a doctor|go-signal|23%"),
    ("dead-order set still contains 400 (WORK FLOW code, no orderstatus 400)",
     r"NOT IN \([^)]*\b400\b|IN \(49, 274, 400", r"removed|WORK FLOW"),
    ("get_table / get_metric claimed on the official Metabase connector",
     r"get_table|get_metric", r"no `get_table`|has no|does not exist|wrong|never"),
    ("execute_sql claimed as an official Metabase tool (it does not exist)",
     r"`execute_sql`", r"[Nn]o\W{0,4}`execute_sql`|does not exist|not exist|native SQL goes through"),
    ("2,000-row cap attributed to a SQL runner (the cap is on the `query` tool)",
     r"execute_sql[^\n]*2,?000|2,?000 rows[^\n]*execute_sql", r"does not exist"),
    ("`list` claimed as an official Metabase tool",
     r"(?<!Un)(?<!un)official[^|\n]*`list`", r"never|unofficial"),
    ("dead namespace mcp__plugin_tm-chotu_metabase",
     r"plugin_tm-chotu_metabase", r"there is no|never|declares none"),
    ("bare `claude plugin update tm-chotu` (the qualified name is required)",
     r"plugin update tm-chotu(?!@)", r"tm-chotu@tm-chotu|not found|bare name"),
    ("`claude plugin install <path>` - install resolves NAMES from marketplaces",
     r"plugin install [~./]", r"do \*\*not\*\*|does not accept|not a path|fails with"),
    ("unzip into the versioned plugin CACHE (creates a dead sibling, no error)",
     r"unzip[^\n]*plugins/cache", r"never|do not|dead sibling"),
    ("SKILL_REQUESTS at ~/.claude/plugins/tm-chotu/ (not the install path)",
     r"~/\.claude/plugins/tm-chotu/SKILL_REQUESTS", r"never|wrong"),
]
for rel, body in tree(skip_history=True):
    for label, wrong, ok in CONTRADICTIONS:
        for line in body.splitlines():
            if re.search(wrong, line) and not re.search(ok, line):
                fails.append(f"CONTRADICTION [{label}] - {rel}: {line.strip()[:100]}")

# -- 2. CONSISTENCY - a named fact must carry ONE value tree-wide -------------
# GENERALISES. Does not encode the right answer, only that there must be one.
# When a fact legitimately changes, this fails until every site is updated -
# which is the point. Add a row whenever a number gets repeated across files.
CONSISTENCY = [
    ("m_courier_partner_master partner-ID count", r"m_courier_partner_master`? \((\d+) partner IDs"),
    ("Metabase MCP row cap", r"caps? at \*\*([\d,]+) rows"),
    ("Metabase MCP cap (prose form)", r"([\d,]+)-row MCP cap"),
    ("Metabase MCP page size", r"([\d,]+)-row pages"),
    ("failure-ledger entry count", r"ledger[^\n]*?(\d+) entries"),
    ("always-on token cost", r"\*\*~([\d.]+)k tokens always-on"),
    ("active warehouse count", r"(\d+) truly active WHs"),
]
for label, pat in CONSISTENCY:
    seen = {}
    # scan EVERYTHING including docs/superpowers: a stale planning doc ships in
    # the zip and a reader can quote it. A 10x-wrong row cap survived there.
    for rel, body in tree(skip_docs_superpowers=False, skip_history=True):
        for v in re.findall(pat, body):
            seen.setdefault(v.replace(",", ""), []).append(str(rel))
    if len(seen) > 1:
        detail = " | ".join(f"{v} in {', '.join(sorted(set(f))[:3])}" for v, f in sorted(seen.items()))
        fails.append(f"DRIFT [{label}] - {len(seen)} different values ship: {detail}")

# -- 3. CONTESTED symmetry - both sides must be tagged -----------------------
# GENERALISES. If file A tags a fact CONTESTED and names skill B as holding the
# other reading, B must carry a CONTESTED tag too. Otherwise a reader who lands
# on B sees a confident answer with no hint it is disputed - which is exactly
# what happened with Golden Geese and with order_tat_details.pickup_time.
# A TAG is a CONTESTED marker inside a skill or command. Prose elsewhere that
# merely discusses contested facts (CHANGELOG, README, KD) is not a tag, and a
# backticked `CONTESTED [subject: ...]` is a reference to the convention, not a
# use of it. Both would otherwise produce noise that trains you to ignore this.
def _is_tag(rel, ln):
    if "CONTESTED" not in ln:
        return False
    if not str(rel).startswith(("skills/", "commands/")):
        return False
    if ln[:ln.index("CONTESTED")].count("`") % 2 == 1:
        return False        # inside a code span: a reference to the convention
    if re.match(r"^\s*(name|description):", ln):    # frontmatter, not body
        return False
    return True

contested = [(rel, ln.strip()) for rel, body in tree()
             for ln in body.splitlines() if _is_tag(rel, ln)]
tagged_files = {str(rel) for rel, _ in contested}
# Only a tag that actually CLAIMS another skill holds the opposing reading
# implies that skill must be tagged. A policy line that merely names a skill
# (e.g. the fast-path rule in using-tm-chotu) is not such a claim.
OPPOSING = re.compile(r"\bstates\b|still (?:says|defines)|carries the opposing"
                      r"|holds the other|\bsay the\b|\brequires\b| vs ", re.I)
for rel, ln in contested:
    if not OPPOSING.search(ln):
        continue
    for named in set(re.findall(r"`(tm-chotu-[\w-]+)`", ln)):
        target = f"skills/{named}/SKILL.md"
        if named in skills and target not in tagged_files:
            fails.append(f"CONTESTED ASYMMETRY - {rel} says `{named}` holds the other reading, "
                         f"but {target} carries no CONTESTED tag: {ln[:80]}")

# 3b. Every CONTESTED tag must DECLARE its subject: `CONTESTED [subject: x, y]`.
#     Without a declared subject there is no way to check whether some other
#     file quietly asserts the same fact as settled.
SUBJ = re.compile(r"CONTESTED\s*\[subject:\s*([^\]]+)\]")
subjects = set()
for rel, ln in contested:
    m = SUBJ.search(ln)
    if not m:
        fails.append(f"CONTESTED WITHOUT SUBJECT - {rel}: tag must read "
                     f"`CONTESTED [subject: <token>]` so other sites can be checked: {ln[:80]}")
    else:
        subjects |= {s.strip() for s in m.group(1).split(",")
                     if len(s.strip()) >= 4 and re.match(r"^[\w .-]+$", s.strip())}

# 3c. GENERALISES. A contested subject must never be asserted as SETTLED on an
#     untagged line. This is what the ASK_RESOLVER fast path did: a Faridabad
#     stock ask resolved to "LOCKED - DB 180" and never reached the gate.
SETTLED = re.compile(r"\bLOCKED\b|\bsettled\b|\bwas misleading\b|\bnow corrected\b"
                     r"|\buniversal across\b|\bdefinitiv", re.I)
for rel, body in tree(skip_history=True):
    for i, line in enumerate(body.splitlines(), 1):
        if "CONTESTED" in line or re.match(r"^\s*(name|description):", line):
            continue
        for s in subjects:
            if s in line and SETTLED.search(line):
                fails.append(f"CONTESTED SUBJECT ASSERTED AS SETTLED - {rel}:{i} "
                             f"names '{s}' with settled language but carries no CONTESTED tag: "
                             f"{line.strip()[:90]}")
for rel, ln in contested:
    warns.append(f"CONTESTED (unresolved, flagged to the reader) - {rel}: {ln[:80]}")

# -- 4. Claimed file paths must exist - links resolved against their own file -
CLAIM = re.compile(r"`([\w./-]+\.(?:json|py|md|sh|yaml|yml|txt))`")
LINK = re.compile(r"\]\(([^)#\s]+\.(?:md|py|sh|json|yaml|yml|txt|toml))[^)]*\)")
PLACEHOLDER = ("<", ">", "example", "your", "path-to", "version")
INTERNAL = ("skills/", "commands/", "scripts/", ".claude-plugin/")
ROOT_DOCS = {"README.md", "INSTALL.md", "UPDATE.md", "CHANGELOG.md",
             "KNOWLEDGE_DUMP.md", ".mcp.json", "preflight.py",
             "xl_kit.py", "verify.py", "demo.py"}
for rel, body in tree(skip_history=True):
    here = (ROOT / rel).parent
    for line in body.splitlines():
        if re.search(r"(never existed|does not exist|no longer ships)", line, re.I):
            continue
        # 4a. markdown links resolve RELATIVE TO THE CONTAINING FILE (v2 bug: root)
        for m in LINK.finditer(line):
            t = m.group(1)
            if any(p in t.lower() for p in PLACEHOLDER) or t.startswith(("http", "~")):
                continue
            if not (here / t).resolve().exists():
                fails.append(f"{rel}: broken link `{t}` -> {(here / t).resolve()}")
        # 4b. backticked internal path claims
        for m in CLAIM.finditer(line):
            cand = m.group(1)
            if not cand or any(p in cand.lower() for p in PLACEHOLDER) or cand.startswith("~"):
                continue
            if not (cand.startswith(INTERNAL) or cand in ROOT_DOCS):
                continue          # references to other repos are not our claims
            if (ROOT / cand).exists() or (here / cand).exists() or any(ROOT.rglob(cand)):
                continue
            fails.append(f"{rel}: claims `{cand}` but no such file ships")

# -- 5. Stale versions - any form, bare or v-prefixed ------------------------
for doc in [d for d in DOCS if d != "CHANGELOG.md"]:
    for line in read(doc).splitlines():
        for m in re.findall(r"\bv?(\d+\.\d+\.\d+)\b", line):
            COMPARISON = (version in line or
                          re.search(r"\balready\b|\bstill says\b|previous release|"
                                    r"old version|MARKETPLACE version|\bwas\b", line))
            if m != version and not COMPARISON and not re.search(
                    r"CLI|Metabase|MySQL|Aurora|superpowers", line):
                fails.append(f"{doc}: stale version {m} (shipping v{version}): {line.strip()[:70]}")

# -- 6. Counts must match reality - EVERY file, not just README --------------
mcp_count = len(json.loads(read(".mcp.json") or '{"mcpServers":{}}').get("mcpServers", {}))
COUNTS = [
    # tolerate intervening words: "24 knowledge skills" must not slip past
    (r"(\d+)\s+(?:\w+\s+){0,2}skills\b", len(skills), "skills"),
    (r"(\d+)\s+(?:\w+\s+){0,2}commands\b", len(commands), "commands"),
    (r"(\d+)\s+MCPs?\b", mcp_count, "MCP servers"),
]
SUBSET = re.compile(r"\b(plus|of which|another|behavioural|subset|including|among)\b", re.I)
for rel, body in tree(skip_history=True):
    for pat, actual, what in COUNTS:
        for line in body.splitlines():
            if SUBSET.search(line):
                continue        # "Plus 3 behavioural skills" counts a subset, not the total
            for claimed in re.findall(pat, line):
                # the CLI counts commands as skills; a doc may cite its number
                if what == "skills" and int(claimed) == len(skills) + len(commands):
                    continue
                if int(claimed) != actual:
                    fails.append(f"{rel}: claims {claimed} {what}, {actual} ship")
for claimed in re.findall(r"ledger - (\d+) entries|ledger — (\d+) entries", read("README.md")):
    c = [x for x in claimed if x]
    if c:
        actual = len(re.findall(r"^## L\d+", read("skills/tm-chotu-learnings/SKILL.md"), re.M))
        if int(c[0]) != actual:
            fails.append(f"README: claims ledger has {c[0]} entries, found {actual}")
# count DISTINCT codes inside the `orderstatus` decode section only — the file
# also documents workflow_status, order_type, payment and package enums, and
# counting those too produced a false alarm against a number that was correct.
_te = read("skills/tm-chotu-tables-enums/SKILL.md").split("\n")
_s = next((i for i, l in enumerate(_te) if l.startswith("## `orderstatus`")), None)
if _s is not None:
    _e = next(i for i, l in enumerate(_te) if i > _s and l.startswith("## ") and "orderstatus" not in l)
    _codes = [m.group(1) for m in (re.match(r"^\| \*{0,2}(\d+)\*{0,2} \|", l) for l in _te[_s:_e]) if m]
    if len(_codes) != len(set(_codes)):
        dup = sorted({c for c in _codes if _codes.count(c) > 1})
        fails.append(f"tables-enums: orderstatus decode lists {dup} more than once — "
                     f"a duplicated status row is where a stale reading survives")
    for claimed in re.findall(r"(\d+)\*{0,2} ORDER STATUS codes|FULL (\d+)-CODE DECODE", read("README.md")):
        c = [x for x in claimed if x]
        if c and int(c[0]) != len(set(_codes)):
            fails.append(f"README: claims {c[0]} ORDER STATUS codes, decode has {len(set(_codes))} distinct")
for claimed in re.findall(r"(\d+) ready-to-run SQL recipes", read("README.md")):
    actual = len(re.findall(r"^## Recipe \d+", read("skills/tm-chotu-joins/SKILL.md"), re.M))
    if int(claimed) != actual:
        fails.append(f"README: claims {claimed} SQL recipes, found {actual}")

# -- 7. Skill frontmatter: present AND name matches directory ----------------
for s in skills:
    head = (ROOT / "skills" / s / "SKILL.md").read_text()[:2000]
    if not head.startswith("---"):
        fails.append(f"skills/{s}: no frontmatter - will not load")
        continue
    fm = head.split("---")[1] if head.count("---") >= 2 else ""
    nm = re.search(r"^name:\s*(\S+)", fm, re.M)
    if not nm:
        fails.append(f"skills/{s}: frontmatter has no name:")
    elif nm.group(1) != s:
        fails.append(f"skills/{s}: frontmatter name '{nm.group(1)}' != directory name")
    if not re.search(r"^description:\s*\S", fm, re.M):
        fails.append(f"skills/{s}: frontmatter has no description:")

# -- 8. Referenced commands AND skills must exist ----------------------------
for rel, body in tree():
    for cmd in set(re.findall(r"(?:^|[\s`(*])/(tm-chotu-[\w-]+)(?![\w./-])", body, re.M)):
        if cmd not in commands and cmd not in skills:
            fails.append(f"{rel}: references /{cmd} but no such command ships")
    # NEW: a skill told to "load `tm-chotu-x`" that does not ship routes nowhere
    for m in re.finditer(r"(?:load|invoke|routes? to)\s+`(tm-chotu-[\w-]+)`", body, re.I):
        if m.group(1) not in skills and m.group(1) not in commands:
            fails.append(f"{rel}: routes to `{m.group(1)}` but no such skill ships")

# -- 9. CLI commands must be real subcommands --------------------------------
# NEW. `claude plugin install <path>` shipped because nothing ever checked a
# documented command line against the actual CLI verb list.
CLI_VERBS = {"details", "disable", "enable", "eval", "help", "init", "new", "install", "i",
             "list", "marketplace", "prune", "autoremove", "tag", "uninstall", "remove",
             "update", "validate"}
MKT_VERBS = {"add", "help", "list", "remove", "rm", "update"}
for rel, body in tree(skip_history=True):
    for m in re.finditer(r"claude plugin(?: marketplace)? ([a-z-]+)", body):
        verb = m.group(1)
        is_mkt = "marketplace" in m.group(0)
        pool = MKT_VERBS if is_mkt else CLI_VERBS
        if verb not in pool and verb != "marketplace":
            fails.append(f"{rel}: `{m.group(0)}` - '{verb}' is not a claude plugin subcommand")

# -- 10. CHANGELOG leads with the shipping version ---------------------------
cl = re.search(r"^## \[([\d.]+)\]", read("CHANGELOG.md"), re.M)
if not cl:
    fails.append("CHANGELOG.md: no version entries")
elif cl.group(1) != version:
    fails.append(f"CHANGELOG.md: leads with {cl.group(1)}, shipping {version}")

# -- 11. Secrets - every text extension, docs/superpowers included -----------
SECRETS = [r"arn:aws[a-z0-9:/_-]*", r"\bAKIA[0-9A-Z]{16}\b", r"\b\d{12}\b",
           r"[a-z0-9-]+\.(?:rds|compute)\.amazonaws\.com", r"-----BEGIN [A-Z ]*PRIVATE KEY",
           r"oauth2:[A-Za-z0-9_-]{8,}@"]
for rel, body in tree(skip_docs_superpowers=False):
    for pat in SECRETS:
        for hit in re.findall(pat, body):
            if set(str(hit)) == {"0"}:      # null-UUID sentinel, ledger L3
                continue
            if "TOKEN" in str(hit) or "<" in str(hit):
                continue
            if re.search(rf"grep[^\n]*{re.escape(str(hit))}", body):
                continue
            fails.append(f"{rel}: possible secret `{hit}`")

# -- report ------------------------------------------------------------------
print(f"tm-chotu preflight v3 - v{version} | {len(skills)} skills | {len(commands)} commands | {mcp_count} MCP\n")
for w in warns:
    print(f"  WARN  {w}")
if warns:
    print()
for f_ in fails:
    print(f"  FAIL  {f_}")
print()
if fails:
    print(f"FAIL: {len(fails)} failure(s) - DO NOT SHIP")
    sys.exit(1)
print(f"PASS - no known regression, no detected drift, {len(contested)} contested item(s) flagged above.")
print("  This does NOT mean the content is true. Novel contradictions are outside what this gate can see.")
