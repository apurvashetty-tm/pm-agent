# PG Payment Gateway Decision — Project Instructions

## What this project is

A PM analysis project to evaluate and select Truemeds' next payment gateway based on commercial (MDR cost) comparison of Cashfree (current), PayU, EaseBuzz, and Razorpay, with Juspay as an optional orchestration layer.

This is a **documents/analysis project** — no code lives here. Source files are Excel workbooks and PDFs.

## Priority order

1. Latest user instruction
2. `docs/context/project_truth.md` — locked facts, do not change without explicit user instruction
3. `docs/context/session_handoff.md` — current resume state
4. `docs/context/open_questions.md` — unresolved decisions
5. `knowledge/context/pg-commercial-comparison.md` — canonical rate card and methodology reference

## Key source files (not in this repo)

| File | Path | Notes |
|---|---|---|
| `PG_Commercial_Comparison_July2026.xlsx` | `~/Documents/Claude/Payment_POD_PG_Architecture_Decision/02_Vendor_Decks/Commercials/` | Primary model — do not open in Excel while running Python scripts |
| `PG_Commercial_Comparison_April2026.xlsx` | Same folder | Historical baseline + captured vendor quotes tab |
| `APRIL 2026.xlsx` | `.../Commercials/Cashfree data/` | Raw Cashfree export — ground truth for GMV and actual fees |

## Before starting any session

1. Read `docs/context/session_handoff.md`
2. Read `docs/context/open_questions.md`
3. Read `knowledge/context/pg-commercial-comparison.md` for any rate/cost fact-checking
4. Do NOT modify the Excel files with Excel open — always close Excel first

## After any session

Update `docs/context/session_handoff.md` with: what was done, files changed, validation done, next step.
