import os, sys, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xl_kit import *

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.getcwd(), "demo_forecast.xlsx")

wb = new_book()

# ---- Inputs (the only editable surface)
ws_in = sheet(wb, "Inputs", tab_color="FFC000")
ws_in["A1"] = "Assumptions — blue cells are yours to change"
ws_in["A1"].font = Font(bold=True, size=13, color=F_HEADER)
input_cell(ws_in, "B3", "Base", label="Scenario", choices=["Base", "Bull", "Bear"], note="drives the growth pick")
input_cell(ws_in, "B4", 0.08, fmt=FMT["pct"], label="Growth — Base", bounds=(-1, 1))
input_cell(ws_in, "B5", 0.15, fmt=FMT["pct"], label="Growth — Bull", bounds=(-1, 1))
input_cell(ws_in, "B6", 0.02, fmt=FMT["pct"], label="Growth — Bear", bounds=(-1, 1))
input_cell(ws_in, "B7", 0.22, fmt=FMT["pct"], label="Gross margin", bounds=(0, 1))
ws_in["B9"] = '=INDEX(B4:B6,MATCH(B3,{"Base";"Bull";"Bear"},0))'
ws_in["B9"].font, ws_in["B9"].number_format = Font(bold=True), FMT["pct"]
ws_in["A9"] = "Growth in force"
ws_in["A9"].font = Font(bold=True)
autofit(ws_in)

name(wb, "scenario", ws_in, "B3")
name(wb, "growth", ws_in, "B9")
name(wb, "gross_margin", ws_in, "B7")
protect(ws_in)

# ---- Actuals
ws_a = sheet(wb, "Actuals")
headers = ["month", "orders", "gmv", "returns", "net_adds"]
rows = [
    ["2026-05-01", "12,480", "₹1,84,20,000", 312, "1,205"],
    ["2026-06-01", "13,905", "₹2,01,55,000", 401, "(402)"],   # bracketed negative in the source
    ["2026-07-01", "14,220", "₹2,10,90,000", 388, 876],
]
lay = write_table(ws_a, headers, rows,
                  formats={"month": FMT["date"], "orders": FMT["int"], "gmv": FMT["money"],
                           "returns": FMT["int"], "net_adds": FMT["int"]},
                  total_row=True, band=True)
last = lay["last_data_row"]
name(wb, "gmv_last", ws_a, f"C{last}")
protect(ws_a)

# ---- Forecast (links only, no retyped constants)
ws_f = sheet(wb, "Forecast")
write_table(ws_f, ["month", "type", "gmv", "gross_profit"], [], freeze=True, autofilter=False)
ws_f["A2"], ws_f["B2"] = dt.date(2026, 8, 1), "FORECAST"
ws_f["A2"].number_format = FMT["date"]
link_cell(ws_f, "C2", "=gmv_last*(1+growth)", fmt=FMT["money"])
for i, r in enumerate(range(3, 8)):
    m = 9 + i
    ws_f.cell(row=r, column=1, value=dt.date(2026 + m // 13, m % 12 or 12, 1)).number_format = FMT["date"]
    ws_f.cell(row=r, column=2, value="FORECAST")
    link_cell(ws_f, f"C{r}", f"=C{r-1}*(1+growth)", fmt=FMT["money"])
for r in range(2, 8):
    link_cell(ws_f, f"D{r}", f"=C{r}*gross_margin", fmt=FMT["money"])
    # goes negative early in the ramp — proves [Red] survives inside a green cross-sheet link
    link_cell(ws_f, f"E{r}", f"=C{r}-gmv_last*1.5", fmt=FMT["money"])
ws_f["E1"] = "gap_vs_stretch"
ws_f["A8"] = "TOTAL"
ws_f["A8"].font = TOTAL_FONT
for col in ("C", "D", "E"):
    c = ws_f[f"{col}8"]
    c.value, c.font, c.number_format, c.border = f"=SUM({col}2:{col}7)", TOTAL_FONT, FMT["money"], BORDER_TOP
forecast_style(ws_f, "C2:D7")
autofit(ws_f)
protect(ws_f)

checks_sheet(wb, [
    ("Forecast total equals sum of monthly rows", "ABS('Forecast'!C8-SUM('Forecast'!C2:C7))<0.01"),
    ("Growth in force is within -100%..100%", "AND(growth>=-1,growth<=1)"),
    ("Actuals GMV total ties to rows", f"ABS('Actuals'!C{lay['total_row']}-SUM('Actuals'!C{lay['first_data_row']}:C{last}))<0.01"),
])

readme_sheet(
    wb,
    title="GMV Forecast — demo",
    purpose="Six-month GMV and gross-profit projection off three months of actuals.",
    source="Redshift DB 170 tmmumpsdb.order_details (demo data, not a real pull)",
    pulled_at="2026-08-17 18:45 IST",
    version="v0.1",
    sheets=[("Inputs", "Editable assumptions. Change here, everything else follows."),
            ("Actuals", "Observed months. Read-only."),
            ("Forecast", "Modelled months. Every cell is a formula off Inputs."),
            ("Checks", "Tie-outs. All must read OK before you trust the numbers.")],
    columns=[("gmv", "Gross merchandise value, ₹, invoiced basis"),
             ("type", "ACTUAL = observed. FORECAST = modelled."),
             ("gross_profit", "gmv × gross_margin from Inputs!B7")],
    editable=["Inputs!B3 scenario (Base/Bull/Bear)", "Inputs!B4:B6 growth rates", "Inputs!B7 gross margin"],
    caveats=["Growth is applied flat month-on-month; no seasonality.",
             "Returns are not netted out of GMV."],
)

save(wb, OUT)
print("wrote", OUT)
