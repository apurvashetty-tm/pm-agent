#!/usr/bin/env python3
"""Build the files for the Claude "Truemeds Design System" artifact from this
folder's sources, so the browsable copy never drifts from truemeds.css.

Output: build/artifact/project/…   (publish per the artifact type's SKILL.md)
Inputs: tokens/*.json, src/components.css, src/brandbook.md, icons/icons.js,
        fonts/*.woff2, and (optional) build/icon-blobs.json — the upload ids of
        the icon SVGs, written after uploading build/artifact/project/assets/Icons/*.svg

Run:  python3 scripts/build_artifact.py
"""
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "build/artifact/project"


def slug(*parts):
    return re.sub(r"[^a-z0-9]+", "-", "-".join(parts).lower()).strip("-")


def walk(node, path):
    if isinstance(node, dict) and "$value" in node:
        yield path, node
        return
    if isinstance(node, dict):
        for k, v in node.items():
            if not k.startswith("$"):
                yield from walk(v, path + [k])


SEMANTIC_USAGE = {
    "tm-content-primary": "Main text and icons on light surfaces. 11.3:1 on white.",
    "tm-content-secondary": "Supporting text, metadata, default icon colour. 6.2:1 on white.",
    "tm-content-tertiary": "Hints and placeholders only — 3.0:1 on white, never essential information.",
    "tm-content-inverse": "Text and icons on brand, inverse or strong status surfaces.",
    "tm-content-disabled": "Text and icons of disabled controls.",
    "tm-content-brand": "Brand-blue text: secondary/ghost/link buttons, selected chips, links. 4.9:1 on white.",
    "tm-content-success": "Done / saved / savings text and icons.",
    "tm-content-warning": "Needs-attention text and icons.",
    "tm-content-error": "Error, failed or destructive text and icons.",
    "tm-content-accent": "Purple marketing accent. Not used in internal tools.",
    "tm-surface-primary": "Cards, sheets, app bars, inputs — the white working surface.",
    "tm-surface-secondary": "Page background behind cards.",
    "tm-surface-tertiary": "Quiet fills: default tags, skeletons, table hover.",
    "tm-surface-inverse": "Dark grey: toasts and dark tags.",
    "tm-surface-brand-subtle": "Selected chip, tinted card, info notice background.",
    "tm-surface-brand-muted": "Light brand fill for decorative brand moments.",
    "tm-surface-brand-default": "Primary button and the one main action. The brand blue.",
    "tm-surface-brand-alternate": "Darker brand step.",
    "tm-surface-brand-strong": "Deep navy brand step.",
    "tm-surface-brand-dark": "Darkest brand step.",
    "tm-surface-interactive-hover": "Primary button hover.",
    "tm-surface-interactive-pressed": "Primary button pressed.",
    "tm-surface-interactive-selected": "Selected state fill.",
    "tm-surface-interactive-disabled": "Disabled button fill.",
    "tm-border-subtle": "Dividers and flat-card outlines.",
    "tm-border-default": "Inputs, outlined buttons, unselected chips.",
    "tm-border-strong": "High-emphasis outlines.",
    "tm-border-disabled": "Disabled control outlines.",
    "tm-border-selected": "Selected chip / option outline.",
    "tm-border-focus": "Focus ring and focused input outline.",
}


def color_usage(name):
    if name in SEMANTIC_USAGE:
        return SEMANTIC_USAGE[name]
    if name.startswith("tm-core-"):
        return "Raw SALT palette step. Do not use directly — use a semantic tm- token."
    m = re.match(r"tm-(surface|border|feedback)-(\w+)-(\w+)", name)
    if m:
        kind, tone, step = m.groups()
        what = {"surface": "fill", "border": "outline", "feedback": "notice"}[kind]
        tone_txt = {"success": "success / done", "warning": "warning / needs attention",
                    "error": "error / failed", "info": "neutral info", "accent": "purple accent",
                    "brand": "brand"}.get(tone, tone)
        return f"{tone_txt.capitalize()} {what} — {step} step."
    return "SALT semantic colour."


def build_tokens():
    core = json.loads((ROOT / "tokens/Core.tokens.json").read_text())
    default = json.loads((ROOT / "tokens/Default.tokens.json").read_text())
    extras = json.loads((ROOT / "tokens/extras.json").read_text())
    colors, core_names = [], {}

    for path, tok in walk(core, []):
        if path[0] != "Colour":
            continue
        name = "tm-core-" + slug(path[-1])
        core_names["/".join(path)] = name
        colors.append({"name": name, "value": tok["$value"]["hex"].lower(), "usage": color_usage(name)})

    sem_colors, sem_other = [], {"spacing": [], "radius": [], "typescale": [], "overlay": []}
    for path, tok in walk(default, []):
        name = "tm-" + slug(*(path[1:] if path[0] == "Colour" else path))
        v = tok["$value"]
        alias = tok.get("$extensions", {}).get("com.figma.aliasData", {}).get("targetVariableName")
        if path[0] == "Colour":
            if isinstance(v, str) and v.startswith("{"):
                ref = "tm-" + slug(*v.strip("{}").split(".")[1:])
                value = "{" + ref + "}"
            elif alias in core_names:
                value = "{" + core_names[alias] + "}"
            else:
                value = v["hex"].lower()
            sem_colors.append({"name": name, "value": value, "usage": color_usage(name)})
        elif path[0] == "Space":
            sem_other["spacing"].append({"name": name, "value": f"{v}px", "usage": f"Spacing step {v}px."})
        elif path[0] == "Radius":
            sem_other["radius"].append({"name": name, "value": f"{v}px",
                                        "usage": "Pills, chips, tags." if v == 999 else f"Corner radius {v}px."})
        elif path[0] == "Overlay":
            sem_other["overlay"].append({"name": name, "value": str(v), "usage": f"Scrim opacity {v}% (black) behind sheets and modals."})
        elif path[:2] == ["Font", "Size"]:
            sem_other["typescale"].append({"name": name, "value": f"{v}px", "usage": "Font size step used by components."})
        elif path[:2] == ["Font", "LineHeight"]:
            sem_other["typescale"].append({"name": name, "value": f"{v}px", "usage": "Line height step used by components."})
        elif path[:2] == ["Font", "Weight"]:
            w = {"Regular": 400, "Medium": 500, "Semibold": 600, "Bold": 700}[v]
            sem_other["typescale"].append({"name": name, "value": str(w), "usage": f"{v} weight."})

    shadows = [{"name": f"tm-shadow-{k}", "value": v.replace("0px 0px", "0 0"),
                "usage": {"primary": "Floating action bars and raised panels (blue-tinted).",
                          "secondary": "Small raised elements (blue-tinted).",
                          "tertiary": "Hairline lift — toggles, tiny controls.",
                          "card": "Default card.",
                          "header": "Sticky app bar / header.",
                          "button-secondary": "Secondary button lift (from Buttons 2.0)."}[k]}
               for k, v in extras["shadow"].items() if not k.startswith("_")]

    t = {k: v for k, v in extras["text"].items() if not k.startswith("_")}

    def styles(keys, usage):
        return [{"name": f"tm-text-{k}", "fontSize": f"{t[k][0]}px", "lineHeight": f"{t[k][1]}px",
                 "fontWeight": t[k][2], "usage": usage, "sample": "Paracetamol 650 mg"} for k in keys]

    tokens = {
        "name": "Truemeds Design System",
        "version": 1,
        "meta": {"source": "figma", "file": "https://www.figma.com/design/DcOIxZidim4Opva4DaDDRO",
                 "synced": datetime.now(timezone.utc).date().isoformat(),
                 "note": "Built by pm-agent/design-system/scripts/build_artifact.py from the SALT variable export."},
        "color": {"themes": [{"id": "light", "name": "Light"}], "tokens": sem_colors + colors},
        "type": {
            "fonts": [
                {"family": "Plus Jakarta Sans", "file": "fonts/plus-jakarta-sans-latin-wght-normal.woff2", "weight": "200 800", "style": "normal"},
                {"family": "Plus Jakarta Sans", "file": "fonts/plus-jakarta-sans-latin-wght-italic.woff2", "weight": "200 800", "style": "italic"},
            ],
            "families": {"sans": "\"Plus Jakarta Sans\", system-ui, -apple-system, sans-serif"},
            "groups": [
                {"name": "Display", "family": "sans", "styles": styles(["display-d1", "display-d2"], "Marketing and hero numbers only.")},
                {"name": "Headings — mobile", "family": "sans", "styles": styles(["h1", "h2", "h3"], "App and mobile screens.")},
                {"name": "Headings — web", "family": "sans", "styles": styles(["h1-web", "h2-web", "h3-web"], "Portals, desktop and web pages.")},
                {"name": "Body", "family": "sans", "styles": styles(
                    ["body-xl", "body-xl-strong", "body-lg", "body-lg-strong", "body-md", "body-md-strong",
                     "body-sm", "body-sm-strong", "body-xs", "body-xs-strong"], "Running text; -strong = semibold for emphasis.")},
                {"name": "Button", "family": "sans", "styles": styles(["button-lg", "button-md", "button-sm", "button-xs"], "Button labels, matching button sizes.")},
            ],
        },
        "spacing": {"tokens": sem_other["spacing"]},
        "radius": {"tokens": sem_other["radius"]},
        "shadow": {"tokens": shadows},
        "typescale": {"note": "Size, line-height and weight steps the components use.", "tokens": sem_other["typescale"]},
        "overlay": {"tokens": sem_other["overlay"]},
    }
    return tokens


# ---------------------------------------------------------------- components
HEAD = '<!doctype html>\n<html><head><meta charset="utf-8"><script src="../../icons/icons.js"></script>\n<style>body{margin:0;padding:16px} .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}</style></head>\n<body class="tm">\n'
FOOT = '\n</body></html>\n'

COMPONENTS = {
    "Button": ("Actions", 200, """Buttons trigger actions; one primary per context. From SALT Buttons 2.0.

- Classes: `tm-btn` + a type (`--primary`, `--secondary`, `--tertiary`, `--ghost`, `--destructive`, `--link`) + optional size (`--lg` 56px, default 48px, `--sm` 40px, `--xs` 32px), `--block` for full width, `--icon` for icon-only.
- Use `--primary` for the one main action; step others down to secondary → tertiary → ghost → link.
- `--destructive` for stop/remove/end actions. Disabled via the `disabled` attribute.
- Icons go before the label: `<span class="tm-icon" data-icon="phone"></span>`.
""", """<div class="row" style="margin-bottom:12px">
<button class="tm-btn tm-btn--primary">Primary</button><button class="tm-btn tm-btn--secondary">Secondary</button><button class="tm-btn tm-btn--tertiary">Tertiary</button><button class="tm-btn tm-btn--ghost">Ghost</button><button class="tm-btn tm-btn--destructive">Destructive</button><button class="tm-btn tm-btn--link">Link</button></div>
<div class="row" style="margin-bottom:12px"><button class="tm-btn tm-btn--primary tm-btn--lg">Large</button><button class="tm-btn tm-btn--primary">Medium</button><button class="tm-btn tm-btn--primary tm-btn--sm">Small</button><button class="tm-btn tm-btn--primary tm-btn--xs">X-Small</button><button class="tm-btn tm-btn--primary" disabled>Disabled</button></div>
<div class="row"><button class="tm-btn tm-btn--primary"><span class="tm-icon" data-icon="phone"></span>Call patient</button><button class="tm-btn tm-btn--secondary"><span class="tm-icon" data-icon="calendar"></span>Schedule</button><button class="tm-btn tm-btn--destructive"><span class="tm-icon" data-icon="phone-off"></span>End call</button></div>"""),

    "InputField": ("Forms", 210, """Labelled text entry with helper, error and success text. From SALT Input Fields.

- Structure: `tm-field` > `tm-field__label`, `tm-field__control` (holds the `input`/`textarea` and optional icons), `tm-field__helper`.
- States: `tm-field--error`, `tm-field--success`, `tm-field--disabled`.
- Placeholders use `tm-content-tertiary` — never put required information in a placeholder.
""", """<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
<div class="tm-field"><label class="tm-field__label">Chief complaint</label><div class="tm-field__control"><input placeholder="e.g. Fever since 2 days"></div><span class="tm-field__helper">Visible to the pharmacist</span></div>
<div class="tm-field tm-field--error"><label class="tm-field__label">Mobile number</label><div class="tm-field__control"><input value="98201"></div><span class="tm-field__helper">Enter a 10-digit number</span></div>
<div class="tm-field tm-field--disabled"><label class="tm-field__label">Order ID</label><div class="tm-field__control"><input value="TM-ORD-20240812" disabled></div></div>
<div class="tm-field" style="grid-column:span 3"><label class="tm-field__label">Doctor notes</label><div class="tm-field__control"><textarea rows="2" placeholder="Clinical observations, instructions…"></textarea></div></div></div>"""),

    "Chip": ("Selection", 72, """Filter and pick-one options. From SALT Chips › Filters.

- `tm-chip` as a `<button>`; selected with `aria-pressed="true"` (or `tm-chip--selected`); disabled via `disabled`.
- Chips select or filter. They are not buttons for actions and not status labels (use Tag).
""", """<div class="row"><button class="tm-chip" aria-pressed="true">All</button><button class="tm-chip" aria-pressed="false">Pending</button><button class="tm-chip" aria-pressed="false">Prescribed</button><button class="tm-chip"><span class="tm-icon tm-icon--16" data-icon="plus"></span>Add filter</button><button class="tm-chip" disabled>Disabled</button></div>"""),

    "Tag": ("Status", 64, """Small status label. From SALT Chips › Labels and Text.

- `tm-tag` + tone: `--info` (brand), `--success`, `--warning`, `--critical`, `--dark`; no tone = neutral.
- The only way to show status in a list or table. Never colour a whole row or card instead.
- The success tag is 4.0:1 (SALT's pair) — keep labels short and pair with text meaning, not colour alone.
""", """<div class="row"><span class="tm-tag">Default</span><span class="tm-tag tm-tag--info">Cat4</span><span class="tm-tag tm-tag--success">Prescribed</span><span class="tm-tag tm-tag--warning">Pending</span><span class="tm-tag tm-tag--critical">No pickup</span><span class="tm-tag tm-tag--dark">HA skipped</span></div>"""),

    "Card": ("Containers", 150, """White grouped container with the SALT card shadow.

- `tm-card` (default), `tm-card--flat` (outline, no shadow — dense internal-tool layouts), `tm-card--tint` (brand-subtle highlight).
- Padding `tm-space-lg`, radius `tm-radius-lg`. Never nest cards — divide with `tm-divider`.
""", """<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
<div class="tm-card"><div class="tm-section-title">Card</div><span class="tm-muted">Default — white, 16 radius, card shadow.</span></div>
<div class="tm-card tm-card--flat"><div class="tm-section-title">Flat</div><span class="tm-muted">For dense internal tools.</span></div>
<div class="tm-card tm-card--tint"><div class="tm-section-title">Tint</div><span class="tm-muted">Highlighted information.</span></div></div>"""),

    "ListRow": ("Containers", 300, """Item rows for medicines, orders and cases, with a real product thumbnail.

- `tm-row` > `tm-thumb` (real photo, never an illustration), `tm-row__main` (`tm-row__title`, `tm-row__meta`), then a trailing tag, value or chevron.
- Rows inside one card get a `tm-border-subtle` divider automatically.
""", """<div class="tm-card" style="max-width:420px"><div class="tm-section-title">Medicines · 3</div>
<div class="tm-row"><div class="tm-thumb"></div><div class="tm-row__main"><div class="tm-row__title">Metformin 500mg</div><div class="tm-row__meta">1-0-1 · Ongoing · Qty 60 · ₹28</div></div><span class="tm-tag tm-tag--success">Prescribed</span></div>
<div class="tm-row"><div class="tm-thumb"></div><div class="tm-row__main"><div class="tm-row__title">Amlodipine 5mg</div><div class="tm-row__meta">1-0-0 · Ongoing · Qty 30 · ₹52</div></div><span class="tm-tag tm-tag--warning">Pending</span></div>
<div class="tm-row"><div class="tm-thumb"></div><div class="tm-row__main"><div class="tm-row__title">Atorvastatin 10mg</div><div class="tm-row__meta">0-0-1 · Ongoing · Qty 30 · ₹45</div></div><span class="tm-icon" data-icon="chevron-right"></span></div></div>"""),

    "Notice": ("Feedback", 170, """Inline message inside a screen. Built from SALT's Feedback tokens.

- `tm-notice` (info, brand-subtle), `--warning`, `--error`; an icon first, then one or two sentences.
- For a passing confirmation use Toast instead.
""", """<div style="display:flex;flex-direction:column;gap:8px;max-width:560px">
<div class="tm-notice"><span class="tm-icon" data-icon="info-circle"></span><span>Closing script: confirm the order and mention tracking in the app.</span></div>
<div class="tm-notice tm-notice--warning"><span class="tm-icon" data-icon="alert-triangle"></span><span>Health advisor call pending for this order.</span></div>
<div class="tm-notice tm-notice--error"><span class="tm-icon" data-icon="alert-circle"></span><span>Call failed. Try again or schedule a callback.</span></div></div>"""),

    "Toast": ("Feedback", 64, """Brief one-line confirmation, bottom centre, above everything. From SALT Toasts.

- `tm-toast` is fixed to the bottom centre of the screen. Copy must fit on one line.
- Auto-dismiss after a few seconds; never put an action the user must take in a toast.
""", """<div class="row" style="justify-content:center"><span class="tm-toast" style="position:static;transform:none">Recommended substitute added</span></div>"""),

    "SelectionControls": ("Selection", 120, """Checkbox, radio and toggle. From SALT Checkboxes, Radio Buttons and Toggles.

- `tm-check` wraps a native checkbox or radio and its label (brand accent colour).
- `tm-toggle` on a checkbox input for on/off settings that apply immediately.
""", """<div style="display:flex;flex-direction:column;gap:8px">
<label class="tm-check"><input type="checkbox" checked> Patient name is same as receiver</label>
<label class="tm-check"><input type="radio" name="r" checked> Me</label>
<label class="tm-check"><input type="radio" name="r"> Someone else</label>
<label class="tm-check"><input type="checkbox" class="tm-toggle" checked> Notify on delivery</label></div>"""),

    "AppBar": ("Navigation", 90, """Sticky top bar for mobile screens, with the SALT header shadow.

- `tm-appbar` > back icon, `tm-appbar__title`, then at most one or two trailing items (a tag or icon button).
""", """<div class="tm-appbar" style="position:static"><span class="tm-icon" data-icon="arrow-left"></span><span class="tm-appbar__title">Consultation</span><span class="tm-tag tm-tag--info">Cat4</span></div>"""),

    "ActionBar": ("Navigation", 110, """Sticky bottom bar holding the screen's one main action on mobile (SALT Cart CTA bar).

- `tm-actionbar` with a `tm-btn--primary tm-btn--lg tm-btn--block` inside. Keeps the main action in thumb reach.
""", """<div style="max-width:420px"><div class="tm-actionbar"><button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block"><span class="tm-icon" data-icon="phone"></span>Call patient</button></div></div>"""),

    "BottomSheet": ("Containers", 240, """Mobile panel for choices and details, over a 60% scrim.

- `tm-overlay` + `tm-sheet` (top corners `tm-radius-2xl`). Title, short content, then the sheet's actions.
""", """<div style="position:relative;height:208px;overflow:hidden;border-radius:16px"><div class="tm-overlay" style="position:absolute"></div><div class="tm-sheet" style="position:absolute"><div class="tm-text-h2" style="margin-bottom:12px">Mark no pickup?</div><div class="row"><button class="tm-btn tm-btn--tertiary">Cancel</button><button class="tm-btn tm-btn--primary">Confirm</button></div></div></div>"""),

    "SideNav": ("Internal tools (proposed)", 220, """**Proposed — not in SALT.** Left navigation for portals and desktop tools, built from SALT tokens.

- `tm-sidenav` > `tm-sidenav__item` links with an icon; the current page gets `aria-current="page"`.
""", """<nav class="tm-sidenav" style="height:190px"><a class="tm-sidenav__item" aria-current="page"><span class="tm-icon" data-icon="layout-dashboard"></span>Dashboard</a><a class="tm-sidenav__item"><span class="tm-icon" data-icon="clipboard-list"></span>My cases</a><a class="tm-sidenav__item"><span class="tm-icon" data-icon="chart-bar"></span>My statistics</a><a class="tm-sidenav__item"><span class="tm-icon" data-icon="settings"></span>Settings</a></nav>"""),

    "DataTable": ("Internal tools (proposed)", 200, """**Proposed — not in SALT.** Dense, scannable table for portals.

- `tm-table`; numbers in `tm-num` cells (right-aligned, tabular figures); status as `tm-tag`, never coloured rows.
- Put it in a `tm-card--flat` with no padding.
""", """<div class="tm-card tm-card--flat" style="padding:0;overflow:hidden"><table class="tm-table"><thead><tr><th>Order</th><th>Patient</th><th>Case</th><th>Status</th><th class="tm-num">Value</th></tr></thead><tbody>
<tr><td>TM-ORD-20240812</td><td>Ramesh Gupta</td><td><span class="tm-tag tm-tag--info">Cat4</span></td><td><span class="tm-tag tm-tag--success">Prescribed</span></td><td class="tm-num">₹1,240</td></tr>
<tr><td>TM-ORD-20240813</td><td>Anita Desai</td><td><span class="tm-tag">Pilot</span></td><td><span class="tm-tag tm-tag--warning">Pending</span></td><td class="tm-num">₹860</td></tr>
<tr><td>TM-ORD-20240814</td><td>Vikram Rao</td><td><span class="tm-tag">Pilot</span></td><td><span class="tm-tag tm-tag--critical">No pickup</span></td><td class="tm-num">₹2,115</td></tr></tbody></table></div>"""),

    "StatTile": ("Internal tools (proposed)", 120, """**Proposed — not in SALT.** KPI tile for portal dashboards.

- `tm-stat` > `tm-stat__label` (use Truemeds' own metric names) and `tm-stat__value` (tabular figures).
""", """<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px"><div class="tm-stat"><div class="tm-stat__label">Cases attempted</div><div class="tm-stat__value">48</div></div><div class="tm-stat"><div class="tm-stat__label">Cases connected</div><div class="tm-stat__value">36</div></div><div class="tm-stat"><div class="tm-stat__label">Prescribed</div><div class="tm-stat__value">29</div></div></div>"""),
}

COVER = """<!-- @dsCard height=288 -->
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Truemeds Design System</title>
<style>
  html, body { margin:0; height:100%; }
  body { background:var(--tm-surface-primary); color:var(--tm-content-primary); font-family:var(--font-sans); overflow:hidden; }
  .cover { position:relative; height:288px; overflow:hidden; }
  .band { position:absolute; top:0; left:0; width:960px; height:112px; }
  .band svg { display:block; width:960px; height:112px; }
  .brand { fill:var(--tm-surface-brand-default); }
  .navy  { fill:var(--tm-surface-brand-strong); }
  .tint  { fill:var(--tm-surface-brand-subtle); }
  .green { fill:var(--tm-surface-success-strong); }
  .blk   { rx:var(--tm-radius-lg); }
  .cap   { rx:8px; }
  .cap.on-brand { fill:var(--tm-surface-brand-muted); }
  .cap.on-tint  { fill:var(--tm-surface-brand-default); }
  .cap.on-navy  { fill:var(--tm-surface-brand-default); }
  .words { position:absolute; left:var(--tm-space-xl); right:var(--tm-space-xl); bottom:var(--tm-space-xl); }
  .name { margin:0; font-size:64px; line-height:.95; font-weight:700; letter-spacing:-.02em; color:var(--tm-content-primary); white-space:nowrap; }
  .tag  { margin:var(--tm-space-sm) 0 0 2px; font-size:14px; line-height:20px; color:var(--tm-content-secondary); max-width:440px; }
</style></head>
<body><div class="cover">
<div class="band" aria-hidden="true">
<svg viewBox="0 0 960 112" width="960" height="112">
<!--
  blocks      tm-surface-brand-default 432×128 (the brand blue, largest) · tm-surface-brand-strong 192×128 (deep navy) · tm-surface-brand-subtle 224×128 (tint) · tm-surface-success-strong 80×128 (the green of the Truemeds mark, small) — all bleeding off the top, ≈38% of 960×288
  arrangement a strip of unequal bands across the top (top-band skeleton: the name is too wide for the 440px zone), tm-space-lg gutters, bottoms on one line
  pattern     capsules — the literal motif of a pharmacy — 48×16 pills (rx = half of 16) at a tm-space-xl pitch, a loose diagonal run crossing blue → tint → navy
  scales      sides in tm-space-lg multiples; gutters tm-space-lg; capsule pitch tm-space-xl; block corners tm-radius-lg; capsule rx 8 (half its 16 height)
-->
<rect class="brand blk" x="0"   y="-16" width="432" height="128" rx="16"/>
<rect class="navy blk"  x="448" y="-16" width="192" height="128" rx="16"/>
<rect class="tint blk"  x="656" y="-16" width="224" height="128" rx="16"/>
<rect class="green blk" x="896" y="-16" width="80"  height="128" rx="16"/>
<rect class="cap on-brand" x="232" y="24" width="48" height="16" rx="8"/>
<rect class="cap on-brand" x="296" y="48" width="48" height="16" rx="8"/>
<rect class="cap on-brand" x="360" y="72" width="48" height="16" rx="8"/>
<rect class="cap on-navy"  x="472" y="24" width="48" height="16" rx="8"/>
<rect class="cap on-navy"  x="536" y="48" width="48" height="16" rx="8"/>
<rect class="cap on-tint"  x="680" y="24" width="48" height="16" rx="8"/>
<rect class="cap on-tint"  x="744" y="48" width="48" height="16" rx="8"/>
<rect class="cap on-tint"  x="808" y="72" width="48" height="16" rx="8"/>
</svg></div>
<div class="words"><h1 class="name">Truemeds Design System</h1><p class="tag">One calm, clinical system for every Truemeds screen.</p></div>
</div></body></html>
"""


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "components").mkdir(parents=True)
    (OUT / "tokens.json").write_text(json.dumps(build_tokens(), indent=1, ensure_ascii=False))
    (OUT / "README.md").write_text((ROOT / "src/brandbook.md").read_text())
    css = (ROOT / "src/components.css").read_text()
    (OUT / "components/bundle.css").write_text(
        "/* From pm-agent/design-system/src/components.css. Bridges the page's font token. */\n"
        ":root { --tm-font-family-plus-jakarta-sans: var(--font-sans); }\n" + css)
    for name, (group, height, readme, body) in COMPONENTS.items():
        d = OUT / "components" / name
        d.mkdir()
        (d / "README.md").write_text(readme)
        (d / "preview.html").write_text(f'<!-- @dsCard group="{group}" height={height} -->\n' + HEAD + body + FOOT)
    (OUT / "components/Cover").mkdir()
    (OUT / "components/Cover/preview.html").write_text(COVER)
    (OUT / "icons").mkdir()
    shutil.copy(ROOT / "icons/icons.js", OUT / "icons/icons.js")
    (OUT / "fonts").mkdir()
    for f in (ROOT / "fonts").glob("*.woff2"):
        shutil.copy(f, OUT / "fonts" / f.name)

    # Icon SVGs for the Assets view (uploaded separately; ids recorded in build/icon-blobs.json)
    js = (ROOT / "icons/icons.js").read_text()
    paths = json.loads(re.search(r"var P = (\{.*?\});\n", js, re.S).group(1))
    icon_dir = OUT / "assets/Icons"
    icon_dir.mkdir(parents=True)
    for n, inner in paths.items():
        (icon_dir / f"{n}.svg").write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" '
            'stroke="#5B616E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>\n")
    (icon_dir / "README.md").write_text(
        "# Icons\n\nTabler outline (MIT) — the set SALT uses, same names. Drawn here in `tm-content-secondary` (#5B616E); "
        "in product they inherit the text colour. Use them through `icons/icons.js`: "
        "`<span class=\"tm-icon\" data-icon=\"phone\"></span>`. Need another? Add its Tabler name to `icons/icons.txt` "
        "in pm-agent/design-system and rebuild.\n")
    print(f"artifact files in {OUT}: {sum(1 for _ in OUT.rglob('*') if _.is_file())}")


if __name__ == "__main__":
    main()
