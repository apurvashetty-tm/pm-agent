#!/bin/bash
# D-99 token pass §3: one fresh-AI check of the hand-off kit, Codex only, same prompt as rounds 1–4.
# Copies only handoff/ to a folder outside any repo and runs Codex there read-only. Run from the project folder.
set -u
PROJ="$(pwd)"
OUTDIR="$PROJ/docs/renders/2026-11-09-handoff-kit/fresh-ai/round-5"
SCRATCH="/private/tmp/claude-501/tm-fresh-round5/codex"
rm -rf "$SCRATCH"; mkdir -p "$SCRATCH" "$OUTDIR"
cp -R "$PROJ/handoff/." "$SCRATCH/"
PROMPT="$(cat "$PROJ/docs/renders/2026-11-09-handoff-kit/fresh-ai/prompt.txt")"
codex exec --skip-git-repo-check --sandbox read-only -C "$SCRATCH" --output-last-message "$OUTDIR/codex-final.md" "$PROMPT" < /dev/null > "$OUTDIR/codex-transcript.txt" 2>&1
echo "codex exit $?"
