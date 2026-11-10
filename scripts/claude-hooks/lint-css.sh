#!/usr/bin/env bash
# After-edit token lint (D-100). Claude Code PostToolUse hook on Edit|Write|MultiEdit.
# Lints only the edited file, and only if it is component/app CSS (scope lives in check_tokens.py --scoped).
# Findings -> stderr + exit 2, so the editing session sees them and fixes them now. Anything else -> exit 0.
# Install: copy scripts/claude-hooks/settings.json to .claude/settings.json (or merge its "hooks" block) in
# the folder you start Claude from — the working-folder root and/or projects/<p>/. Both are git-ignored.
file=$(python3 -c 'import json,sys
try: print((json.load(sys.stdin).get("tool_input") or {}).get("file_path",""))
except Exception: pass' 2>/dev/null)
case "$file" in *.css) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0
# Find the repo that owns the edited file (several working folders share one machine). Use git's top level,
# not an upward search: app/design-system/ holds a build copy of the design system that must not be used.
dir=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || exit 0
[ -f "$dir/design-system/scripts/check_tokens.py" ] || exit 0
out=$(python3 "$dir/design-system/scripts/check_tokens.py" --scoped "$file" 2>&1); rc=$?
[ $rc -eq 1 ] || exit 0   # 0 clean, 3 linter not installed: never block an edit for tooling
{ echo "Token lint (D-100): raw values in the file you just edited. Replace each with a --tm-* token, or add /* raw-ok: <reason> */ on the same line:"; echo "$out"; } >&2
exit 2
