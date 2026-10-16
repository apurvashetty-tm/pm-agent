# CEO Discussions

Prep workspace for meetings with the CEO. One dated subfolder per discussion.
Read `CLAUDE.md` for how these are prepared (the core rule: no unverified number
goes in front of the CEO).

## Discussions index

| Date | Topic | Folder | Status | Decision asked | Outcome |
|---|---|---|---|---|---|
| 2026-08-19 | POD impact + OMS/Cart migration scope | [2026-08-19-pod-impact-and-oms-decision](2026-08-19-pod-impact-and-oms-decision/) | Prep in progress | Migrate-only vs enhance-and-migrate | Pending |

## Files at this level
- `CLAUDE.md` — prep rules and folder model.
- `decisions-log.md` — running ledger of CEO decisions/commitments across all meetings.
- `_template/` — skeleton copied for each new discussion.

## Starting a new discussion
```bash
cp -R _template "$(date +%F)-<short-topic>"
```
Then fill `brain-dump.md` with raw inputs and derive the rest.
