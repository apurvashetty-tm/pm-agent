"""xl_kit — house standard for Excel deliverables. openpyxl only, no other deps.

Import it, don't reimplement it:
    import sys; sys.path.insert(0, "<this skill directory>")   # locate with:
    #   find ~/.claude/plugins -type d -name tm-chotu-excel-deliverable
    from xl_kit import *
"""

from __future__ import annotations

import datetime as _dt
import re
from typing import Any, Iterable, Sequence

from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, NamedStyle, PatternFill, Protection, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.worksheet import Worksheet

# ---------------------------------------------------------------- number formats

# NEGATIVES ARE ALWAYS RED. The negative section carries an explicit [Red] colour code, which
# in Excel OVERRIDES the cell font — so a negative stays red even inside a green cross-sheet
# link or a grey forecast cell, which is exactly where it was previously being lost.
# `int`/`num`/`num2`/`mult` previously had NO negative section at all, so negative counts
# rendered as a plain minus in whatever colour the cell happened to be.
# Zero: money/pct keep the "-" placeholder; COUNTS deliberately do not, because a zero count
# is usually a finding and must stay visually distinct from "no data".
FMT = {
    "int": '#,##0;[Red](#,##0)',
    "num": '#,##0.0;[Red](#,##0.0)',
    "num2": '#,##0.00;[Red](#,##0.00)',
    "money": '₹#,##0;[Red](₹#,##0);"-"',
    "money2": '₹#,##0.00;[Red](₹#,##0.00);"-"',
    "money_mn": '₹#,##0.0,,;[Red](₹#,##0.0,,);"-"',  # value in units, displayed in millions
    "money_cr": '₹#,##0.00,,,;[Red](₹#,##0.00,,,);"-"',  # displayed in crore (10^7)
    "pct": '0.0%;[Red](0.0%);"-"',
    "pct2": '0.00%;[Red](0.00%);"-"',
    "mult": '0.0"x";[Red](0.0"x")',
    "date": "dd-mmm-yyyy",
    "datetime": "yyyy-mm-dd hh:mm",
    "time": "hh:mm:ss",
    "text": "@",
    "id": "@",
}

# ---------------------------------------------------------------- palette / styles

C_INPUT = "0000FF"      # blue   — hardcoded, human-editable
C_FORMULA = "000000"    # black  — formula, same sheet
C_LINK = "008000"       # green  — cross-sheet link
C_EXTERNAL = "7030A0"   # purple — external workbook / API link (red is reserved for negatives)
C_FORECAST = "666666"   # grey   — projected, not actual

F_HEADER = "1F3864"
F_ASSUMPTION = "FFF2CC"
F_BREAK = "FFC7CE"
F_OK = "C6EFCE"
F_BAND = "F2F2F2"

_THIN = Side(style="thin", color="BFBFBF")
BORDER_BOX = Border(left=_THIN, right=_THIN, top=_THIN, bottom=_THIN)
BORDER_TOP = Border(top=Side(style="thin", color="000000"))

HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
HEADER_FILL = PatternFill("solid", fgColor=F_HEADER)
HEADER_ALIGN = Alignment(horizontal="center", vertical="center", wrap_text=True)

INPUT_FONT = Font(color=C_INPUT, bold=True)
INPUT_FILL = PatternFill("solid", fgColor=F_ASSUMPTION)
LINK_FONT = Font(color=C_LINK)
EXTERNAL_FONT = Font(color=C_EXTERNAL)
FORECAST_FONT = Font(color=C_FORECAST, italic=True)
TOTAL_FONT = Font(bold=True)

LEGEND = [
    ("Red number, in brackets", "NEGATIVE value. Always red, every sheet, every format, "
                                "including inside green links and grey forecast cells."),
    ("Blue text, yellow fill", "INPUT — you may change this. Everything else recalculates."),
    ("Black text", "Formula calculated on this sheet."),
    ("Green text", "Link to another sheet in this workbook."),
    ("Purple text", "Link to an external file or system."),
    ("Grey italic", "FORECAST / modelled value — not an observed actual."),
    ("Red fill in Checks", "A tie-out check has BROKEN. Do not use these numbers."),
]

#: Number formats that a negative value may legally carry. Any format not in FMT must still
#: contain a `[Red]` negative section — verify.py fails the build otherwise.
RED_NEG = "[Red]"

# ---------------------------------------------------------------- type coercion

_NUM_RE = re.compile(r"^[\s]*\(?[-+]?[₹$€£]?\s*[\d,]*\.?\d+\s*%?\)?[\s]*$")
_NULLISH = {"", "-", "--", "n/a", "na", "null", "none", "nan", "nat", "#n/a"}
_DATE_PATTERNS = (
    "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d",
    "%d-%m-%Y %H:%M:%S", "%d-%m-%Y", "%d/%m/%Y", "%d-%b-%Y", "%Y/%m/%d",
)


def coerce(v: Any, *, keep_text: bool = False) -> Any:
    """Raw value -> native Excel type. Strings that are really numbers/dates become
    numbers/dates. Nullish becomes None (never "" and never "-"). Leading-zero digit
    strings stay text (they are identifiers, not quantities)."""
    if v is None or keep_text:
        return None if v is None else (str(v) if v != "" else None)
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float, _dt.datetime, _dt.date, _dt.time)):
        if isinstance(v, float) and v != v:  # NaN
            return None
        return v
    s = str(v).strip()
    if s.lower() in _NULLISH:
        return None
    if s.isdigit() and len(s) > 1 and s[0] == "0":
        return s
    if _NUM_RE.match(s):
        neg = s.startswith("(") and s.endswith(")")
        pct = s.rstrip(")").endswith("%")
        t = re.sub(r"[()\s,₹$€£%]", "", s)
        try:
            n = float(t)
        except ValueError:
            return s
        if neg:
            n = -n
        if pct:
            n = n / 100.0
        return int(n) if (not pct and n == int(n) and abs(n) < 2**53) else n
    for p in _DATE_PATTERNS:
        try:
            d = _dt.datetime.strptime(s, p)
            return d.date() if p in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d-%b-%Y", "%Y/%m/%d") else d
        except ValueError:
            pass
    return s


def infer_fmt(values: Iterable[Any]) -> str | None:
    seen = set()
    for v in values:
        if v is None:
            continue
        if isinstance(v, _dt.datetime):
            seen.add("datetime")
        elif isinstance(v, _dt.date):
            seen.add("date")
        elif isinstance(v, bool):
            seen.add("text")
        elif isinstance(v, int):
            seen.add("int")
        elif isinstance(v, float):
            seen.add("num2")
        else:
            seen.add("text")
        if len(seen) > 1:
            break
    if len(seen) != 1:
        return None
    k = seen.pop()
    return None if k == "text" else FMT[k]


# ---------------------------------------------------------------- workbook

def new_book() -> Workbook:
    wb = Workbook()
    wb.remove(wb.active)
    wb.calculation.fullCalcOnLoad = True
    return wb


def save(wb: Workbook, path: str) -> str:
    wb.calculation.fullCalcOnLoad = True
    wb.save(path)
    return path


def sheet(wb: Workbook, title: str, tab_color: str | None = None) -> Worksheet:
    ws = wb.create_sheet(title=title[:31])
    if tab_color:
        ws.sheet_properties.tabColor = tab_color
    return ws


# ---------------------------------------------------------------- tables

def write_table(
    ws: Worksheet,
    headers: Sequence[str],
    rows: Sequence[Sequence[Any]],
    *,
    start_row: int = 1,
    start_col: int = 1,
    formats: dict[str, str] | None = None,
    text_cols: Sequence[str] = (),
    total_row: bool | Sequence[str] = False,
    total_label: str = "TOTAL",
    freeze: bool = True,
    autofilter: bool = True,
    band: bool = False,
) -> dict:
    """Write a header + data block with native types, per-column number formats, a live
    formula total row, freeze panes and autofilter. Returns a map of layout coordinates
    so callers can reference cells instead of re-deriving them."""
    formats = dict(formats or {})
    text_cols = set(text_cols)
    hr = start_row
    ncols = len(headers)

    cols: dict[str, dict] = {}
    for j, h in enumerate(headers):
        letter = get_column_letter(start_col + j)
        raw = [r[j] if j < len(r) else None for r in rows]
        vals = [coerce(v, keep_text=h in text_cols) for v in raw]
        cols[h] = {"letter": letter, "idx": start_col + j, "values": vals}

    for j, h in enumerate(headers):
        c = ws.cell(row=hr, column=start_col + j, value=str(h))
        c.font, c.fill, c.alignment, c.border = HEADER_FONT, HEADER_FILL, HEADER_ALIGN, BORDER_BOX

    for i in range(len(rows)):
        r = hr + 1 + i
        for h in headers:
            meta = cols[h]
            c = ws.cell(row=r, column=meta["idx"], value=meta["values"][i])
            nf = formats.get(h) or (FMT["text"] if h in text_cols else infer_fmt(meta["values"]))
            if nf:
                c.number_format = nf
            c.border = BORDER_BOX
            if band and i % 2:
                c.fill = PatternFill("solid", fgColor=F_BAND)

    first_data, last_data = hr + 1, hr + len(rows)
    tr = None
    if total_row and rows:
        tr = last_data + 1
        want = set(total_row) if isinstance(total_row, (list, tuple, set)) else None
        ws.cell(row=tr, column=start_col, value=total_label).font = TOTAL_FONT
        ws.cell(row=tr, column=start_col).border = BORDER_TOP
        for j, h in enumerate(headers):
            meta = cols[h]
            numeric = any(isinstance(v, (int, float)) and not isinstance(v, bool) for v in meta["values"])
            take = (h in want) if want is not None else (numeric and j > 0)
            c = ws.cell(row=tr, column=meta["idx"])
            c.border = BORDER_TOP
            if not take:
                continue
            c.value = f"=SUM({meta['letter']}{first_data}:{meta['letter']}{last_data})"
            c.font = TOTAL_FONT
            nf = formats.get(h) or infer_fmt(meta["values"])
            if nf:
                c.number_format = nf

    if freeze:
        ws.freeze_panes = ws.cell(row=hr + 1, column=start_col)
    if autofilter and rows:
        ws.auto_filter.ref = (
            f"{get_column_letter(start_col)}{hr}:{get_column_letter(start_col + ncols - 1)}{last_data}"
        )
    autofit(ws)
    return {
        "header_row": hr,
        "first_data_row": first_data,
        "last_data_row": last_data,
        "total_row": tr,
        "cols": {h: cols[h]["letter"] for h in headers},
    }


def autofit(ws: Worksheet, min_w: int = 9, max_w: int = 48) -> None:
    for col in ws.columns:
        best = 0
        letter = None
        for c in col:
            if letter is None:
                letter = c.column_letter
            v = c.value
            if v is None:
                continue
            s = v if isinstance(v, str) else str(v)
            if s.startswith("="):
                s = "#,##0.00"
            best = max(best, min(len(s), max_w))
        if letter:
            ws.column_dimensions[letter].width = max(min_w, best + 2)


# ---------------------------------------------------------------- inputs / links / names

def input_cell(
    ws: Worksheet,
    addr: str,
    value: Any,
    *,
    fmt: str | None = None,
    label: str | None = None,
    note: str | None = None,
    bounds: tuple[float, float] | None = None,
    choices: Sequence[str] | None = None,
) -> None:
    """A cell a human is allowed to change: blue, yellow, unlocked, optionally bounded."""
    if label is not None:
        lc = ws.cell(row=ws[addr].row, column=ws[addr].column - 1, value=label)
        lc.font = Font(bold=True)
    c = ws[addr]
    c.value = coerce(value)
    c.font, c.fill, c.border = INPUT_FONT, INPUT_FILL, BORDER_BOX
    c.protection = Protection(locked=False)
    if fmt:
        c.number_format = fmt
    if note:
        nc = ws.cell(row=c.row, column=c.column + 1, value=note)
        nc.font = Font(italic=True, color="808080", size=9)
    if choices:
        dv = DataValidation(type="list", formula1='"%s"' % ",".join(choices), allow_blank=False,
                            showErrorMessage=True, errorTitle="Invalid entry",
                            error="Pick one of: " + ", ".join(choices))
        ws.add_data_validation(dv)
        dv.add(c)
    elif bounds:
        lo, hi = bounds
        dv = DataValidation(type="decimal", operator="between", formula1=lo, formula2=hi,
                            showErrorMessage=True, errorTitle="Out of range",
                            error=f"Value must be between {lo} and {hi}")
        ws.add_data_validation(dv)
        dv.add(c)


def link_cell(ws: Worksheet, addr: str, formula: str, *, fmt: str | None = None,
              external: bool = False) -> None:
    """Cross-sheet reference. Green (or purple if it leaves the workbook — red is reserved for negatives)."""
    c = ws[addr]
    c.value = formula if formula.startswith("=") else "=" + formula
    c.font = EXTERNAL_FONT if external else LINK_FONT
    if fmt:
        c.number_format = fmt


def forecast_style(ws: Worksheet, cell_range: str, fmt: str | None = None) -> None:
    for row in ws[cell_range]:
        for c in row:
            c.font = FORECAST_FONT
            if fmt:
                c.number_format = fmt


def name(wb: Workbook, alias: str, ws: Worksheet, addr: str) -> str:
    """Global named range -> returns the alias, usable directly inside formulas."""
    ref = f"'{ws.title}'!{_abs(addr)}"
    wb.defined_names[alias] = DefinedName(name=alias, attr_text=ref)
    return alias


def _abs(addr: str) -> str:
    return re.sub(r"(?<![$:\w])([A-Z]{1,3})(\d+)", r"$\1$\2", addr.upper())


def protect(ws: Worksheet, password: str | None = None) -> None:
    """Lock everything except cells already marked unlocked by input_cell()."""
    ws.protection.sheet = True
    ws.protection.enableFormatCells = True
    ws.protection.enableFormatColumns = True
    ws.protection.autoFilter = False
    ws.protection.sort = False
    if password:
        ws.protection.password = password


# ---------------------------------------------------------------- checks

def checks_sheet(wb: Workbook, rows: Sequence[tuple[str, str]], title: str = "Checks") -> Worksheet:
    """rows = [(label, boolean_formula_without_equals)]. Any FALSE turns red."""
    ws = sheet(wb, title, tab_color="C00000")
    ws["A1"], ws["B1"], ws["C1"] = "Check", "Result", "Meaning"
    for c in ("A1", "B1", "C1"):
        ws[c].font, ws[c].fill, ws[c].alignment = HEADER_FONT, HEADER_FILL, HEADER_ALIGN
    for i, (label, formula) in enumerate(rows, start=2):
        ws.cell(row=i, column=1, value=label)
        f = formula[1:] if formula.startswith("=") else formula
        ws.cell(row=i, column=2, value=f'=IF({f},"OK","BREAK")')
        ws.cell(row=i, column=3, value="Numbers are safe to use" if i == 2 else "")
    last = max(2, len(rows) + 1)
    rng = f"B2:B{last}"
    ws.conditional_formatting.add(rng, FormulaRule(formula=['$B2="BREAK"'],
                                                   fill=PatternFill("solid", fgColor=F_BREAK)))
    ws.conditional_formatting.add(rng, FormulaRule(formula=['$B2="OK"'],
                                                   fill=PatternFill("solid", fgColor=F_OK)))
    autofit(ws)
    return ws


# ---------------------------------------------------------------- README

def readme_sheet(
    wb: Workbook,
    *,
    title: str,
    purpose: str,
    source: str,
    pulled_at: str,
    sheets: Sequence[tuple[str, str]],
    columns: Sequence[tuple[str, str]] = (),
    caveats: Sequence[str] = (),
    editable: Sequence[str] = (),
    version: str = "",
) -> Worksheet:
    """Sheet 1, always. Move it to index 0 at the end of the build."""
    ws = wb.create_sheet("README", 0)
    ws.sheet_view.showGridLines = False
    r = 1

    def head(text: str) -> None:
        nonlocal r
        r += 1
        c = ws.cell(row=r, column=1, value=text)
        c.font = Font(bold=True, size=12, color=F_HEADER)
        r += 1

    def kv(k: str, v: str) -> None:
        nonlocal r
        ws.cell(row=r, column=1, value=k).font = Font(bold=True)
        ws.cell(row=r, column=2, value=v).alignment = Alignment(wrap_text=True, vertical="top")
        r += 1

    ws.cell(row=1, column=1, value=title).font = Font(bold=True, size=16, color=F_HEADER)
    r = 2
    head("What this is")
    kv("Purpose", purpose)
    kv("Data source", source)
    kv("Pulled at", pulled_at)
    if version:
        kv("Version", version)

    head("Sheets in this workbook")
    for nm, desc in sheets:
        c = ws.cell(row=r, column=1, value=f'=HYPERLINK("#\'{nm}\'!A1","{nm}")')
        c.font = Font(color="0563C1", underline="single")
        ws.cell(row=r, column=2, value=desc).alignment = Alignment(wrap_text=True, vertical="top")
        r += 1

    head("Colour legend")
    for k, v in LEGEND:
        kv(k, v)

    if editable:
        head("What you may change")
        for e in editable:
            kv("•", e)
        kv("Everything else", "is a formula and will recalculate. Sheets are protected to stop "
                              "accidental overwrites — no password, just unprotect if you must.")

    if columns:
        head("Column dictionary")
        for k, v in columns:
            kv(k, v)

    if caveats:
        head("Caveats")
        for cav in caveats:
            kv("•", cav)

    head("If numbers look blank")
    kv("Why", "Formulas are written without cached values. Open in Excel/LibreOffice once and "
              "they populate. A script reading this file before that will see empty cells.")

    ws.column_dimensions["A"].width = 30
    ws.column_dimensions["B"].width = 95
    return ws
