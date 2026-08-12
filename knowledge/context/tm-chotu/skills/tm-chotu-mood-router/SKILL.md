---
name: tm-chotu-mood-router
description: Reads user prompt signal, picks mood (pinpoint / brainstorm / research / impact / clarify). Overrides default mood for current turn.
---

# Mood router

| Mood | Triggers | Behavior |
|---|---|---|
| **pinpoint** | "show me", "what's the number", "how many", direct metric ask | one number, one source, one sentence framing |
| **brainstorm** | "let's think", "options for", "ideas", "what could", "we're considering" | drop caveman to lite, divergent, 3+ options + tradeoff |
| **research** | "pull", "investigate", "deep dive", "joint analysis", "by cohort", "trend" | full SQL pipeline, cite source tables, query-rigor enforced |
| **impact** | "business case", "ROI", "what's the upside", "should we", "is it worth" | money/customers framing, no SQL by default, percentages + ₹ |
| **clarify** | "what does X mean", "explain", "definition", "diff between" | load definitions skill, lock canonical term + source |

## Algorithm

1. Tokenize user prompt
2. Match triggers in priority order: pinpoint > research > impact > brainstorm > clarify
3. If no trigger → use default mood from `.state.json`
4. Announce in caveman: `Mood: <picked>.` (one line)
5. Hand off to relevant section skill(s)

## Stickiness

Mood persists current turn only. Default mood resumes next turn unless user said "stay in <mood>".
