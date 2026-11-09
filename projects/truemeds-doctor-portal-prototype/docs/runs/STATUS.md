# Run status (D-100)

Each run appends one line at the end: `DONE <name>` or `STOPPED <name>: <reason>`. The runner adds `STOPPED by runner: …` if a run ends without a DONE line or without pushing.

DONE rails — linter + commit gate live (111 findings today); edit hook needs Apurva to install .claude/settings.json; run-chain.next.sh has a DONE-count fix (see docs/renders/2026-11-09-rails/REPORT.md)

DONE token-pass — 111 raw values -> 0 (25 raw-ok), pictures 298/298 identical, all checks pass, fresh-AI Codex strict PASS; 45 Codex tests disputed (see docs/renders/2026-11-09-token-pass/REPORT.md)
