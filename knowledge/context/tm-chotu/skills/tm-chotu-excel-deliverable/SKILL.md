---
name: tm-chotu-excel-deliverable
description: Truemeds house standard for every .xlsx that leaves your machine — live formulas instead of dead numbers, native types instead of text, a README sheet, an explicit editable-vs-computed split for forecasts, cross-sheet named links, and a pass/fail verification gate. Use whenever writing, editing, or reviewing an Excel/xlsx/xlsm deliverable, exporting query results to a spreadsheet, or building any forecast, model, tracker, or validation dump in Excel. Extends and overrides the generic xlsx skill. This is the canonical copy — bundled with tm-chotu so every Truemeds employee builds to the same standard and runs the same verifier.
---

# Excel deliverable standard

Anything with a `.xlsx` extension that a human other than the script author will open.
Scratch files a script writes and re-reads are exempt — say so out loud if you take that exemption.

Use `xl_kit.py` in this skill directory. Do not hand-roll what it already does.

**Locate the kit first** — the plugin install path contains a version number, so never hardcode it:

```bash
# prefer the INSTALLED copy (highest version); fall back to any checkout
XLKIT=$(find ~/.claude/plugins/cache -type d -name tm-chotu-excel-deliverable 2>/dev/null | sort -V | tail -1)
[ -n "$XLKIT" ] || XLKIT=$(find ~/.claude/plugins -type d -name tm-chotu-excel-deliverable 2>/dev/null | head -1)
echo "$XLKIT"
```

Then import from that path:

```python
import os, sys
sys.path.insert(0, os.environ.get("XLKIT") or "<the path printed above>")
from xl_kit import *
```

**Dependency:** `openpyxl` (and LibreOffice for the recalc half of the gate). If `openpyxl` is missing, install it in the main session before building — never inside a subagent.

## Tier 0 — Hard gates

1. **No dead totals.** Every total, subtotal, %, ratio, delta, or derived cell is a live Excel formula (`=SUM(B2:B41)`, `=C2/B2`, `=B2-B3`). Never compute it in Python and write the answer. Row totals *and* column totals. `write_table(..., total_row=True)` does the column totals for you.
2. **No embedded constants.** Growth rates, FX, margins, thresholds, tax rates, cutoffs live in cells on `Inputs` and are referenced by name. Zero magic numbers inside formula strings. (ICAEW #14)
3. **Native types only.** `int` / `float` / `datetime` / `None`. Never `"1,234"`, never `"12%"`, never `""`, never `"-"`, never `"N/A"` in a numeric or date column. `coerce()` handles the strip-and-cast; `write_table()` calls it for you. Leading-zero digit strings (`"007"`) stay text — they are identifiers.
4. **Rounding is display-only.** Decimals come from `number_format`. Never `round()` the stored value unless the rounded number *is* the fact being reported. Precision loss is irreversible.
5. **Zero formula errors** at handoff: `#REF! #DIV/0! #VALUE! #N/A #NAME? #NUM!`. Proven by the gate, not by eyeball.

## Tier 1 — Structure

6. **README is sheet 1, always.** `readme_sheet()`. Purpose · data source (DB, table, query date) · one line per sheet with a clickable link · colour legend · column dictionary for anything non-obvious · what you may change · caveats · version.
7. **Inputs / Workings / Outputs physically separated** into different sheets. `Inputs` holds everything a human may change; nothing else is editable. (ICAEW #10)
8. **Cross-sheet references, never copies.** A value used on three sheets exists once and is linked. Use `name(wb, "growth", ws_in, "B9")` then write `=prev*(1+growth)` — formulas read as English and the reader can trace them. Never retype a constant onto a second sheet.

## Tier 2 — Legibility

9. **Colour is meaning, not decoration.** Blue+yellow = editable input · black = formula on this sheet · green = cross-sheet link · **purple** = external link · grey italic = forecast. Legend printed on README. `input_cell()` / `link_cell()` / `forecast_style()` apply it. Red is **not** in this list — it belongs to negatives alone (10a).
10. **Number formats always set** — from `FMT`: `int` `num` `num2` `money` `money_mn` `pct` `pct2` `mult` `date` `datetime` `id`. Zeros as `-` on money and percentages (counts keep `0`, because a zero count is a finding), units named in the header (`gmv_₹mn`), one decimal unless the reader needs two. Years are text, not `2,026`.
10a. **Negatives are always red, everywhere, no exceptions.** Red is reserved for this and nothing else. Every numeric format carries an explicit `[Red]` negative section — `'#,##0;[Red](#,##0)'` — because `[Red]` in the format string **overrides the cell font**, so a negative stays red inside a green cross-sheet link, a grey forecast cell, or a bold total. A font colour alone does not survive those; the format section does. Negatives also render in parentheses, not with a leading minus. Any custom format you write by hand must include `[Red]` — the verifier fails the build on both hardcoded negatives and formula cells that *compute* negative under a format without it.
11. **Every table**: bold header row, freeze panes below the header, autofilter, fitted column widths, no merged cells anywhere in a data region.
12. **Do not pre-trim.** Validation and diff dumps carry *all* available fields, raw value beside normalized (`gmv_raw` next to `gmv`), with the mismatched field highlighted rather than the rest deleted.

## Tier 3 — Forecasts, models, predictions

13. **Declare the editable surface.** Assumptions live in `Inputs`, blue on yellow, unlocked, with `DataValidation` bounds or a dropdown and a prompt. Everything else is locked and the sheet is protected — no password, a speed bump against accidental typing. (ICAEW #20)
14. **Scenario switch, not copied sheets.** One `scenario` named cell driving `INDEX`/`MATCH` or `CHOOSE`. The reader flexes one cell, not five tabs.
15. **ACTUAL vs FORECAST is a column,** not just a colour — so it survives a pivot. Grey italic on top of it, never instead of it.
16. **Checks sheet with tie-outs.** `checks_sheet()` — totals reconcile to their rows, assumptions inside bounds, source row count matches. Red on BREAK, green on OK. (ICAEW #19)

## Tier 4 — The gate

17. **Run the verifier and paste its output into chat** before handing the file over:
    ```bash
    python3 "$XLKIT/verify.py" <file.xlsx>          # $XLKIT from the find above
    ```
    Static: numbers-as-text, dates-as-text, dead totals in rows/columns labelled TOTAL, error literals, negatives without `[Red]`, `General`-format numerics, unformatted dates, dead named ranges, merged cells, missing README, zero-formula sheets. Recalc via headless LibreOffice: proves every formula evaluates clean **and catches formula cells that compute negative under a non-red format** — the case static analysis cannot see. Exit 1 = do not ship. If LibreOffice is missing the recalc silently downgrades to static-only — say so rather than implying a full pass.
18. `wb.calculation.fullCalcOnLoad = True` — `save()` sets it. openpyxl writes formulas with **no cached value**: anything reading the file with pandas or `data_only=True` before a human opens it in Excel sees `None`. The README says this; repeat it in chat if the recipient is a script.
19. **A FAIL is not a suggestion.** Fix and re-run; never narrate around it.

## Tier 5 — Handoff

20. Filename per the outbound convention: `<Doc>-<Entities>-<DD Month YYYY> at <HHMM> hrs <Status>.xlsx`. In chat, state: sheets and row counts, which cells are editable, what to sanity-check first, and the verifier verdict. Show the numbers inline for validation *before* building the workbook — the workbook is the packaging step, not the discovery step.

## Overrides

- **An existing template beats every rule above.** Editing someone's workbook means matching its conventions exactly — do not impose this house style on a file that already has one.
- The user's explicit instruction beats the rule. Note the deviation, don't silently comply.

## Recipes

```python
wb = new_book()

ws_in = sheet(wb, "Inputs", tab_color="FFC000")
input_cell(ws_in, "B3", "Base", label="Scenario", choices=["Base","Bull","Bear"])
input_cell(ws_in, "B4", 0.08, fmt=FMT["pct"], label="Growth", bounds=(-1, 1), note="MoM")
name(wb, "growth", ws_in, "B4")
protect(ws_in)

ws = sheet(wb, "Actuals")
lay = write_table(ws, ["month","orders","gmv"], rows,
                  formats={"month": FMT["date"], "orders": FMT["int"], "gmv": FMT["money"]},
                  total_row=True, band=True)
# lay -> {'header_row','first_data_row','last_data_row','total_row','cols'}
name(wb, "gmv_last", ws, f"C{lay['last_data_row']}")

ws_f = sheet(wb, "Forecast")
link_cell(ws_f, "C2", "=gmv_last*(1+growth)", fmt=FMT["money"])
forecast_style(ws_f, "C2:D7")

checks_sheet(wb, [("Forecast ties to rows", "ABS('Forecast'!C8-SUM('Forecast'!C2:C7))<0.01")])
readme_sheet(wb, title=..., purpose=..., source=..., pulled_at=..., sheets=[...],
             columns=[...], editable=[...], caveats=[...], version="v1")
save(wb, path)
```

`coerce(v)` — one raw value to a native type. `infer_fmt(values)` — pick a format from a column.
`autofit(ws)` · `protect(ws)` · `checks_sheet(wb, rows)` · `link_cell(..., external=True)` for **purple** (external link). Red is reserved for negatives — see rule 10a.

Reference implementation end to end: `demo.py` in this skill directory. Run it, open the output, copy the shape.
