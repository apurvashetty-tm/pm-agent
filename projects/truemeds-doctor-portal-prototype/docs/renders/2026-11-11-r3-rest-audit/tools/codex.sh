#!/bin/bash
# Codex calls for run r3-rest-audit (read-only, prompt through stdin, pictures with -i). Run from the project folder:
#   bash docs/renders/2026-11-11-r3-rest-audit/tools/codex.sh review   → codex-review.md (independent review)
#   bash docs/renders/2026-11-11-r3-rest-audit/tools/codex.sh critique → codex-on-claude.md (Codex on claude-review.md)
#   bash docs/renders/2026-11-11-r3-rest-audit/tools/codex.sh final    → codex-final.md (what is still disputed)
D=docs/renders/2026-11-11-r3-rest-audit
G=$D/visible-gaps
IMGS=(-i $G/d-default_w390.png -i $G/d-every-x-hours_w360.png -i $G/d-sos-on_w390.png -i $G/d-error-dose_w360.png
      -i $G/c-callback-failed_w360.png -i $G/home_profile_w390.png -i $G/s7b-still-on-call_w360.png -i $G/g2-checking-ha_w390.png
      -i $G/a-order-details_w390.png -i $G/a-rx-viewer_w390.png -i $G/d-disabled_w390.png -i $D/duration/duration-proposal_w360.png)
case "$1" in
  review)   P=$D/codex-prompt.txt;    O=$D/codex-review.md;    L=$D/codex-review.log ;;
  critique) P=$D/codex-prompt-r2.txt; O=$D/codex-on-claude.md; L=$D/codex-on-claude.log ;;
  final)    P=$D/codex-prompt-r3.txt; O=$D/codex-final.md;     L=$D/codex-final.log ;;
  *) echo "usage: codex.sh review|critique|final"; exit 2 ;;
esac
codex exec -s read-only -C ../.. "${IMGS[@]}" -o "$O" - < "$P" > "$L" 2>&1
echo "codex exit $?"
