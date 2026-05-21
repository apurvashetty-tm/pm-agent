# Design Test Cases — PM Agent Workflow

## Entry Point
User provides a Google Drive link to a PRD document.

---

## Step 1: Fetch PRD from Google Drive

**Instruction to Claude:**
> "I'm providing you a Google Drive link to a PRD. Fetch the full content and read it carefully."

**User Input:**
- Google Drive PRD link (e.g., `https://docs.google.com/document/d/DOCUMENT_ID/edit`)

**Action:**
- Use `google_drive_fetch` tool (or web_fetch if shared link) to read the PRD
- Extract and summarize:
  - Feature name
  - User stories / use cases
  - Acceptance criteria
  - Success metrics (if present)
  - Any business rules or edge cases mentioned

**Output:**
- PRD content summary in your context

---

## Step 2: Analyze PRD for Test Scenarios

**Instruction to Claude:**
> "Analyze this PRD and identify all the functional test scenarios we need to cover. Think like a QA engineer — what would break this feature? What are the happy path flows, alternate flows, and edge cases?"

**Analysis Areas:**
- **Happy path:** Normal user flow, expected behavior
- **Alternate flows:** Different user inputs, different conditions
- **Edge cases:** Boundary conditions, limit testing, data validation
- **Error scenarios:** Invalid inputs, system failures, permission issues
- **Business logic:** Any specific Truemeds rules (e.g., OTD%, promise calibration, dispatch logic)

**Do NOT include:**
- Performance testing
- Load testing
- Security testing
- Accessibility testing
- (Only functional test cases)

---

## Step 3: Generate Functional Test Cases

**Instruction to Claude:**
> "Generate comprehensive functional test cases for this PRD in a structured markdown format. Each test case should include: ID, title, preconditions, steps, expected result, and any notes."

**Format Each Test Case As:**

```
### TC-[FEATURE-#] — [Clear test case title]

**Preconditions:**
- [Setup needed before test]

**Steps:**
1. [User action]
2. [System response/user action]
3. [Expected verification point]

**Expected Result:**
- [What should happen]
- [Any data validation]
- [UI/system state changes]

**Notes:**
- [Any special considerations for Truemeds]
```

**Coverage Goals:**
- Main feature flow (5-8 test cases minimum)
- Alternate flows (3-5 test cases)
- Edge cases (4-8 test cases)
- Error handling (3-5 test cases)
- Business logic validation (2-4 test cases)

**Total:** Aim for 15-30 test cases depending on feature complexity

---

## Step 4: Organize & Save Test Cases

**File Path:**
```
archives/test-cases/[DATE]-[feature-name]-v#.md
```

**Example:**
```
archives/test-cases/2026-05-17-promise-buffer-v1.md
```

**File Structure:**
```markdown
# Test Cases — [Feature Name]

**PRD:** [Link to original PRD]
**Feature:** [Feature name and brief description]
**Test Case Count:** [X functional test cases]
**Generated:** [Date]

---

## Test Cases

### TC-[FEATURE-001] — [Title]
[Complete test case as above]

### TC-[FEATURE-002] — [Title]
[Complete test case as above]

...
```

---

## Step 5: Versioning & Storage

**Auto-Versioning:**
- Use `scripts/get-next-version.sh` to get next version number
- If this is the 1st iteration: `2026-05-17-promise-buffer-v1.md`
- If this is the 2nd iteration: `2026-05-17-promise-buffer-v2.md`

**Command:**
```bash
v=$(node scripts/get-next-version.sh promise-buffer archives/test-cases)
```

---

## Step 6: Commit & Push (Final Step)

**Use the shared FINAL-STEP-TEMPLATE.md:**

After saving the test cases file:

```bash
cd ~/pm-agent
git add archives/test-cases/
git commit -m "Design test cases: [feature name] (v#) — [X] functional test scenarios"
git push origin main
```

**Commit Message Format:**
```
Design test cases: [feature name] (v#) — [X] functional test scenarios

[Optional: Brief summary of test coverage]
```

**Output:**
- ✅ Test cases saved to GitHub
- ✅ Versioned and tracked
- ✅ Ready for QA team review

---

## Iteration (v2, v3, etc.)

If you need to refine test cases:

1. Ask Claude to review and improve based on feedback
2. Update the same file or create v2
3. Re-analyze the PRD for missing scenarios
4. Commit with new version number

---

## Success Criteria

✅ Test cases cover happy path, alternate flows, edge cases, and errors  
✅ Each test case is clear, actionable, and has expected results  
✅ Test cases reference the specific PRD feature  
✅ File is versioned in archives/test-cases/  
✅ Committed to GitHub  

---

## Notes for PM

- **Scope:** Functional testing only (no performance, security, accessibility)
- **Audience:** QA team — they should be able to implement these directly
- **Truemeds Context:** Reference business logic (OTD%, promise calibration, courier partners, delivery legs, etc.) where relevant
- **Reusability:** Save test cases in the repo for future reference and iteration

