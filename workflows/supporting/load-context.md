# Context Loader — PM Agent Skill

## Purpose
Fetch and organize Truemeds organizational context from Google Drive. Use explicit **canonical logistics systems list** (from Cross-Cutting) to intelligently filter documents based on the **"Logistics systems touched"** column. Load only relevant context for the current PRD/task.

---

## Entry Point
Called by **recall-and-route.md** whenever a PM task requires Truemeds-specific context.

---

## Step 1: Check for Cached Context

**Check for same-day cache:**
```
~/.context-cache.md
```

**Cache logic:**
- If cache exists AND contains today's date marker (`Cache date: YYYY-MM-DD`) → Use cache directly
- If cache is stale OR missing → Fetch fresh context (Step 2)
- Cache validity: Same calendar day only

**Why:** Avoids redundant Google Drive fetches during a single session

---

## Step 2: Fetch Master Index

**Source:**
```
https://docs.google.com/document/d/1hBjvDB6NS-fYrA4EZUhjpMbvXkveBSRxcI06PlV9Ork/edit
```

**Action:**
- Use `google_drive_fetch` to read the master index
- Extract the table with Drive Links for all verticals:
  - Cross-Cutting
  - Hyperlocal Forward
  - Hyperlocal Reverse
  - Courier Forward
  - Courier Reverse
  - B2B Forward
  - B2B Reverse

---

## Step 3: Fetch Cross-Cutting Index

**Fetch:** Cross-Cutting vertical index (from master index)

**Parse columns:**
- Doc Name
- Type
- Drive Link
- Description

**Extract immediately:**
1. **Logistics System Reference doc** — Contains the canonical list of all logistics systems used at Truemeds
2. **Logistics System Overview doc** — Foundational context that always loads

**Action:**
- Fetch the "Logistics System Reference" doc from Cross-Cutting
- Extract the canonical system list (e.g., Promise Engine, ETA Modeling, Dispatch System, Warehouse Operations, Courier Integration, RTO, DMS, OTD, Checkout, Delivery Legs, etc.)

---

## Step 4: Understand Which Systems the PRD/Task Touches

**Instruction to Claude:**

> "Read the PRD/task description provided by the user. Based on the PRD title, features, and scope, identify which logistics systems from this canonical list will be involved or affected:
>
> **Canonical systems:** [List from Step 3]
>
> Output the systems as a comma-separated list (e.g., 'Promise Engine, ETA Modeling, Dispatch System')"

**Claude reads:**
- PRD title
- Feature descriptions
- Acceptance criteria
- Any business logic sections

**Output:** Matched systems from canonical list (e.g., `[Promise Engine, Checkout, ETA Modeling]`)

---

## Step 5: Determine Relevant Vertical(s)

**Instruction to Claude:**

> "Based on the matched systems and the PRD scope, which Truemeds vertical(s) does this PRD belong to?
>
> Verticals: Hyperlocal Forward, Hyperlocal Reverse, Courier Forward, Courier Reverse, B2B Forward, B2B Reverse, Cross-Cutting
>
> Output: The vertical name(s)"

**Example:**
- If PRD is about "Promise calibration for same-day delivery" → Hyperlocal Forward
- If PRD is about "Return-to-origin RTO" → Hyperlocal Reverse, Courier Reverse
- If PRD is about "General metrics framework" → Cross-Cutting

**Output:** Vertical name(s)

---

## Step 6: Fetch Vertical-Specific Index(es)

**Fetch:** Index for each identified vertical (from master index)

**Parse columns:**
- Doc Name
- Type
- Drive Link
- Description
- **Logistics systems touched** ← Filter using this

---

## Step 7: Filter Documents by Matched Systems

**Filtering Logic:**

**For Cross-Cutting vertical:**
- Always load all Cross-Cutting docs (no filtering)
- Rationale: Cross-Cutting contains foundational context (team structure, metrics definitions, SOPs) needed for all tasks

**For identified vertical(s):**

1. **Exact match tier (Priority 1):**
   - Load docs where "Logistics systems touched" contains ANY of the matched systems
   - Example: If matched systems are `[Promise Engine, ETA Modeling]`, load all docs tagged with either of these

2. **Fallback tier (Priority 2):**
   - If no exact matches found, load the vertical's general overview doc (if exists)
   - Rationale: Avoid loading zero docs

3. **Exclude:**
   - Do not load docs whose "Logistics systems touched" has zero overlap with matched systems

**Example:**

PRD: "Promise Buffer Enhancement for Hyperlocal Forward"
```
Matched systems: [Promise Engine, Checkout, ETA Modeling]
Identified vertical: Hyperlocal Forward

Hyperlocal Forward index:
- Doc A: "Promise Calibration Rules"
  Logistics systems touched: Promise Engine, Checkout
  ✅ LOAD (exact match: Promise Engine, Checkout)

- Doc B: "ETA Leg-Level Deep Dive"
  Logistics systems touched: ETA Modeling, Dispatch
  ✅ LOAD (exact match: ETA Modeling)

- Doc C: "Courier Partner Performance Tracking"
  Logistics systems touched: Courier Integration, RTO
  ❌ SKIP (zero overlap with matched systems)

- Doc D: "Hyperlocal Forward Operations Overview"
  Logistics systems touched: [all systems]
  ✅ LOAD (general overview, helpful context)
```

---

## Step 8: Build Context Manifest

**Create `.context-cache.md` with structure:**

```markdown
# Context Cache — Truemeds Org Context

**Cache date:** YYYY-MM-DD
**Identified vertical(s):** [Vertical name(s)]
**Matched logistics systems:** [System list from Step 4]

---

## Cross-Cutting (Always Loaded)
- [Doc names with links]

## [Vertical Name] (Filtered for matched systems)
- [Doc names with links]
- Each doc tagged with: [which systems it touches]

---

## Summary
- Total docs loaded: X
- Cross-Cutting: Y
- Vertical-specific (filtered): Z
- Systems covered: [List]
```

---

## Step 9: Present Context to User

**Output format:**

> "✅ **Context loaded for your task:**
>
> **Vertical:** [Identified vertical(s)]
> **Logistics systems:** [Matched systems]
>
> **Documents loaded (X total):**
> - **Cross-Cutting (Y docs):** [doc links]
> - **[Vertical] (Z docs, filtered):** [doc links]
>
> Cached until end of day. Ready for PRD creation, test case design, experiment design, etc."

---

## Step 10: Context Available to Downstream Tasks

**Downstream skills can now:**
- Reference loaded docs when writing PRD features
- Use logistics systems list when designing test cases
- Check context for existing commitments (objection mapping)
- Validate metrics against context docs (experiment design)

---

## Error Handling

**If canonical system list not found in Cross-Cutting:**
- Fall back to a hardcoded list (maintain as a reference in this skill file)
- Notify user: "⚠️ Using fallback system list (canonical list not found in Cross-Cutting)"

**If vertical-specific index fetch fails:**
- Load only Cross-Cutting docs
- Notify: "⚠️ Could not load vertical-specific docs. Using Cross-Cutting context only."

**If no documents match identified systems:**
- Load the vertical's general overview doc
- Notify: "ℹ️ No docs matched your systems exactly. Loaded general overview instead."

---

## Success Criteria

✅ Cross-Cutting always loaded (no filtering)  
✅ Vertical(s) correctly identified from PRD scope  
✅ Systems matched against canonical list  
✅ Vertical docs filtered by "Logistics systems touched" column  
✅ Only relevant documents loaded  
✅ Context cache created with today's date  
✅ User sees clear summary: which vertical, which systems, how many docs  
✅ Downstream tasks can reference this context  

---

## Notes for Implementation

- **Canonical system list:** Maintain in Cross-Cutting index. Update once, applies to all context loading.
- **Explicit matching:** This skill does not infer; it matches against a defined list. Reduces hallucination risk.
- **Vertical scope rule:** Always fetch only the identified vertical(s) + Cross-Cutting. Avoid loading unrelated verticals.
- **Cross-Cutting exception:** Never filter Cross-Cutting docs. Always load all of them.
- **Reusable cache:** Once context is loaded, it can be used by create-prd.md, design-test-cases.md, experiment-designer.md, etc. in the same session.

