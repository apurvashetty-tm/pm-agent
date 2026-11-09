#!/usr/bin/env node
// Native hand-off kit builder (D-96 pilot: Sign-in). One command regenerates every generated file in handoff/ and CHANGES.md.
//   node scripts/build-handoff.mjs           build (needs Chrome: $CHROME, or Playwright's Chromium)
//   node scripts/build-handoff.mjs --check   exit 1 if handoff/ is out of date with its sources (no browser; fast)
//
// Nothing here is typed by hand into the kit: tokens come from the design-system build code (scripts/build-handoff.py),
// element facts from the CSS rules that actually apply in the built app (Chrome DevTools protocol: matched rules, file, line),
// copy keys from the screen's MSG() calls, rules and answers quoted from the maintained documents. Only the questions in
// DECIDED / OPEN (an engineer's wording) and the block / element naming below are configuration. Any source pattern that
// stops matching fails the build, so a moved rule can't go silently missing.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DS = path.resolve(ROOT, "../../design-system");
const OUT = path.join(ROOT, "handoff");
const MANIFEST = path.join(ROOT, "scripts/build-handoff.manifest.json");
const CHECK = process.argv.includes("--check");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(p, "utf8");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const die = (msg) => { console.error(`build-handoff: ${msg}`); process.exit(1); };

// ---------------------------------------------------------------------------------------------------------------------
// Sources. Whole-file hashes for files the kit copies or measures; snippet hashes for the big documents (only the
// quoted lines count, so an unrelated edit elsewhere in the decision log doesn't make the kit stale).
// ---------------------------------------------------------------------------------------------------------------------
const FILES = {
  tokensTs: path.join(DS, "native/tokens.ts"),
  tokensJson: path.join(DS, "native/tokens.json"),
  iconsTs: path.join(DS, "native/icons.ts"),
  messagesTs: path.join(ROOT, "ui-screens/native/messages.ts"),
  messagesJson: path.join(ROOT, "ui-screens/feedback/messages.json"),
  metadataJson: path.join(ROOT, "ui-screens/feedback/metadata.json"),
  approvedHtml: path.join(ROOT, "ui-screens/sign-in/sign-in.html"),
  signInJs: path.join(ROOT, "app/screens/sign-in.js"),
  signInCss: path.join(ROOT, "app/screens/sign-in.css"),
  appCss: path.join(ROOT, "app/design-system/truemeds.css"),
  logo: path.join(ROOT, "brand/truemeds-for-doctors.svg"),
  dsCss: path.join(DS, "truemeds.css"),
  dsFontsDir: path.join(DS, "fonts"),
  tokenBuild: path.join(DS, "scripts/build.py"),
  tokenBuildNative: path.join(DS, "scripts/build_native.py"),
  dsTokens: [path.join(DS, "tokens/Core.tokens.json"), path.join(DS, "tokens/Default.tokens.json"), path.join(DS, "tokens/extras.json"), path.join(DS, "tokens/truemeds.json"), path.join(DS, "src/components.css")],
  builder: [path.join(ROOT, "scripts/build-handoff.mjs"), path.join(ROOT, "scripts/build-handoff.py")],
};
const DOCS = {
  appLogic: path.join(ROOT, "ui-screens/app-logic.md"),
  fmap: path.join(ROOT, "docs/feedback-state-map.md"),
  decisions: path.join(ROOT, "docs/context/decision_log.md"),
  oqs: path.join(ROOT, "docs/context/open_questions.md"),
  rules: path.join(DS, "RULES.md"),
  auth: path.join(ROOT, "app/core/auth.js"),
  settings: path.join(ROOT, "app/core/settings.js"),
  links: path.join(ROOT, "app/data/links.js"),
  keyboard: path.join(ROOT, "app/shell/mock-keyboard.js"),
};
const STATES = ["default", "keyboard-open", "empty-tap", "too-short", "wrong-first-digit", "pasted-cleaned", "sending",
  "not-registered", "offline", "couldnt-send", "too-many-tries", "inactive"];
const STATE_NAMES = { default: "Default", "keyboard-open": "Keyboard open", "empty-tap": "Empty tap", "too-short": "Too short",
  "wrong-first-digit": "Wrong first digit", "pasted-cleaned": "Pasted, cleaned", sending: "Sending OTP", "not-registered": "Not registered",
  offline: "Offline", "couldnt-send": "Couldn’t send", "too-many-tries": "Too many tries", inactive: "Inactive account" };
const PICTURE = (s, w) => path.join(ROOT, `ui-screens/sign-in/sign-in_${s}_w${w}.png`);

// ---------------------------------------------------------------------------------------------------------------------
// Text extraction from the maintained documents (quoted, then cleaned of internal working notes)
// ---------------------------------------------------------------------------------------------------------------------
const docCache = {};
const doc = (k) => (docCache[k] ??= read(DOCS[k]));
const snippets = {};   // what the kit quotes, per document -> hashed for --check
function quote(k, text) { (snippets[k] ??= []).push(text); return text; }
function lineOf(k, re, within) {
  const lines = (within ? section(k, within) : doc(k)).split("\n");
  let i = lines.findIndex((l) => re.test(l));
  if (i < 0) die(`${rel(DOCS[k])}: no line matches ${re}${within ? ` in ${within}` : ""}`);
  // a wrapped bullet: back up to its first line, then take its continuation lines
  const isItem = (l) => /^\s*(?:[-*]|\d+\.)\s/.test(l) || /^\s*\|/.test(l) || /^#/.test(l);
  const isCont = (l) => l.trim() && !isItem(l) && /^\s+\S/.test(l);
  while (i > 0 && isCont(lines[i]) && !isItem(lines[i])) i--;
  let j = i + 1;
  if (isItem(lines[i])) { if (!/^\s*\|/.test(lines[i])) while (j < lines.length && isCont(lines[j])) j++; }
  else while (j < lines.length && lines[j].trim() && !/^(?:\*\*|#|\s*[-*|]\s|\d+\.\s)/.test(lines[j])) j++;   // a plain paragraph
  return quote(k, lines.slice(i, j).map((l) => l.trim()).join(" "));
}
function section(k, heading) {   // "### D-39 ·" or "## 2. Sign-in" -> text until the next heading of the same or higher level
  const lines = doc(k).split("\n");
  const i = lines.findIndex((l) => l.startsWith(heading));
  if (i < 0) die(`${rel(DOCS[k])}: no section ${heading}`);
  const level = heading.match(/^#+/)[0].length;
  let j = i + 1;
  while (j < lines.length && !(lines[j].match(/^#+ /) && lines[j].match(/^#+/)[0].length <= level)) j++;
  return lines.slice(i, j).join("\n");
}
// Internal working notes out: people, review rounds, audit ids, files, tools. Decision numbers (D-xx) stay.
const INTERNAL = /\bpicture|Apurva|\bRound\s*\d|\blane\b|Codex|\brender|Netlify|\bgit\b|\bbrief\b|\.py\b|\.md\b|\.html\b|\.png\b|\bA-\d\d\b|\bB-\d\d\b|\bCW-|beyond-salt|NEEDS-|\brecovery\b|\bplan v|\bplan B\d|fix round|check-locked|Mangesh|Kunal|Swapnil|Claude Code/i;
const PATHS = [[/`?ui-screens\/feedback\/messages\.json`?/g, "`foundation/messages.ts`"], [/`?docs\/feedback-state-map\.md`?/g, "the feedback map (quoted in DECIDED.md)"],
  [/`?brand\/truemeds-for-doctors\.svg`?/g, "`foundation/logo/truemeds-for-doctors.svg`"], [/`?truemeds\.css`?/g, "the design system"]];
const REPLACE = [[/: "New here\? Sign up below\. Already applied\? Our team will call you once you're approved\."/, " (copy: `signin.notRegistered`)."]];
const DROP = [/^\(Try again · Not now/, /^Reconnect to turn on faster/, /^\(2\) \*\*16 messages/, /^\(3\) \*\*Kept/, /^\(4\) \*\*Faster sign-in offer copy/, /^`call\.transferReady`/, /^Failed stays on the offer/, /Sign-in is 174 today/, /166 is the largest width that fits Home/, /"New here\? Sign up below/, /Rule in §4\./, /^\(2\) \*\*16 messages shortened/];
function clean(s) {
  let t = s.trim();
  if (t.startsWith("|")) { const c = t.split("|").map((x) => x.trim()).filter(Boolean); t = c.length > 2 ? `${c[0]} — ${c[1]}: ${c.slice(2).join(" · ")}` : c.join(" — "); }
  t = t.replace(/^\s*[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\s*\[(?:CHANGED|ADDED|ENHANCED|UPDATED)[^\]]*\]/g, "");
  for (const [re, to] of PATHS) t = t.replace(re, to);
  t = t.replace(/\*\*Decision \(Apurva\)[^*]*:\*\*\s*/g, "").replace(/Decision \(Apurva\)[^:]*:\s*/g, "");
  // parentheticals: keep only decision numbers
  for (let k = 0; k < 3; k++) t = t.replace(/\(([^()]*)\)/g, (m, inner) => {
    const ds = inner.match(/D-\d+(?:\s+(?:F\d+|pt \d+|point \d+))?/g);
    if (!INTERNAL.test(inner)) return m;
    return ds ? `(${ds.join(", ")})` : "";
  });
  t = t.replace(/`[^`]*(?:\/|\.md|\.py|\.html|\.png|\.css)[^`]*`/g, (m) => /https?:|^`foundation\//.test(m) ? m : "")
    .replace(/\(\s*,\s*/g, "(").replace(/\(\s*\)/g, "").replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
  for (const [re, to] of REPLACE) t = t.replace(re, to);
  t = t.split(/(?<!e\.g\.|i\.e\.)(?<=[.!?]["”*]{0,2})\s+(?=\S)/).filter((x) => !DROP.some((re) => re.test(x))).join(" ").replace(/ \*\*(?=[\s·]|$)/g, "**");
  // sentences that still carry internal notes go
  t = t.split(/(?<=\.)\s+(?=[A-Z*])/).filter((x) => !INTERNAL.test(x.replace(/\b(?:sign-in|Sign-in)\b/g, ""))).join(" ");
  if (INTERNAL.test(t.replace(/\b(?:sign-in|Sign-in)\b/g, ""))) die(`internal wording left after cleaning: ${t}`);
  t = t.trim();
  return /^[a-z]+[\s,:]/.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

// ---------------------------------------------------------------------------------------------------------------------
// Tokens (web -> native) from the design-system build code
// ---------------------------------------------------------------------------------------------------------------------
function tokenMap() {
  const r = spawnSync("python3", [path.join(ROOT, "scripts/build-handoff.py"), DS], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  if (r.status !== 0) die(`token map failed: ${r.stderr}`);
  const m = JSON.parse(r.stdout);
  const nativeName = (p) => "tokens." + p.join(".");
  const tsName = (p) => "tokens" + p.map((x) => (/^[A-Za-z_$][\w$]*$/.test(x) ? `.${x}` : `['${x}']`)).join("");
  const resolve = (web, seen = []) => {
    if (m.aliases[web]) return { ...resolve(m.aliases[web].to, [...seen, web]), via: [...seen, web] };
    if (m.vars[web]) return { web, native: nativeName(m.vars[web].native), ts: tsName(m.vars[web].native), value: m.vars[web].value, via: seen };
    if (m.palette[web]) return { web, native: nativeName(m.palette[web].native), ts: tsName(m.palette[web].native), value: m.palette[web].value, palette: true, via: seen };
    return null;
  };
  return { m, resolve, nativeName, tsName };
}

// ---------------------------------------------------------------------------------------------------------------------
// Copy (messages.ts is the copy the app team gets; messages.json is its source)
// ---------------------------------------------------------------------------------------------------------------------
function exportedObject(text, name) {
  const start = text.indexOf("{", text.indexOf(`export const ${name}`));
  let depth = 0, q = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (q) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') q = false; }
    else if (c === '"') q = true; else if (c === "{") depth++; else if (c === "}" && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  die(`no export ${name}`);
}
const messages = exportedObject(read(FILES.messagesTs), "messages");
const metadata = JSON.parse(read(FILES.metadataJson));
const usedKeys = [...new Set([...read(FILES.signInJs).matchAll(/MSG\(\s*"([\w.]+)"/g), ...read(FILES.signInJs).matchAll(/key:\s*"([\w.]+)"/g),
  ...read(FILES.signInJs).matchAll(/error:\s*"([\w.]+)"/g)].map((x) => x[1]))].filter((k) => messages[k]);
function copyFor(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const hits = usedKeys.flatMap((k) => {
    const re = new RegExp("^" + messages[k].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{(\w+)\\\}/g, "(?<$1>.+?)") + "$");
    const mm = t.match(re);
    return mm ? [{ copyKey: k, values: mm.groups ? { ...mm.groups } : undefined }] : [];
  });
  if (hits.length > 1) die(`ambiguous copy "${t}": ${hits.map((h) => h.copyKey)}`);
  return hits[0] || { literal: t };
}

// ---------------------------------------------------------------------------------------------------------------------
// Approved reference file: DOM inventory (for the audit join) and its CSS (every value that isn't a token)
// ---------------------------------------------------------------------------------------------------------------------
function approvedInventory() {
  const html = read(FILES.approvedHtml);
  const body = html.slice(html.indexOf('<section class="login-phone'), html.indexOf("</section>") + 10);
  const stack = [], nodes = [];
  for (const mm of body.matchAll(/<\/?([\w-]+)\b([^>]*?)>/g)) {
    if (mm[0].startsWith("</")) { stack.pop(); continue; }
    const attrs = Object.fromEntries([...mm[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    const parent = stack.at(-1), sib = nodes.filter((n) => n.parent === parent && n.tag === mm[1]);
    const selector = attrs.id ? `#${attrs.id}` : (parent ? parent.selector + " > " : "") + mm[1] + `:nth-of-type(${sib.length + 1})`;
    const node = { tag: mm[1], attrs, parent, selector, cls: (attrs.class || "").split(" ").filter(Boolean) };
    nodes.push(node);
    if (!["img", "input", "br", "hr", "meta", "link"].includes(mm[1])) stack.push(node);
  }
  return nodes;
}
const SCAFFOLD = /^(?:html|body|\.review-controls|html\.capture)/;   // the reference page's own frame, not the screen
function approvedCssAudit() {
  const html = read(FILES.approvedHtml);
  const start = html.indexOf("<style>") + 7, css = html.slice(start, html.indexOf("</style>", start));
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, (x) => " ".repeat(x.length));
  const out = [];
  for (const rule of cleanCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim().replace(/^@media[^{]*$/, "").trim();
    for (const d of rule[2].matchAll(/([\w-]+)\s*:\s*([^;{}]+)(?=;|$)/g)) {
      const value = d[2].trim();
      const residual = value.replace(/var\(--[\w-]+\)/g, "").replace(/\s|!important/g, "");
      if (!residual) continue;
      const line = html.slice(0, start + rule.index + rule[0].indexOf(d[0], rule[1].length)).split("\n").length;
      if (SCAFFOLD.test(selector)) continue;
      out.push({ raw: true, file: "sign-in.html", line, selector, property: d[1], value, kind: rawKind(value) });
    }
  }
  return out;
}
function rawKind(value) {
  const v = value.replace(/var\(--[\w-]+\)/g, "");
  if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(?:white|black)\b/i.test(v)) return "colour";
  if (/-?\d*\.?\d+(?:px|ch|em|rem|vh|vw|pt)\b/.test(v)) return "size";
  if (/^\s*-?0\s*$/.test(v) || /(^|\s)0(\s|$)/.test(v) && !/[1-9]/.test(v)) return "zero";
  return "keyword";
}

// ---------------------------------------------------------------------------------------------------------------------
// Elements of the built screen: app selector -> id, block, part; and the join to the approved reference file
// ---------------------------------------------------------------------------------------------------------------------
const NOTICE_SRC = { "not-registered": "tm-login-notice", offline: "tm-login-offline-notice", "couldnt-send": "tm-login-send-error-notice",
  "too-many-tries": "tm-login-too-many-notice", inactive: "tm-login-inactive-notice" };
const EL = [
  { id: "screen", sel: ".signin-screen", block: "entry-layout", part: "screen", src: { cls: "login-phone" } },
  { id: "logo", sel: ".login-logo", block: "logo-header", part: "lockup", src: { cls: "login-logo" } },
  { id: "hero", sel: ".login-content", block: "entry-layout", part: "hero", src: { cls: "login-content" } },
  { id: "title", sel: ".login-content > h1", block: "entry-layout", part: "title", src: { tag: "h1" } },
  { id: "subtitle", sel: ".login-content > p", block: "entry-layout", part: "subtitle", src: { tag: "p" } },
  { id: "panel", sel: ".login-fields", block: "entry-layout", part: "panel", src: { cls: "login-fields" } },
  { id: "field", sel: ".login-fields > .tm-field", block: "field", part: "container", src: { cls: "tm-field" } },
  { id: "field-label", sel: ".tm-field__label", block: "field", part: "label", src: { cls: "tm-field__label" } },
  { id: "field-control", sel: ".tm-field__control", block: "field", part: "control", src: { cls: "tm-field__control" } },
  { id: "field-prefix", sel: ".login-prefix", block: "field", part: "prefix", src: { cls: "login-prefix" } },
  { id: "field-input", sel: "#tm-login-mobile", block: "field", part: "input", src: { id: "tm-login-mobile" } },
  { id: "field-helper", sel: "#tm-login-helper", block: "field", part: "helper", src: { id: "tm-login-helper" } },
  { id: "notice", sel: ".login-notice", block: "notice", part: "container", src: { notice: 0 } },
  { id: "notice-icon", sel: ".login-notice > .tm-icon", block: "notice", part: "icon", src: { notice: 1 } },
  { id: "notice-text", sel: ".login-notice > span:not(.tm-icon)", block: "notice", part: "text", src: { notice: 2 } },
  { id: "submit", sel: ".login-submit", block: "button", part: "container", src: { cls: "login-submit" } },
  { id: "submit-spinner", sel: ".login-submit > .tm-spinner", block: "spinner", part: "ring", src: { cls: "tm-spinner" } },
  { id: "submit-label", sel: ".login-submit-label", block: "button", part: "label", src: { cls: "login-submit-label" } },
  { id: "signup", sel: ".login-signup", block: "sign-up-option", part: "container", src: { id: "tm-signup-option" } },
  { id: "signup-link", sel: ".login-signup-label", block: "sign-up-option", part: "link", src: { cls: "login-signup-label" } },
  { id: "keyboard", sel: ".mock-kbd", block: "system-keyboard", part: "keyboard", src: { keyboard: true } },
];
const PART_NAMES = { screen: "screen background", hero: "hero (title area)", title: "title", subtitle: "subtitle", panel: "white panel",
  lockup: "logo lockup", container: "container", label: "label", control: "control (border box)", prefix: "country prefix", input: "text input",
  helper: "helper / error line", icon: "icon", text: "text", ring: "spinner ring", link: "link", keyboard: "keyboard" };
function sourceSelectors(e, state, inv) {
  const vis = inv;   // visibility is the screen's; the join only names the reference node(s)
  let nodes;
  if (e.src.cls) nodes = vis.filter((n) => n.cls.includes(e.src.cls));
  else if (e.src.id) nodes = vis.filter((n) => n.attrs.id === e.src.id);
  else if (e.src.tag) nodes = vis.filter((n) => n.tag === e.src.tag && n.parent?.cls.includes("login-content"));
  else if (e.src.notice !== undefined) {
    const box = vis.find((n) => n.attrs.id === NOTICE_SRC[state]);
    nodes = e.src.notice === 0 ? [box] : [vis.filter((n) => n.parent === box)[e.src.notice - 1]];
  } else if (e.src.keyboard) nodes = vis.filter((n) => n.cls.includes("login-keyboard") || n.cls.includes("login-key"));
  if (!nodes?.length || nodes.some((n) => !n)) die(`no reference node for ${e.id} in ${state}`);
  return nodes.map((n) => n.selector);
}

// ---------------------------------------------------------------------------------------------------------------------
// Cascade: which declaration wins per property (author CSS only; prototype shell styles ignored)
// ---------------------------------------------------------------------------------------------------------------------
const LONG = (() => {
  const sides = ["top", "right", "bottom", "left"];
  const m = { padding: sides.map((s) => `padding-${s}`), margin: sides.map((s) => `margin-${s}`), inset: sides,
    "border-width": sides.map((s) => `border-${s}-width`), "border-style": sides.map((s) => `border-${s}-style`), "border-color": sides.map((s) => `border-${s}-color`),
    "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
    border: sides.flatMap((s) => [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`]),
    background: ["background-color", "background-image"], gap: ["row-gap", "column-gap"], outline: ["outline-color", "outline-style", "outline-width"],
    flex: ["flex-grow", "flex-shrink", "flex-basis"], overflow: ["overflow-x", "overflow-y"],
    "text-decoration": ["text-decoration-line", "text-decoration-color", "text-decoration-style"], font: ["font-family", "font-size", "font-weight", "line-height"] };
  for (const s of sides) m[`border-${s}`] = [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`];
  return m;
})();
const SKIP_PROPS = /^(?:cursor|transition|caret-color|-webkit-|box-sizing|color-scheme|pointer-events|user-select|text-rendering|appearance)/;
const TEXT_PROPS = ["color", "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "text-wrap"];
function cascade(rules, sheetFile, inline) {
  const owners = {};
  const decls = [];
  for (const r of rules) {
    if (r.rule.origin !== "regular") continue;
    const file = sheetFile(r.rule.styleSheetId);
    if (!file) continue;
    for (const p of r.rule.style.cssProperties) {
      if (!p.range || p.disabled || p.parsedOk === false || SKIP_PROPS.test(p.name)) continue;
      decls.push({ property: p.name, value: p.value.replace(/\s*!important\s*$/, ""), important: !!p.important, selector: r.rule.selectorList.text, file, line: p.range.startLine + 1 });
    }
  }
  for (const p of inline?.cssProperties || []) if (p.range && !SKIP_PROPS.test(p.name)) decls.push({ property: p.name, value: p.value, important: !!p.important, selector: "(inline)", file: "inline", line: 0 });
  for (const d of decls) for (const l of LONG[d.property] || [d.property]) {
    const cur = owners[l];
    if (!cur || d.important || !cur.important) owners[l] = d;
  }
  const out = new Map();
  for (const [l, d] of Object.entries(owners)) { if (!out.has(d)) out.set(d, []); out.get(d).push(l); }
  return [...out.entries()].map(([d, ls]) => ({ ...d, appliesTo: (LONG[d.property] && ls.length !== LONG[d.property].length) ? ls : undefined }));
}

// ---------------------------------------------------------------------------------------------------------------------
// Build (browser): capture the built app, read every element's applying rules, crop block pictures
// ---------------------------------------------------------------------------------------------------------------------
async function capture(T) {
  const require = createRequire(path.join(ROOT, "tests/package.json"));
  const { chromium } = require("playwright");
  const APP = path.join(ROOT, "app");
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  const srv = http.createServer((q, r) => {
    const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
    if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || process.env.CHROMIUM || undefined,
    args: ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb", "--hide-scrollbars"] });
  const inv = approvedInventory();
  const result = {};
  const forced = {};
  try {
    for (const state of STATES) {
      const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
      const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
      await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
      const cdp = await pg.context().newCDPSession(pg);
      const sheets = {};
      cdp.on("CSS.styleSheetAdded", ({ header }) => { sheets[header.styleSheetId] = header.sourceURL; });
      await pg.goto(`${base}?capture=1&s=sign-in_${state}&w=390`);
      await pg.evaluate(() => document.fonts && document.fonts.ready);
      await pg.waitForTimeout(400);
      if (errs.length) die(`${state}: page errors ${errs}`);
      await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
      const sheetFile = (id) => {
        const u = sheets[id] || "";
        if (u.endsWith("/design-system/truemeds.css")) return "design-system/truemeds.css";
        if (u.endsWith("/screens/sign-in.css")) return "app/screens/sign-in.css";
        return null;   // prototype shell / review / keyboard drawing: not app UI
      };
      // tag elements; every visible node inside the screen must be claimed by one element (or sit inside the keyboard / an icon)
      const tagged = await pg.evaluate((EL) => {
        const root = document.querySelector(".signin-screen");
        const seen = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !el.closest("[hidden]"); };
        const out = [], claimed = new Set(), problems = [];
        for (const e of EL) {
          const els = [...root.parentElement.querySelectorAll(e.sel)].filter((x) => (x === root || root.contains(x)) && seen(x));
          if (els.length > 1) problems.push(`${e.id}: ${els.length} visible`);
          if (!els.length) continue;
          const el = els[0]; el.dataset.kit = e.id; claimed.add(el);
          const r = el.getBoundingClientRect();
          const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
          const attrs = {}; for (const a of el.attributes) if (/^(?:aria-|role$|type$|inputmode$|autocomplete$|placeholder$|alt$|for$|href$|target$|disabled$|readonly$)/.test(a.name)) attrs[a.name] = a.value;
          if (el.tagName === "INPUT") { attrs.value = el.value; if (el.readOnly) attrs.readonly = ""; }
          if (el.tagName === "BUTTON" && el.disabled) attrs.disabled = "";
          const cs = getComputedStyle(el);
          out.push({ id: e.id, tag: el.tagName.toLowerCase(), classes: [...el.classList], rect: { x: r.x, y: r.y, w: r.width, h: r.height }, text: own, attrs,
            focused: document.activeElement === el, display: cs.display, flexDirection: cs.flexDirection,
            parent: el.parentElement?.dataset.kit || null,
            icon: el.dataset.icon || null, iconSize: el.classList.contains("tm-icon") ? [r.width, r.height] : null,
            computed: Object.fromEntries(["color", "background-color", "border-top-color", "border-top-width", "border-top-left-radius", "font-family", "font-size", "line-height", "font-weight",
              "padding-top", "padding-right", "padding-bottom", "padding-left", "margin-top", "margin-bottom", "row-gap", "column-gap", "width", "height", "min-height",
              "box-shadow", "outline-color", "outline-width", "outline-offset", "visibility", "text-align"].map((p) => [p, cs.getPropertyValue(p)])) });
        }
        for (const el of root.querySelectorAll("*")) {
          if (!seen(el) || claimed.has(el)) continue;
          if (el.closest(".mock-kbd") || el.closest(".tm-icon") || el.closest("svg")) continue;
          problems.push(`unclaimed <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}">`);
        }
        return { out, problems };
      }, EL.map(({ id, sel }) => ({ id, sel })));
      if (tagged.problems.length) die(`${state}: ${tagged.problems.join("; ")}`);
      const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
      const elements = [];
      for (const t of tagged.out) {
        const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-kit="${t.id}"]` });
        let styles = [];
        if (t.id !== "keyboard") {
          const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
          styles = cascade(m.matchedCSSRules, sheetFile, m.inlineStyle);
          // inherited text styles for elements that show text or an icon
          if (t.text || t.tag === "input" || t.icon || t.tag === "img") {
            for (const prop of TEXT_PROPS) {
              if (styles.some((s) => s.property === prop || (LONG[s.property] || []).includes(prop))) continue;
              for (const [i, inh] of (m.inherited || []).entries()) {
                const hit = cascade(inh.matchedCSSRules, sheetFile).find((s) => s.property === prop || (s.property === "font" && prop !== "color"));
                if (hit) { styles.push({ ...hit, property: prop, inherited: true, inheritedDepth: i + 1 }); break; }
              }
            }
          }
          // pressed / focus for the button and link (forced pseudo-states; no approved picture exists for these)
          if (state === "default" && (t.id === "submit" || t.id === "signup-link")) {
            for (const [name, pseudo] of [["pressed", ["active"]], ["focus", ["focus", "focus-visible"]]]) {
              await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: pseudo });
              const f = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
              (forced[t.id] ??= {})[name] = cascade(f.matchedCSSRules, sheetFile, f.inlineStyle);
              await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
            }
          }
        }
        let ax = null;
        try { const a = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false }); const n = a.nodes.find((x) => !x.ignored) || a.nodes[0]; ax = { role: n?.role?.value, name: n?.name?.value || "" }; } catch { /* no AX node */ }
        elements.push({ ...t, styles, ax, sourceSelectors: sourceSelectors(EL.find((e) => e.id === t.id), state, inv) });
      }
      fs.mkdirSync(path.join(T, "viewer/shots"), { recursive: true });
      await pg.screenshot({ path: path.join(T, `viewer/shots/built-390_sign-in_${state}.png`) });
      result[state] = elements;
      await pg.close();
    }
    // crops for block specs, cut from the approved 390 pictures at the measured element boxes
    const crops = [];
    for (const c of BLOCK_CROPS) {
      const el = result[c.state].find((e) => e.id === c.el);
      if (!el) die(`crop: ${c.el} not in ${c.state}`);
      const pad = c.pad ?? 8;
      const box = { x: Math.max(0, el.rect.x - pad), y: Math.max(0, el.rect.y - pad), w: Math.min(390, el.rect.w + 2 * pad), h: el.rect.h + 2 * pad };
      const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
      const png = fs.readFileSync(PICTURE(c.state, 390)).toString("base64");
      await pg.setContent(`<body style="margin:0"><img style="display:block;width:390px" src="data:image/png;base64,${png}"></body>`);
      await pg.waitForFunction(() => document.images[0].complete);
      const file = `components/pictures/${c.block}_${c.name}.png`;
      fs.mkdirSync(path.join(T, "components/pictures"), { recursive: true });
      await pg.screenshot({ path: path.join(T, file), clip: { x: box.x, y: box.y, width: Math.min(box.w, 390 - box.x), height: box.h } });
      crops.push({ ...c, file });
      await pg.close();
    }
    return { result, forced, crops };
  } finally { await browser.close(); srv.close(); }
}
// which approved picture shows each block state (cropped, not re-rendered)
const BLOCK_CROPS = [
  { block: "button", name: "default", state: "default", el: "submit" },
  { block: "button", name: "busy", state: "sending", el: "submit" },
  { block: "button", name: "disabled", state: "too-many-tries", el: "submit" },
  { block: "button", name: "inactive-account", state: "inactive", el: "submit" },
  { block: "field", name: "default", state: "default", el: "field" },
  { block: "field", name: "focus", state: "keyboard-open", el: "field" },
  { block: "field", name: "error", state: "too-short", el: "field" },
  { block: "field", name: "read-only-busy", state: "sending", el: "field" },
  { block: "notice", name: "neutral", state: "not-registered", el: "notice" },
  { block: "notice", name: "warning", state: "offline", el: "notice" },
  { block: "notice", name: "error", state: "couldnt-send", el: "notice" },
  { block: "spinner", name: "busy", state: "sending", el: "submit-spinner", pad: 6 },
  { block: "logo-header", name: "default", state: "default", el: "logo" },
  { block: "sign-up-option", name: "default", state: "default", el: "signup", pad: 0 },
  { block: "entry-layout", name: "default", state: "default", el: "screen", pad: 0 },
];

// ---------------------------------------------------------------------------------------------------------------------
// Element -> kit record
// ---------------------------------------------------------------------------------------------------------------------
function blockState(el, all) {
  const c = el.classes, a = el.attrs;
  if (el.id === "submit" || el.id === "submit-label") {
    const b = el.id === "submit" ? el : all.find((x) => x.id === "submit");
    if (b.classes.includes("tm-btn--busy")) return "busy";
    if ("disabled" in b.attrs) return "disabled";
    return "default";
  }
  if (el.block === "field") {
    const field = all.find((x) => x.id === "field"), input = all.find((x) => x.id === "field-input");
    if (field.classes.includes("tm-field--error")) return "error";
    if ("readonly" in input.attrs) return "read-only (busy)";
    const screen = all.find((x) => x.id === "screen");
    if (screen.classes.includes("is-focused") || input.focused) return "focus";
    return "default";
  }
  if (el.block === "notice") { const n = all.find((x) => x.id === "notice"); return (n.classes.find((k) => k.startsWith("tm-notice--")) || "").replace("tm-notice--", ""); }
  return "default";
}
function variantOf(el, all) {
  if (el.block === "button") { const b = all.find((x) => x.id === "submit"); return ["primary", "lg", "block"].filter((v) => b.classes.includes(`tm-btn--${v}`)).join(" · "); }
  if (el.block === "notice") return blockState(el, all);
  return "default";
}
function styleRecord(s, T) {
  const tokens = [...s.value.matchAll(/var\((--[\w-]+)/g)].map((x) => {
    const r = T.resolve(x[1]);
    if (!r) return { web: x[1], native: null, unmapped: true };
    return { web: x[1], native: r.native, ts: r.ts, value: r.value, ...(r.via.length ? { via: r.via } : {}), ...(r.palette ? { palette: true } : {}) };
  });
  const residual = s.value.replace(/var\(--[\w-]+(?:,[^)]*)?\)/g, "").replace(/calc\(|\)|\*|\s|!important/g, "").replace(/^-1$/, "");
  const rec = { property: s.property, value: s.value, tokens, from: { selector: s.selector, file: s.file, line: s.line } };
  if (s.appliesTo) rec.appliesTo = s.appliesTo;
  if (s.inherited) rec.inherited = true;
  if (residual && residual !== "-1") { rec.raw = true; rec.kind = rawKind(s.value); rec.file = s.file; rec.line = s.line; }
  if (tokens.some((t) => t.unmapped || t.palette)) rec.raw = true;
  return rec;
}
function spacingOf(el, all, recs) {
  const byId = Object.fromEntries(all.map((e) => [e.id, e]));
  const sibs = all.filter((e) => e.parent === el.parent && e.id !== el.id && e.rect.y + e.rect.h <= el.rect.y + 0.5 && e.id !== "keyboard");
  const prev = sibs.sort((a, b) => (b.rect.y + b.rect.h) - (a.rect.y + a.rect.h))[0];
  const pick = (id, props) => (recs[id] || []).filter((r) => props.some((p) => r.property === p || (r.appliesTo || LONG[r.property] || []).includes(p))).map((r) => ({ element: id, property: r.property, value: r.value, tokens: r.tokens.map((t) => t.native).filter(Boolean), ...(r.raw ? { raw: true } : {}) }));
  const out = {};
  if (prev) out.above = { neighbour: prev.id, px: Math.round((el.rect.y - (prev.rect.y + prev.rect.h)) * 10) / 10,
    setBy: [...pick(el.id, ["margin-top"]), ...pick(prev.id, ["margin-bottom"]), ...(el.parent ? pick(el.parent, ["row-gap"]).filter(() => /flex|grid/.test(byId[el.parent]?.display || "")) : [])] };
  else if (el.parent) out.above = { neighbour: `${el.parent} (top edge)`, px: Math.round((el.rect.y - byId[el.parent].rect.y) * 10) / 10, setBy: [...pick(el.parent, ["padding-top"]), ...pick(el.id, ["margin-top"])] };
  const inside = pick(el.id, ["padding-top", "padding-right", "padding-bottom", "padding-left", "row-gap", "column-gap"]);
  if (inside.length) out.inside = inside;
  return out;
}
const ROLE_RULES = { button: "48px minimum tap target (RULES 8.6); one primary per screen (RULES 2.6)", "sign-up-option": "Link inside a sentence: WCAG 2.5.8 inline exception (RULES 8.6)" };
function accessibility(el) {
  const a = { role: el.ax?.role || null, name: el.ax?.name || "", size: `${Math.round(el.rect.w)}×${Math.round(el.rect.h)}` };
  for (const k of ["role", "aria-describedby", "aria-invalid", "aria-busy", "aria-disabled", "aria-hidden", "aria-labelledby", "alt", "type", "inputmode", "autocomplete"]) if (el.attrs[k] !== undefined) a[k === "role" ? "roleAttribute" : k] = el.attrs[k];
  const interactive = ["submit", "field-control", "signup-link"].includes(el.id);
  if (interactive) { a.target = Math.round(el.rect.h) >= 48 ? "meets 48" : `below 48 (${Math.round(el.rect.h)})`; }
  if (ROLE_RULES[el.block] && interactive) a.rule = ROLE_RULES[el.block];
  if (el.id === "keyboard") a.note = "The phone's own number keyboard (not drawn by the app).";
  return a;
}

// ---------------------------------------------------------------------------------------------------------------------
// DECIDED / OPEN: an engineer's questions, answered only by quoting the sources
// ---------------------------------------------------------------------------------------------------------------------
const AL = (re) => ({ src: "App logic §2", text: clean(lineOf("appLogic", re, "## 2. Sign-in")) });
const AL1 = (re) => ({ src: "App logic §1", text: clean(lineOf("appLogic", re, "## 1. The app")) });
const AL10 = (re) => ({ src: "App logic §10", text: clean(lineOf("appLogic", re, "## 10. Errors")) });
const DEC = (d, re) => ({ src: d, text: clean(lineOf("decisions", re, `### ${d} ·`)) });
const RUL = (sec, re) => ({ src: `Design rules ${sec}`, text: clean(lineOf("rules", re)) });
const OQ = (q, re) => ({ src: q, text: clean(lineOf("oqs", re, `### ${q}`)) });
const FM = (key) => {
  const row = lineOf("fmap", new RegExp(`^\\| ${key.replace(".", "\\.")} \\|`), "## Sign-in");
  const cells = row.split("|").map((x) => x.trim()).filter(Boolean);
  return { src: `Feedback state map: ${key}`, text: clean(`${cells[0]}: ${cells[1]} — ${cells[2]}`) };
};
const CODE = (label, file, re, lead = "") => {   // facts read from the sign-in build itself: the matched part, quoted as code
  const text = read(file); const line = text.split("\n").find((l) => re.test(l));
  if (!line) die(`${rel(file)}: no line matches ${re}`);
  quote(file === FILES.signInJs || file === FILES.signInCss ? "screen" : "auth", line);
  const comment = line.match(/\/\/\s*(.*)$/);
  const shown = comment && !lead ? clean(comment[1]) : "`" + line.match(re)[0].trim() + "`";
  return { src: label, text: (lead ? lead + " " : "") + shown };
};
function noticeTable() {
  const js = read(FILES.signInJs);
  const block = js.slice(js.indexOf("const NOTICES = {"), js.indexOf("};", js.indexOf("const NOTICES = {")));
  return [...block.matchAll(/"?([\w-]+)"?:\s*\{ cls: "tm-notice--(\w+)", icon: "([\w-]+)", key: "([\w.]+)", role: "(\w+)" \}/g)]
    .map((x) => ({ answer: x[1], tone: x[2], icon: x[3], copyKey: x[4], role: x[5] }));
}
function weightsUsed(T) {
  const css = read(FILES.signInCss) + read(FILES.dsCss);
  const used = [...new Set([...css.matchAll(/var\((--tm-font-weight-[a-z]+)\)/g)].map((x) => x[1]))].filter((w) => /semibold|regular/.test(w) || read(FILES.signInCss).includes(w));
  return [...new Set([...read(FILES.signInCss).matchAll(/var\((--tm-font-weight-[a-z]+)\)/g)].map((x) => x[1]).concat("--tm-font-weight-regular"))]
    .map((w) => `${T.resolve(w).native} = ${T.resolve(w).value}`).join(", ");
}
function decided(T) {
  const notices = noticeTable();
  return [
    { id: "d01", topic: "Input and paste", q: "What does the mobile field accept, and how are typed or pasted numbers cleaned?", a: [AL(/Typing and pasting are cleaned/), DEC("D-39", /Impossible input is blocked silently/), DEC("D-39", /\*\*Leading 0\*\*/), CODE("Sign-in build", DOCS.auth, /return d\.slice\(0, MOBILE_LENGTH\);/, "At most 10 digits are kept:")], refs: ["D-33", "D-39"] },
    { id: "d02", topic: "Validation", q: "Which checks run, in what order, and when does each error appear?", a: [AL(/Checks, most basic first/), DEC("D-39", /format errors follow one pattern/)], refs: ["D-39"] },
    { id: "d03", topic: "Validation", q: "When does an error clear?", a: [DEC("D-39", /format errors follow one pattern/), { src: "Message rules", text: ["signin.empty", "signin.short", "signin.prefix"].map((k) => `${k}: clears on ${metadata[k].clear}; keeps the ${metadata[k].retain}`).join(" · ") }], refs: ["D-39"] },
    { id: "d04", topic: "Errors", q: "Where do errors show, and what does the field look like in error?", a: [DEC("D-33", /\*\*Errors:\*\*/), RUL("9.5", /^\| \*\*Field error\*\*/), RUL("L4", /^\| L4 \|/), RUL("L7", /^\| L7 \|/)], refs: ["D-33", "D-46", "D-47"] },
    { id: "d05", topic: "Server answers", q: "What can the server answer after Send OTP, and how is each answer shown?", a: [AL(/After sending, server results show as a notice/), { src: "Sign-in screen", text: notices.map((n) => `${n.answer}: ${n.tone} notice, icon \`${n.icon}\`, copy \`${n.copyKey}\`, role="${n.role}"`).join(" · ") }, RUL("9.5", /^\| \*\*Notice\*\*/)], refs: ["D-33", "D-54"] },
    { id: "d06", topic: "Server answers", q: "Does a server answer stay when the doctor edits the number?", a: [{ src: "Message rules", text: notices.map((n) => `${n.copyKey}: clears on ${metadata[n.copyKey].clear}`).join(" · ") }, CODE("Sign-in screen", FILES.signInJs, /a server answer belongs to the number it was for/)], refs: ["D-33"] },
    { id: "d07", topic: "Sending", q: "What happens to the button and the field while the code is being sent?", a: [RUL("L2", /^\| L2 \|/), RUL("9.1", /^- \*\*States:\*\*/), FM("signin.sending")], refs: ["D-46", "D-54"] },
    { id: "d08", topic: "Limits", q: "Too many attempts: what does the button show, and how long is the wait?", a: [AL(/After sending, server results show as a notice/), DEC("D-35", /Keep wait time server-driven/), DEC("D-46", /Timer format is m:ss/), FM("signin.too-many-tries")], refs: ["D-35", "D-46"] },
    { id: "d09", topic: "Limits", q: "Which limits are enforced on the server and which in the app?", a: [AL(/All OTP limits are enforced by the server/), DEC("D-35", /OTP issue cap is configurable/), DEC("D-34", /5 server-confirmed wrong OTP submissions/)], refs: ["D-34", "D-35"] },
    { id: "d10", topic: "Limits", q: "What happens when the doctor signs in with a number that is locked?", a: [AL(/Sign-in on a locked number/), FM("signin.locked-number")], refs: ["D-81"] },
    { id: "d11", topic: "Inactive account", q: "The account is inactive: what does the doctor see and what does the button do?", a: [AL(/After sending, server results show as a notice/), FM("signin.inactive"), OQ("OQ-021", /^\*\*Answered 2026-10-12/)], refs: ["D-33"] },
    { id: "d12", topic: "Sign-up", q: "Where does \"Sign up\" go, and what happens for a number that isn't registered?", a: [DEC("D-33", /^- \*\*Not registered:\*\*/), { src: "Message rules", text: `signin.signupLink: ${metadata["signin.signupLink"].next}` }, OQ("OQ-021", /^\*\*Answered 2026-10-12/)], refs: ["D-33"] },
    { id: "d13", topic: "Keyboard", q: "Does the keyboard open by itself on Sign-in, and where is Send OTP when it is open?", a: [DEC("D-43", /^- \*\*Rejected:\*\*/), DEC("D-43", /\*\*Button placement:\*\*/), RUL("8.9", /^9\. \*\*Keyboard clearance:\*\*/)], refs: ["D-43", "D-46"] },
    { id: "d14", topic: "Keyboard", q: "Which keyboard type and autofill hint does the field use?", a: [CODE("Sign-in build", FILES.signInJs, /type: "tel", inputmode: "tel", autocomplete: "tel-national"/, "The field is a phone-number field with national-number autofill:")], refs: [] },
    { id: "d15", topic: "Keyboard", q: "What happens to the keyboard and the sign-up line when a server answer arrives or the keyboard is open?", a: [DEC("D-33", /^- \*\*Not registered:\*\*/), CODE("Sign-in build", FILES.signInCss, /\[data-keyboard="true"\] \.login-signup \{ visibility: hidden; \}/, "While the keyboard is open, the sign-up line is hidden (its space is kept):"), CODE("Sign-in build", FILES.signInJs, /input\.blur\(\);/, "On every server answer that stays on Sign-in, the keyboard closes:")], refs: ["D-33"] },
    { id: "d16", topic: "Offline", q: "What happens when the doctor taps Send OTP while offline?", a: [FM("signin.offline"), { src: "Message rules", text: `signin.offline: ${metadata["signin.offline"].trigger}; next: ${metadata["signin.offline"].next}; clears on ${metadata["signin.offline"].clear}; keeps the ${metadata["signin.offline"].retain}` }], refs: ["D-65", "D-66"] },
    { id: "d17", topic: "Copy", q: "Where does every word on the screen come from? Can I change copy?", a: [{ src: "App logic", text: clean(lineOf("appLogic", /^All on-screen text comes from/)) }, DEC("D-47", /\*\*Titles never end with a full stop\*\*/), DEC("D-65", /A message says what happened/)], refs: ["D-47", "D-53", "D-65"] },
    { id: "d18", topic: "Copy", q: "Is it \"case\" or \"order\"?", a: [DEC("D-48", /\*\*Wording: "case", never "order",\*\*/)], refs: ["D-48"] },
    { id: "d19", topic: "Layout", q: "What are the logo size and the spacing at the top of the screen?", a: [RUL("8.13", /^13\. \*\*Logo lockup size and place/), RUL("L6", /^\| L6 \|/), RUL("8.2", /^2\. \*\*Side margin:\*\*/), RUL("8.3", /^3\. \*\*Three gaps only:\*\*/)], refs: ["D-46", "D-61", "D-67"] },
    { id: "d20", topic: "Layout", q: "Which type sizes does the screen use?", a: [RUL("8.1", /^\s+\| L1 \| Screen title/), RUL("8.1", /^\s+\| L2 \| Key content/), RUL("8.1", /^\s+\| L3 \| Supporting text/), RUL("L4", /^\| L4 \|/), RUL("L5", /^\| L5 \|/)], refs: ["D-43", "D-46"] },
    { id: "d21", topic: "Accessibility", q: "What are the accessibility rules (targets, contrast, focus, names)?", a: [RUL("8.6", /^6\. \*\*Tap targets:\*\*/), RUL("8.7", /^7\. \*\*Contrast:\*\*/), RUL("9.8", /^- \*\*Visible focus ring\*\*/), CODE("Sign-in build", FILES.signInJs, /if \(m\.error\) helper\.setAttribute\("role", "alert"\)/, "A field error is announced (role alert); notices use the roles listed in d05:")], refs: ["D-54"] },
    { id: "d22", topic: "Fonts", q: "Which font, which weights?", a: [RUL("2.3", /^3\. \*\*One font:\*\*/), { src: "Tokens", text: `tokens.font.family is "${T.m.vars["--tm-font-family-plus-jakarta-sans"].value}". Weights this screen uses: ${weightsUsed(T)}. Font files and setup: foundation/fonts/FONTS.md.` }], refs: [] },
    { id: "d23", topic: "Tokens", q: "Can I use a hex colour, a palette colour or a pixel value that matches a token?", a: [RUL("2.1", /^1\. \*\*No raw values\.\*\*/), RUL("2.2", /^2\. \*\*Semantic tokens only\.\*\*/)], refs: [] },
    { id: "d24", topic: "Buttons", q: "How many primary buttons, and what do the button labels look like?", a: [RUL("2.6", /^6\. \*\*One primary button per context\.\*\*/), RUL("9.1", /^- \*\*Labels:\*\*/), RUL("9.1", /^- \*\*One height per group\*\*/)], refs: ["D-54"] },
    { id: "d25", topic: "Journey", q: "Where does Sign-in sit in the app, and where does it go next?", a: [AL1(/^\| Sign-in \|/), AL1(/^Order on first use/)], refs: ["D-48"] },
    { id: "d26", topic: "Notices", q: "How do notices wrap and where do they sit?", a: [AL10(/\*\*Notices\*\* wrap balanced/), RUL("9.5", /^\| \*\*Notice\*\*/)], refs: ["D-86"] },
  ];
}
// [MOCK ASSUMPTION]s in the sign-in build: each must be mapped here (unmapped -> build fails)
const MOCKS = [
  { file: "auth", re: /\[MOCK ASSUMPTION\] app-logic §2 is silent on what the server answers here/, id: "o03" },
  { file: "settings", re: /tooManyTriesWait:.*MOCK ASSUMPTION/, id: "o02" },
  { file: "settings", re: /otpWindow:.*MOCK ASSUMPTION/, id: "o02" },
  { file: "settings", re: /otpLock:.*MOCK ASSUMPTION/, id: "o02" },
  { file: "settings", re: /resendWaits:.*MOCK ASSUMPTION/, id: "o02" },
  { file: "keyboard", re: /\[MOCK ASSUMPTION\]/, id: "o09" },
];
function open() {
  for (const m of MOCKS) lineOf(m.file, m.re);
  const signInSettings = doc("settings").split("\n").filter((l) => /MOCK ASSUMPTION/.test(l) && /OQ-017/.test(l));
  return [
    { id: "o01", topic: "Limits", q: "How long are the OTP issue window, the number lock and the code life in production?", now: OQ("OQ-017", /^\*\*Safe placeholder:\*\*/), who: "Backend + Product", refs: ["OQ-017", "D-34", "D-35"] },
    { id: "o02", topic: "Limits", q: "How long is the \"Try again in m:ss\" wait after too many attempts?", now: { src: "Sign-in build", text: `The server sends the time the wait ends; the prototype uses ${signInSettings.map((l) => l.trim().split(":")[0]).join(", ")} as stand-ins (mock values, not product promises).` }, who: "Backend", refs: ["OQ-017", "D-35"] },
    { id: "o03", topic: "Server answers", q: "Send OTP again for the same number while the resend wait is still running: what does the server answer?", now: { src: "Sign-in build", text: "Assumed: no new code is sent; OTP opens on the running wait and the code already sent stays valid." }, who: "Backend", refs: [] },
    { id: "o04", topic: "Validation", q: "More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message?", now: DEC("D-39", /^- \*\*For review:\*\*/), who: "Product", refs: ["D-39"], noteNow: "Current build: extra digits are cut silently (no message); see d01." },
    { id: "o05", topic: "Offline", q: "Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)?", now: FM("signin.offline"), who: "Product", refs: ["D-65"], noteNow: "Current build: the offline notice appears only after Send OTP." },
    { id: "o06", topic: "Countdown", q: "When the \"Try again in m:ss\" countdown ends, does the notice stay until the number changes, or go away?", now: CODE("Sign-in build", FILES.signInJs, /if \(clock\.now\(\) >= m\.until\) \{ m\.button = "default"; m\.notice = null; \}/, "Current build: when the wait ends the button returns to Send OTP and the notice goes away:"), who: "Product", refs: [] },
    { id: "o07", topic: "Safe areas", q: "Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)?", now: RUL("8.13", /^13\. \*\*Logo lockup size and place/), who: "Product", refs: ["D-61"], noteNow: "The web build measures 16 from the top of the screen area (a browser has no status bar). No rule names the safe area for this screen." },
    { id: "o08", topic: "Navigation", q: "Android back gesture on Sign-in (the first screen): leave the app, or stay?", now: CODE("Sign-in build", FILES.signInJs, /setScreenBack\(null\);.*$/), who: "Product", refs: [] },
    { id: "o09", topic: "Keyboard", q: "The prototype draws a number keyboard in its pictures. Do we draw one?", now: { src: "Sign-in build", text: "No: the pictures show the phone's own number keyboard; the app uses the system keyboard (type tel)." }, who: "— (prototype only; no action)", refs: [] },
    { id: "o10", topic: "Edit after return", q: "Coming back from OTP (Change): is the number kept, and does the first typed digit replace it?", now: CODE("Sign-in build", FILES.signInJs, /A pasted or pre-filled number .* is replaced by the first typed digit/), who: "Product", refs: [] },
    { id: "o11", topic: "Links", q: "Terms, Privacy and support links: final URLs, and where are they configured?", now: OQ("OQ-021", /^\*\*Safe placeholder:\*\*/), who: "Product + Ops", refs: ["OQ-021"] },
    { id: "o13", topic: "Tokens", q: "The busy spinner's ring is drawn in a raw white (#fff) in the design system. Which token?", now: RUL("L2", /^\| L2 \|/), who: "Design", refs: ["D-46"], noteNow: "Assumption [RECOMMENDED]: tokens.color.content.inverse, the token the busy button's label uses (white). The ring's open quarter is transparent." },
    { id: "o12", topic: "Session", q: "How long does a signed-in session last before OTP is asked again?", now: OQ("OQ-017", /^\*\*Confirmed 2026-10-12:\*\*/), who: "Backend + Product", refs: ["OQ-017"] },
  ];
}
const APPLOGIC_MUST = [/Typing and pasting are cleaned/, /Checks, most basic first/, /After sending, server results show/, /Sign-in on a locked number/, /All OTP limits are enforced/, /^\| Sign-in \|/, /^Order on first use/, /\*\*Notices\*\* wrap balanced/];

function md(items, kind) {
  const L = [];
  if (kind === "decided") {
    L.push("# DECIDED — Sign-in", "", "Questions already answered. **Check here before asking.** Each answer quotes its source; `D-xx` is a product decision number.", "Generated from the product rules — do not edit by hand.", "");
    const topics = [...new Set(items.map((i) => i.topic))];
    L.push("| # | Topic | Question |", "|---|---|---|", ...items.map((i) => `| [${i.id}](#${i.id}) | ${i.topic} | ${i.q} |`), "");
    for (const t of topics) {
      L.push(`## ${t}`, "");
      for (const i of items.filter((x) => x.topic === t)) {
        L.push(`<a id="${i.id}"></a>`, `### ${i.id} · ${i.q}`, "");
        for (const a of i.a) L.push(`- ${a.text} — *${a.src}*`);
        if (i.refs.length) L.push("", `Decisions: ${i.refs.join(", ")}`);
        L.push("");
      }
    }
  } else {
    L.push("# OPEN — Sign-in", "", "Still open. Build with the **current assumption**, keep it easy to change, and ask the named owner. If your question is in neither DECIDED.md nor here, it is genuinely new: ask it.", "Generated from the product rules — do not edit by hand.", "");
    L.push("| # | Question | Who answers |", "|---|---|---|", ...items.map((i) => `| [${i.id}](#${i.id}) | ${i.q} | ${i.who} |`), "");
    for (const i of items) {
      L.push(`<a id="${i.id}"></a>`, `### ${i.id} · ${i.q}`, "", `- **Current assumption:** ${i.noteNow ? i.noteNow + " " : ""}${i.now.text} — *${i.now.src}*`, `- **Who answers:** ${i.who}`);
      if (i.refs.length) L.push(`- **References:** ${i.refs.join(", ")}`);
      L.push("");
    }
  }
  return L.join("\n");
}

// ---------------------------------------------------------------------------------------------------------------------
// Block specs
// ---------------------------------------------------------------------------------------------------------------------
const BLOCKS = {
  button: { rn: "<Button variant=\"primary\" size=\"lg\" block busy={…} disabled={…}>", web: ".tm-btn.tm-btn--primary.tm-btn--lg.tm-btn--block", name: "Button",
    rules: [["2.6", /^6\. \*\*One primary button per context\.\*\*/], ["9.1", /^\| \*\*Primary\*\*/], ["9.1", /^- \*\*One height per group\*\*/], ["9.1", /^- \*\*Labels:\*\*/], ["9.1", /^- \*\*States:\*\*/], ["L2", /^\| L2 \|/], ["8.6", /^6\. \*\*Tap targets:\*\*/], ["9.1", /^- \*\*Button icon size steps/]] },
  field: { rn: "<Field label=… prefix=\"+91\" helper=… error=… />", web: ".tm-field", name: "Field",
    rules: [["8.3", /^3\. \*\*Three gaps only:\*\*/], ["L4", /^\| L4 \|/], ["L7", /^\| L7 \|/], ["9.5", /^\| \*\*Field error\*\*/], ["9.8", /^- \*\*Visible focus ring\*\*/]] },
  notice: { rn: "<Notice tone=\"neutral\" | \"warning\" | \"error\" icon=… />", web: ".tm-notice.tm-notice--{tone}", name: "Notice",
    rules: [["9.5", /^\| \*\*Notice\*\*/], ["L5", /^\| L5 \|/], ["9.5", /^\| \*\*Rule\*\*/]] },
  spinner: { rn: "<Spinner /> (inside a busy Button)", web: ".tm-btn--busy .tm-spinner", name: "Spinner",
    rules: [["L2", /^\| L2 \|/], ["8.8", /^8\. \*\*Loading primary:\*\*/]] },
  "logo-header": { rn: "<LogoHeader />", web: ".login-logo (home-base header)", name: "LogoHeader",
    rules: [["8.5", /^\s*- \*\*Home-base header:\*\*/], ["8.13", /^13\. \*\*Logo lockup size and place/], ["L6", /^\| L6 \|/], ["2.8", /^8\. \*\*Logo: LOCKED\./]] },
  "sign-up-option": { rn: "<SignUpOption />", web: ".login-signup", name: "SignUpOption",
    rules: [["8.7", /^7\. \*\*Contrast:\*\*/], ["8.6", /^6\. \*\*Tap targets:\*\*/]] },
  "entry-layout": { rn: "<EntryLayout title=… subtitle=…>{panel}</EntryLayout>", web: ".signin-screen (blue top + white panel)", name: "EntryLayout",
    rules: [["8.2", /^2\. \*\*Side margin:\*\*/], ["8.3", /^3\. \*\*Three gaps only:\*\*/], ["8.4", /^\s*- \*\*Screens with text entry:\*\*/], ["8.10", /^10\. \*\*Titles:\*\*/], ["L8", /^\| L8 \|/]] },
};

// ---------------------------------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------------------------------
function assemble(cap, T) {
  const inv = approvedInventory();
  const states = [];
  const usedTokens = new Map();   // native -> {web,value,states:Set,elements:Set}
  const rawAll = [];
  const blockSpec = {};
  for (const state of STATES) {
    const els = cap.result[state].map((e) => ({ ...e, block: EL.find((x) => x.id === e.id).block, part: EL.find((x) => x.id === e.id).part }));
    const recs = {};
    for (const e of els) recs[e.id] = e.styles.map((s) => styleRecord(s, T));
    const elements = els.map((e) => {
      const r = recs[e.id];
      const tokens = {};
      for (const s of r) for (const t of s.tokens) if (t.native) {
        (tokens[s.property] ??= []).push(t.native);
        const u = usedTokens.get(t.native) || { native: t.native, ts: t.ts, web: new Set(), value: t.value, states: new Set(), elements: new Set() };
        u.web.add(t.web); u.states.add(state); u.elements.add(e.id); usedTokens.set(t.native, u);
      }
      for (const s of r) if (s.raw) rawAll.push({ state, element: e.id, ...s });
      // copy
      const copies = [];
      if (e.text) { const c = copyFor(e.text); copies.push({ slot: "text", ...c }); }
      if (e.attrs.placeholder) copies.push({ slot: "placeholder", ...copyFor(e.attrs.placeholder) });
      if (e.attrs.alt) copies.push({ slot: "alt", ...copyFor(e.attrs.alt) });
      if (e.tag === "input" && e.attrs.value) copies.push({ slot: "value", data: e.attrs.value, note: "What the doctor typed (sample number), not copy." });
      const rec = {
        id: e.id, block: e.block, part: e.part, variant: variantOf(e, els), blockState: blockState(e, els),
        rn: BLOCKS[e.block] ? `${BLOCKS[e.block].name} [RECOMMENDED]` : null,
        sourceSelector: cap.result[state].find((x) => x.id === e.id).sourceSelectors[0],
        sourceSelectors: cap.result[state].find((x) => x.id === e.id).sourceSelectors,
        appSelector: EL.find((x) => x.id === e.id).sel,
        box: { x: Math.round(e.rect.x * 10) / 10, y: Math.round(e.rect.y * 10) / 10, w: Math.round(e.rect.w * 10) / 10, h: Math.round(e.rect.h * 10) / 10 },
        tokens, styles: r, spacing: spacingOf(e, els, recs),
        copy: copies, ...(copies.find((c) => c.copyKey && c.slot === "text") ? { copyKey: copies.find((c) => c.copyKey && c.slot === "text").copyKey } : {}),
        ...(copies.filter((c) => c.copyKey).length ? { copyKeys: copies.filter((c) => c.copyKey).map((c) => c.copyKey) } : {}),
        ...(e.icon ? { icon: { name: e.icon, size: e.iconSize, iconTs: `icons['${e.icon}']` } } : {}),
        behaviour: behaviourFor(e, state),
        accessibility: accessibility(e),
      };
      for (const c of copies) if (c.literal) rawAll.push({ state, element: e.id, raw: true, kind: "copy", property: c.slot, value: c.literal, file: "app/screens/sign-in.js", line: lineNo(FILES.signInJs, c.literal) });
      return rec;
    });
    const fmapKey = `signin.${state}`;
    const fm = FM(fmapKey);
    states.push({
      id: `sign-in_${state}`, name: STATE_NAMES[state],
      pictures: { w360: `screens/pictures/sign-in_${state}_w360.png`, w390: `screens/pictures/sign-in_${state}_w390.png`, built390: `viewer/shots/built-390_sign-in_${state}.png` },
      rule: { feedbackMap: `feedback-state-map: ${fmapKey}`, pattern: fm.text, appLogic: STATE_RULE[state] ? `app-logic §2: ${clean(lineOf("appLogic", STATE_RULE[state], "## 2. Sign-in"))}` : "app-logic §2 (screen at rest)",
        decided: STATE_DECIDED[state] },
      elements,
      tokensUsed: [...new Set(elements.flatMap((x) => Object.values(x.tokens).flat()))].sort(),
    });
    for (const e of elements) {
      if (!BLOCKS[e.block]) continue;
      const b = (blockSpec[e.block] ??= { parts: {} });
      const p = (b.parts[e.part] ??= { states: {} });
      const key = e.block === "notice" ? e.variant : e.blockState;
      if (!p.states[key]) p.states[key] = { seenIn: `sign-in_${state}`, styles: e.styles.map((s) => ({ property: s.property, value: s.value, tokens: s.tokens.map((t) => ({ native: t.native, web: t.web, value: t.value })), ...(s.raw ? { raw: true, kind: s.kind, file: s.file, line: s.line } : {}), ...(s.inherited ? { inherited: true } : {}) })), size: `${e.box.w}×${e.box.h}` };
    }
  }
  // forced pseudo-states (pressed, focus) for button and link
  for (const [id, f] of Object.entries(cap.forced)) {
    const blk = id === "submit" ? "button" : "sign-up-option", part = id === "submit" ? "container" : "link";
    for (const [name, styles] of Object.entries(f)) {
      const base = blockSpec[blk].parts[part].states.default.styles;
      const recs = styles.map((s) => styleRecord(s, T)).filter((s) => !base.some((b) => b.property === s.property && b.value === s.value));
      blockSpec[blk].parts[part].states[name] = { seenIn: "forced :" + (name === "pressed" ? "active" : "focus-visible") + " on sign-in_default (no approved picture)", styles: recs.map((s) => ({ property: s.property, value: s.value, tokens: s.tokens.map((t) => ({ native: t.native, web: t.web, value: t.value })), ...(s.raw ? { raw: true, kind: s.kind, file: s.file, line: s.line } : {}) })), changesOnly: true };
      for (const s of recs) if (s.raw) rawAll.push({ state: `default (${name})`, element: id, ...s });
    }
  }
  const blocks = Object.entries(BLOCKS).map(([k, b]) => ({
    block: k, name: b.name, rn: `${b.rn}  [RECOMMENDED]`, web: b.web,
    parts: blockSpec[k]?.parts || {},
    rules: b.rules.map(([sec, re]) => ({ section: `Design rules ${sec}`, text: clean(lineOf("rules", re)) })),
    pictures: cap.crops.filter((c) => c.block === k).map((c) => ({ state: c.name, file: c.file, croppedFrom: `sign-in_${c.state}_w390.png` })),
    usedIn: STATES.filter((s) => states.find((x) => x.id === `sign-in_${s}`).elements.some((e) => e.block === k)).map((s) => `sign-in_${s}`),
  }));
  const tokensUsed = [...usedTokens.values()].map((u) => ({ native: u.native, ts: u.ts, web: [...u.web], value: u.value, states: [...u.states].length === STATES.length ? "all" : [...u.states], elements: [...u.elements] })).sort((a, b) => a.native.localeCompare(b.native));
  return { states, blocks, tokensUsed, rawAll };
}
function lineNo(file, needle) { const i = read(file).split("\n").findIndex((l) => l.includes(needle)); return i + 1; }
const STATE_RULE = { "keyboard-open": /Checks, most basic first/, "empty-tap": /Checks, most basic first/, "too-short": /Checks, most basic first/, "wrong-first-digit": /Checks, most basic first/,
  "pasted-cleaned": /Typing and pasting are cleaned/, sending: /After sending, server results show/, "not-registered": /After sending, server results show/, offline: /After sending, server results show/,
  "couldnt-send": /After sending, server results show/, "too-many-tries": /After sending, server results show/, inactive: /After sending, server results show/ };
const STATE_DECIDED = { default: ["d13", "d19", "d20"], "keyboard-open": ["d02", "d13", "d15"], "empty-tap": ["d02", "d03", "d04"], "too-short": ["d02", "d03", "d04"],
  "wrong-first-digit": ["d02", "d03", "d04"], "pasted-cleaned": ["d01"], sending: ["d07"], "not-registered": ["d05", "d06", "d12"], offline: ["d05", "d16"],
  "couldnt-send": ["d05", "d06"], "too-many-tries": ["d05", "d08", "d09"], inactive: ["d05", "d11"] };
const EL_DECIDED = { "field-input": ["d01", "d02", "d14"], "field-helper": ["d03", "d04"], "field-control": ["d04"], notice: ["d05", "d06", "d26"], "notice-text": ["d05"], "notice-icon": ["d05"],
  submit: ["d07", "d08", "d11", "d24"], "submit-label": ["d07", "d08"], "submit-spinner": ["d07"], signup: ["d12", "d15"], "signup-link": ["d12"], logo: ["d19"], title: ["d17", "d20"], subtitle: ["d20"],
  keyboard: ["d13", "d14"], screen: ["d19"], hero: ["d19"], panel: ["d19"], field: ["d04"], "field-label": ["d20"], "field-prefix": ["d01"] };
function behaviourFor(e, state) {
  return { decided: (EL_DECIDED[e.id] || []).map((d) => `DECIDED.md#${d}`), state: `sign-in_${state}` };
}

// ---------------------------------------------------------------------------------------------------------------------
// Write files; manifest; CHANGES; --check
// ---------------------------------------------------------------------------------------------------------------------
function inputsHash() {
  const files = [FILES.tokensTs, FILES.tokensJson, FILES.iconsTs, FILES.messagesTs, FILES.messagesJson, FILES.metadataJson, FILES.approvedHtml,
    FILES.signInJs, FILES.signInCss, FILES.appCss, FILES.logo, FILES.dsCss, FILES.tokenBuild, FILES.tokenBuildNative, ...FILES.dsTokens, ...FILES.builder,
    ...STATES.flatMap((s) => [PICTURE(s, 360), PICTURE(s, 390)])];
  const out = {};
  for (const f of files) out[rel(f)] = sha(fs.readFileSync(f));
  return out;
}
function docTexts(T) {   // everything quoted from the big documents (DECIDED, OPEN, block rules, state rules)
  for (const k of Object.keys(snippets)) delete snippets[k];
  const D = decided(T), O = open();
  const covered = D.flatMap((d) => d.a.map((a) => a.text)).join("\n") + O.map((o) => o.now.text).join("\n");
  for (const re of APPLOGIC_MUST) { const line = clean(lineOf("appLogic", re)); if (!covered.includes(line)) die(`DECIDED/OPEN miss an app-logic rule: ${line}`); }
  const rules = Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, b.rules.map(([s, re]) => clean(lineOf("rules", re)))]));
  const stateRules = STATES.map((s) => [FM(`signin.${s}`).text, STATE_RULE[s] ? clean(lineOf("appLogic", STATE_RULE[s], "## 2. Sign-in")) : ""]);
  return { decidedMd: md(D, "decided"), openMd: md(O, "open"), rules, stateRules, D, O, snippetHash: Object.fromEntries(Object.entries(snippets).map(([k, v]) => [k, sha(v.join("\n"))])) };
}
function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? listFiles(path.join(dir, e.name), base) : [path.relative(base, path.join(dir, e.name)).split(path.sep).join("/")]);
}
const HAND = new Set(["README.md", "AGENTS.md", "CLAUDE.md", ".claude/skills/truemeds-native-ui/SKILL.md", "foundation/fonts/FONTS.md"]);
const FONTS = { "PlusJakartaSans-Regular.ttf": "bd6276d4060e3b1ebc45047469e0bb86b08f301ba681cdf1ceb6245ea10478d2", "PlusJakartaSans-Medium.ttf": "c77bab757d7402ec6d9341d5f7ddaafb2474e17026792697ba4624c7dc89caf7",
  "PlusJakartaSans-SemiBold.ttf": "65dbcedb6596a41c30869729eb31cb57d1f5edfe365684314bba8a1994eaa4cb", "PlusJakartaSans-Bold.ttf": "5f5342ef76862b5b5365d1dff1a667629dfa484e388dd602552f647219c3870f",
  "OFL.txt": "995c7199cab65954f545996326755daee7b63cc6b42b06c13da1f9502ab08a99" };
const FONT_URL = (f) => f === "OFL.txt" ? "https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/OFL.txt"
  : `https://raw.githubusercontent.com/tokotype/PlusJakartaSans/18d1cd2f7ea10481919d2f05c1f7064b7307fc26/fonts/ttf/${f}`;

function check() {
  if (!fs.existsSync(MANIFEST)) die("no manifest: run the build first");
  const man = JSON.parse(read(MANIFEST));
  const problems = [];
  const now = inputsHash();
  for (const [f, h] of Object.entries(now)) if (man.inputs[f] !== h) problems.push(`source changed: ${f}`);
  for (const f of Object.keys(man.inputs)) if (!(f in now)) problems.push(`source gone: ${f}`);
  const T = tokenMap();
  const dt = docTexts(T);
  for (const [k, h] of Object.entries(dt.snippetHash)) if (man.snippets[k] !== h) problems.push(`quoted rule changed in ${k}`);
  if (sha(dt.decidedMd + "\n") !== man.outputs["DECIDED.md"]) problems.push("DECIDED.md would change");
  if (sha(dt.openMd + "\n") !== man.outputs["OPEN.md"]) problems.push("OPEN.md would change");
  for (const [f, h] of Object.entries(man.outputs)) {
    const p = path.join(OUT, f);
    if (!fs.existsSync(p)) problems.push(`missing: handoff/${f}`); else if (sha(fs.readFileSync(p)) !== h) problems.push(`edited or stale: handoff/${f}`);
  }
  for (const f of listFiles(OUT)) if (!(f in man.outputs) && !HAND.has(f) && !(f.startsWith("foundation/fonts/") && f.split("/").pop() in FONTS)) problems.push(`unexpected file: handoff/${f}`);
  for (const [f, h] of Object.entries(FONTS)) { const p = path.join(OUT, "foundation/fonts", f); if (!fs.existsSync(p) || sha(fs.readFileSync(p)) !== h) problems.push(`font: ${f}`); }
  for (const f of HAND) if (!fs.existsSync(path.join(OUT, f))) problems.push(`missing hand-written file: handoff/${f}`);
  if (problems.length) { console.error("handoff/ is OUT OF DATE — run: node scripts/build-handoff.mjs\n  " + problems.join("\n  ")); process.exit(1); }
  console.log(`handoff/ is up to date (${Object.keys(man.outputs).length} generated files, ${Object.keys(now).length} source files, ${Object.keys(dt.snippetHash).length} quoted documents).`);
}

async function build() {
  const T = tokenMap();
  const dt = docTexts(T);
  const prev = fs.existsSync(MANIFEST) ? JSON.parse(read(MANIFEST)) : null;
  // generated outputs go to a fresh folder; hand-written files and fonts are carried over
  const TMP = OUT + ".tmp";
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  for (const f of HAND) if (fs.existsSync(path.join(OUT, f))) { fs.mkdirSync(path.dirname(path.join(TMP, f)), { recursive: true }); fs.copyFileSync(path.join(OUT, f), path.join(TMP, f)); }
  fs.mkdirSync(path.join(TMP, "foundation/fonts"), { recursive: true });
  for (const [f, h] of Object.entries(FONTS)) {
    const have = path.join(OUT, "foundation/fonts", f);
    let buf = fs.existsSync(have) ? fs.readFileSync(have) : null;
    if (!buf || sha(buf) !== h) { const r = await fetch(FONT_URL(f)); if (!r.ok) die(`font download ${f}: ${r.status}`); buf = Buffer.from(await r.arrayBuffer()); }
    if (sha(buf) !== h) die(`font ${f}: sha256 mismatch`);
    fs.writeFileSync(path.join(TMP, "foundation/fonts", f), buf);
  }
  const cap = await capture(TMP);
  const A = assemble(cap, T);
  const W = (f, data) => { const p = path.join(TMP, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); };
  // foundation: copied from their generated sources, unchanged
  W("foundation/tokens.ts", read(FILES.tokensTs)); W("foundation/tokens.json", read(FILES.tokensJson)); W("foundation/icons.ts", read(FILES.iconsTs)); W("foundation/messages.ts", read(FILES.messagesTs));
  W("foundation/logo/truemeds-for-doctors.svg", read(FILES.logo));
  const tokenIndex = Object.entries(T.m.vars).map(([web, v]) => ({ web, native: T.nativeName(v.native), ts: T.tsName(v.native), value: v.value, source: v.source }))
    .concat(Object.entries(T.m.aliases).map(([web, a]) => { const r = T.resolve(web); return { web, native: r.native, ts: r.ts, value: r.value, source: `alias of ${a.to}` }; }));
  W("foundation/token-map.json", JSON.stringify({ about: "Every web token (CSS variable) with its native name in foundation/tokens.ts. Generated from the design-system build code; text styles: .tm-text-* classes map to tokens.text.*.", tokens: tokenIndex,
    textStyles: Object.entries(T.m.textClasses).map(([cls, p]) => ({ web: `.${cls}`, native: T.nativeName(p), ts: T.tsName(p) })) }, null, 1) + "\n");
  // pictures
  for (const s of STATES) for (const w of [360, 390]) { fs.mkdirSync(path.join(TMP, "screens/pictures"), { recursive: true }); fs.copyFileSync(PICTURE(s, w), path.join(TMP, `screens/pictures/sign-in_${s}_w${w}.png`)); }
  // screen + blocks
  const audit = approvedCssAudit();
  const screen = {
    screen: "sign-in", about: "Every element of every Sign-in state. Facts measured from the built web app at 390 wide (density-independent points); tokens are the ones the applying CSS rule references. Schema: see AGENTS.md.",
    widthMeasured: 390,
    states: A.states,
    tokensUsed: A.tokensUsed,
    rawValues: { about: "Values that are not tokens. Red in the viewer. kind: size | colour | keyword | zero | copy. Built app CSS first, then the approved reference file.", builtApp: dedupeRaw(A.rawAll), approvedReference: audit },
  };
  W("screens/sign-in.json", JSON.stringify(screen, null, 1) + "\n");
  for (const b of A.blocks) W(`components/${b.block}.json`, JSON.stringify(b, null, 1) + "\n");
  W("DECIDED.md", dt.decidedMd + "\n"); W("OPEN.md", dt.openMd + "\n");
  // viewer
  W("viewer/truemeds.css", "/* Design-system stylesheet (comments removed), for the viewer's own look. Use foundation/tokens.ts in the app. */\n" + read(FILES.dsCss).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n{3,}/g, "\n\n"));
  for (const f of fs.readdirSync(FILES.dsFontsDir)) if (f.endsWith(".woff2")) { fs.mkdirSync(path.join(TMP, "viewer/fonts"), { recursive: true }); fs.copyFileSync(path.join(FILES.dsFontsDir, f), path.join(TMP, "viewer/fonts", f)); }
  W("viewer/data.js", "// Generated — the same facts as screens/sign-in.json and components/*.json, for the viewer (opens from disk).\nwindow.KIT = " +
    JSON.stringify({ screen, blocks: A.blocks, tokenIndex, decided: dt.D.map((d) => ({ id: d.id, q: d.q })), open: dt.O.map((o) => ({ id: o.id, q: o.q })) }) + ";\n");
  W("viewer/index.html", VIEWER_HTML);
  W("viewer/viewer.js", VIEWER_JS);
  // CHANGES + manifest
  const outputs = {};
  for (const f of listFiles(TMP)) if (!HAND.has(f) && f !== "CHANGES.md" && !f.startsWith("foundation/fonts/")) outputs[f] = sha(fs.readFileSync(path.join(TMP, f)));
  const snap = { tokens: Object.fromEntries(A.tokensUsed.map((t) => [t.native, JSON.stringify(t.value)])),
    blocks: Object.fromEntries(A.blocks.map((b) => [b.block, sha(JSON.stringify({ parts: b.parts, rules: b.rules }))])),
    screens: Object.fromEntries(A.states.map((s) => [s.id, sha(JSON.stringify(s.elements.map((e) => ({ ...e, box: undefined }))))])), copy: Object.fromEntries(usedKeys.map((k) => [k, messages[k]])) };
  const changes = changesMd(prev?.snapshot, snap, prev?.changes);
  W("CHANGES.md", changes.text);
  outputs["CHANGES.md"] = sha(changes.text);
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.renameSync(TMP, OUT);
  fs.writeFileSync(MANIFEST, JSON.stringify({ about: "build-handoff.mjs state: source hashes, quoted-document hashes, generated-file hashes, last snapshot (for CHANGES.md).",
    inputs: inputsHash(), snippets: dt.snippetHash, outputs, snapshot: snap, changes: changes.log }, null, 1) + "\n");
  const raws = screen.rawValues.builtApp.length;
  console.log(`handoff/ built: ${A.states.length} states, ${A.states.reduce((n, s) => n + s.elements.length, 0)} element records, ${A.blocks.length} blocks, ${A.tokensUsed.length} tokens used, ${raws} raw values in the built app, ${audit.length} in the reference file; ${changes.summary}`);
}
function dedupeRaw(list) {
  const m = new Map();
  for (const r of list) {
    const k = `${r.file}:${r.line}:${r.property}:${r.value}`;
    const cur = m.get(k) || { raw: true, kind: r.kind, file: r.file, line: r.line, property: r.property, value: r.value, selector: r.from?.selector, elements: [], states: [] };
    if (!cur.elements.includes(r.element)) cur.elements.push(r.element);
    if (!cur.states.includes(r.state)) cur.states.push(r.state);
    m.set(k, cur);
  }
  return [...m.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}
function changesMd(prev, snap, log = []) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  if (!prev) lines.push("- First generation of the kit (Sign-in).");
  else {
    const diff = (label, a, b, fmt = (k) => k) => {
      for (const k of Object.keys(b)) if (!(k in a)) lines.push(`- ${label} added: ${fmt(k)}`);
      for (const k of Object.keys(a)) if (!(k in b)) lines.push(`- ${label} removed: ${fmt(k)}`);
      for (const k of Object.keys(b)) if (k in a && a[k] !== b[k]) lines.push(`- ${label} changed: ${fmt(k)}${label === "Token" || label === "Copy" ? ` (${a[k]} → ${b[k]})` : ""}`);
    };
    diff("Token", prev.tokens, snap.tokens); diff("Block", prev.blocks, snap.blocks); diff("Screen state", prev.screens, snap.screens); diff("Copy", prev.copy || {}, snap.copy);
  }
  const entry = { date, lines: lines.length ? lines : ["- No changes to tokens, blocks, screens or copy."] };
  const keep = lines.length || !log.length ? [entry, ...log].slice(0, 20) : log;
  const text = ["# CHANGES", "", "What moved in the kit since the previous generation: tokens used, building blocks, screen states, copy. Newest first. Generated.", "",
    ...keep.flatMap((e) => [`## ${e.date}`, "", ...e.lines, ""])].join("\n");
  return { text, log: keep, summary: entry.lines.length === 1 && entry.lines[0].startsWith("- No") ? "no changes" : `${entry.lines.length} change line(s)` };
}

// ---------------------------------------------------------------------------------------------------------------------
// Viewer (static; opens by double-click; reads data.js)
// ---------------------------------------------------------------------------------------------------------------------
const VIEWER_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Truemeds doctor app — hand-off kit</title>
<link rel="stylesheet" href="truemeds.css">
<style>
body { margin: 0; background: var(--tm-surface-secondary); }
.v-top { position: sticky; top: 0; z-index: 5; background: var(--tm-surface-primary); border-bottom: 1px solid var(--tm-border-subtle); padding: var(--tm-space-sm) var(--tm-space-page); display: flex; gap: var(--tm-space-xs); flex-wrap: wrap; }
.v-top button { border: 0; background: none; font: inherit; padding: var(--tm-space-sm) var(--tm-space-md); border-radius: var(--tm-radius-md); color: var(--tm-content-secondary); min-height: 40px; cursor: pointer; }
.v-top button[aria-current="true"] { background: var(--tm-surface-brand-subtle); color: var(--tm-content-brand); font-weight: var(--tm-font-weight-semibold); }
main.v { max-width: 1100px; margin: 0 auto; padding: var(--tm-space-lg) var(--tm-space-page) 96px; }
.v h1 { font-size: var(--tm-font-size-title-lg); line-height: var(--tm-font-lineheight-2xl); margin: 0 0 var(--tm-space-sm); }
.v h2 { font-size: 20px; line-height: 28px; margin: var(--tm-space-2xl) 0 var(--tm-space-sm); }
.v h3 { font-size: 16px; line-height: 24px; margin: var(--tm-space-lg) 0 var(--tm-space-xs); }
.v p, .v li { color: var(--tm-content-secondary); }
.v code { font-size: 13px; background: var(--tm-surface-tertiary); padding: 1px 4px; border-radius: 4px; color: var(--tm-content-primary); overflow-wrap: anywhere; }
.v table { width: 100%; border-collapse: collapse; background: var(--tm-surface-primary); font-size: 13px; line-height: 18px; }
.v th, .v td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--tm-border-subtle); overflow-wrap: anywhere; }
.v th { color: var(--tm-content-secondary); font-weight: var(--tm-font-weight-semibold); }
.tblwrap { overflow-x: auto; }
.raw, .raw code { color: var(--tm-content-error) !important; }
tr.raw td { background: var(--tm-feedback-error-surface); }
.swatch { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: -2px; margin-right: 4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.card { background: var(--tm-surface-primary); border-radius: var(--tm-radius-lg); padding: var(--tm-space-lg); margin: var(--tm-space-sm) 0; box-shadow: var(--tm-shadow-card); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: var(--tm-space-sm) 0; }
.chips button { border: 1px solid var(--tm-border-default); background: var(--tm-surface-primary); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 13px; min-height: 36px; cursor: pointer; }
.chips button[aria-pressed="true"] { border-color: var(--tm-border-selected); background: var(--tm-surface-brand-subtle); color: var(--tm-content-brand); }
.stage { display: flex; gap: var(--tm-space-lg); flex-wrap: wrap; align-items: flex-start; }
.shot { position: relative; width: 390px; max-width: 100%; flex: none; }
.shot img { width: 100%; display: block; border-radius: 12px; box-shadow: var(--tm-shadow-card); }
.shot .hit { position: absolute; border: 1px dashed transparent; cursor: pointer; background: none; padding: 0; }
.shot .hit:hover { border-color: var(--tm-border-focus); }
.shot .hit.sel { border: 2px solid var(--tm-border-focus); background: rgba(38,108,225,.08); }
.ref { width: 220px; flex: none; }
.ref img { width: 100%; border-radius: 8px; box-shadow: var(--tm-shadow-card); }
.ref figcaption, .shot figcaption { font-size: 12px; color: var(--tm-content-secondary); margin-top: 4px; }
.panel { flex: 1 1 320px; min-width: 0; }
.ellist { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: var(--tm-space-sm); }
.ellist button { font: inherit; font-size: 12px; border: 1px solid var(--tm-border-subtle); background: var(--tm-surface-primary); border-radius: 6px; padding: 4px 8px; min-height: 32px; cursor: pointer; }
.ellist button[aria-pressed="true"] { border-color: var(--tm-border-selected); color: var(--tm-content-brand); }
.blockpics { display: flex; gap: var(--tm-space-sm); flex-wrap: wrap; }
.blockpics figure { margin: 0; max-width: 100%; }
.blockpics img { max-width: 100%; max-height: 220px; border: 1px solid var(--tm-border-subtle); border-radius: 6px; background: #fff; }
.muted { color: var(--tm-content-tertiary); }
@media (max-width: 720px) { .shot { width: 100%; } .ref { width: 46%; } }
</style>
</head>
<body class="tm">
<nav class="v-top" aria-label="Sections"></nav>
<main class="v" id="v"></main>
<script src="data.js"></script>
<script src="viewer.js"></script>
</body>
</html>
`;
const VIEWER_JS = String.raw`// Hand-off kit viewer. Static: reads window.KIT from data.js (generated). No server needed.
(() => {
  const K = window.KIT, S = K.screen, $ = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sw = (v) => typeof v === "string" && /^(#|rgb)/.test(v) ? '<span class="swatch" style="background:' + esc(v) + '"></span>' : "";
  const val = (v) => typeof v === "object" ? (v.boxShadow ? v.boxShadow : JSON.stringify(v)) : v;
  const tokCell = (t) => t.native ? sw(t.value) + "<code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + (t.via && t.via.length ? " (via " + esc(t.via.join(", ")) + ")" : "") + " · " + esc(val(t.value)) + "</span>" : '<span class="raw">' + esc(t.web) + " — not a native token</span>";
  const styleRows = (styles) => styles.map((s) => '<tr class="' + (s.raw ? "raw" : "") + '"><td><code>' + esc(s.property) + "</code>" + (s.inherited ? " <span class=muted>(inherited)</span>" : "") + (s.appliesTo ? "<br><span class=muted>" + esc(s.appliesTo.join(", ")) + "</span>" : "") + "</td><td>" + (s["tokens"].length ? s["tokens"].map(tokCell).join("<br>") : "—") +
    (s.raw ? '<br><span class="raw">not a token: <code>' + esc(s.value) + "</code> (" + esc(s.kind || "") + ") " + esc((s.file || (s.from && s.from.file)) + ":" + (s.line || (s.from && s.from.line))) + "</span>" : "") + "</td></tr>").join("");
  const nav = document.querySelector(".v-top"), main = document.getElementById("v");
  const tabs = { start: "Start here", foundation: "Foundation", blocks: "Building blocks", screens: "Screens" };
  let cur = location.hash.slice(1).split("/")[0] || "start";
  for (const [k, l] of Object.entries(tabs)) { const b = $('<button type="button">' + l + "</button>"); b.onclick = () => { location.hash = k; }; b.dataset.k = k; nav.append(b); }
  window.addEventListener("hashchange", () => go(location.hash.slice(1)));
  function go(h) {
    const [k, a, b] = (h || "start").split("/"); cur = tabs[k] ? k : "start";
    nav.querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", String(x.dataset.k === cur)));
    main.innerHTML = ""; ({ start, foundation, blocks, screens })[cur](a, b); window.scrollTo(0, 0);
  }
  function start() {
    main.append($('<section><h1>Sign-in — hand-off kit</h1><p>Everything the React Native team needs to build the Truemeds doctor app\'s Sign-in screen from the same tokens, copy and rules as the approved design.</p>' +
      '<div class="card"><h3>What is here</h3><ul><li><b>Foundation</b>: tokens (native names beside the web names), icons, copy, fonts.</li><li><b>Building blocks</b>: each block on the screen, its parts and states, the token for each, sizes and rules.</li><li><b>Screens</b>: all ' + S.states.length + ' Sign-in states. Tap any element for its block, tokens, spacing, copy key and behaviour.</li><li><b>Red</b> = a value that is not a token.</li></ul></div>' +
      '<div class="card"><h3>Files</h3><ul><li><code>../AGENTS.md</code> — for your AI coding tool.</li><li><code>../DECIDED.md</code> — questions already answered (' + K.decided.length + ').</li><li><code>../OPEN.md</code> — still open, with who answers (' + K.open.length + ').</li><li><code>../screens/sign-in.json</code>, <code>../components/*.json</code> — the same facts as data.</li><li><code>../CHANGES.md</code> — what moved since the last drop.</li></ul></div>' +
      '<div class="card"><h3>Tokens used on Sign-in (' + S.tokensUsed.length + ')</h3><div class="tblwrap"><table><thead><tr><th>Native</th><th>Web</th><th>Value</th><th>States</th></tr></thead><tbody>' +
      S.tokensUsed.map((t) => "<tr><td><code>" + esc(t.native) + "</code></td><td><code>" + esc(t.web.join(", ")) + "</code></td><td>" + sw(t.value) + esc(val(t.value)) + "</td><td>" + (t.states === "all" ? "all" : esc(t.states.map((x) => x.replace("sign-in_", "")).join(", "))) + "</td></tr>").join("") + "</tbody></table></div></div></section>"));
  }
  function foundation() {
    main.append($('<section><h1>Foundation</h1><p>Files in <code>../foundation/</code>: <code>tokens.ts</code>, <code>tokens.json</code>, <code>icons.ts</code>, <code>messages.ts</code>, <code>token-map.json</code>, <code>fonts/</code> (see <code>fonts/FONTS.md</code>), <code>logo/</code>.</p></section>'));
    const q = $('<input class="tm-input" placeholder="Filter tokens (e.g. content, space, --tm-border)" style="width:100%;padding:12px;border:1px solid var(--tm-border-default);border-radius:8px;font:inherit;margin:8px 0">');
    const box = $('<div class="tblwrap"></div>');
    const draw = () => { const f = q.value.toLowerCase(); box.innerHTML = "<table><thead><tr><th>Native (use this)</th><th>Web</th><th>Value</th></tr></thead><tbody>" + K.tokenIndex.filter((t) => !f || (t.native + t.web).toLowerCase().includes(f)).map((t) => "<tr><td><code>" + esc(t.ts) + "</code></td><td><code>" + esc(t.web) + "</code></td><td>" + sw(t.value) + esc(val(t.value)) + "</td></tr>").join("") + "</tbody></table>"; };
    q.oninput = draw; main.append(q, box); draw();
  }
  function blocks(which) {
    main.append($('<section><h1>Building blocks</h1><p>Same names on web and native. RN names are a suggestion [RECOMMENDED]; you own the components.</p></section>'));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    const b = K.blocks.find((x) => x.block === which) || K.blocks[0];
    for (const x of K.blocks) { const c = $('<button type="button">' + esc(x.name) + "</button>"); c.setAttribute("aria-pressed", String(x === b)); c.onclick = () => { location.hash = "blocks/" + x.block; }; chips.append(c); }
    const sec = $('<section class="card"></section>');
    sec.innerHTML = "<h2 style=margin-top:0>" + esc(b.name) + "</h2><p><code>" + esc(b.rn) + "</code><br><span class=muted>web: " + esc(b.web) + " · used in " + b.usedIn.length + " states</span></p>" +
      '<div class="blockpics">' + b.pictures.map((p) => "<figure><img src=\"../" + esc(p.file) + "\" alt=\"" + esc(b.name + " " + p.state) + "\"><figcaption>" + esc(p.state) + "</figcaption></figure>").join("") + "</div>" +
      Object.entries(b.parts).map(([part, p]) => "<h3>" + esc(part) + "</h3>" + Object.entries(p.states).map(([st, s]) => "<p><b>" + esc(st) + "</b> <span class=muted>" + esc(s.seenIn) + (s.size ? " · " + esc(s.size) : "") + (s.changesOnly ? " · changes from default only" : "") + '</span></p><div class="tblwrap"><table><tbody>' + styleRows(s.styles) + "</tbody></table></div>").join("")).join("") +
      "<h3>Rules</h3><ul>" + b.rules.map((r) => "<li>" + esc(r.text) + " <span class=muted>— " + esc(r.section) + "</span></li>").join("") + "</ul>";
    main.append(sec);
  }
  function screens(stateId, elId) {
    const st = S.states.find((s) => s.id === stateId) || S.states[0];
    main.append($('<section><h1>Sign-in</h1><p>Tap any element on the 390 picture (built app). The approved 360 picture is beside it.</p></section>'));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    for (const s of S.states) { const c = $('<button type="button">' + esc(s.name) + "</button>"); c.setAttribute("aria-pressed", String(s === st)); c.onclick = () => { location.hash = "screens/" + s.id; }; chips.append(c); }
    const stage = $('<div class="stage"></div>');
    const shot = $('<figure class="shot" style="margin:0"><img alt="' + esc(st.name) + ' at 390, built app" src="../' + esc(st.pictures.built390) + '"><figcaption>390 · built app · inspectable</figcaption></figure>');
    const ref = $('<figure class="ref" style="margin:0"><img alt="' + esc(st.name) + ' at 360, approved" src="../' + esc(st.pictures.w360) + '"><figcaption>360 · approved picture</figcaption><br><img alt="' + esc(st.name) + ' at 390, approved" src="../' + esc(st.pictures.w390) + '"><figcaption>390 · approved picture</figcaption></figure>');
    const panel = $('<div class="panel"></div>');
    const order = [...st.elements].sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h);
    let sel = st.elements.find((e) => e.id === elId) || null;
    for (const e of order) {
      const h = $('<button type="button" class="hit" aria-label="' + esc(e.id) + '"></button>');
      Object.assign(h.style, { left: e.box.x / 3.9 + "%", top: e.box.y / 8.44 + "%", width: e.box.w / 3.9 + "%", height: e.box.h / 8.44 + "%" });
      h.onclick = (ev) => { ev.stopPropagation(); pick(e); }; h.dataset.id = e.id; shot.append(h);
    }
    stage.append(shot, panel, ref); main.append(stage);
    const list = $('<div class="ellist"></div>');
    function pick(e) { sel = e; history.replaceState(null, "", "#screens/" + st.id + "/" + e.id); drawPanel(); }
    function drawPanel() {
      shot.querySelectorAll(".hit").forEach((h) => h.classList.toggle("sel", sel && h.dataset.id === sel.id));
      panel.innerHTML = ""; list.innerHTML = "";
      for (const e of st.elements) { const b = $('<button type="button">' + esc(e.id) + "</button>"); b.setAttribute("aria-pressed", String(sel === e)); b.onclick = () => pick(e); list.append(b); }
      panel.append(list);
      if (sel) {
        const e = sel, sp = e.spacing || {};
        panel.append($('<div class="card"><h2 style="margin-top:0">' + esc(e.id) + "</h2><p><b>Block</b> " + esc(e.block) + " · <b>part</b> " + esc(e.part) + " · <b>variant</b> " + esc(e.variant) + " · <b>state</b> " + esc(e.blockState) + (e.rn ? "<br><b>RN</b> <code>" + esc(e.rn) + "</code>" : "") + "<br><span class=muted>box " + esc(e.box.w + "×" + e.box.h) + " at " + esc(e.box.x + "," + e.box.y) + "</span></p>" +
          (e.copy.length ? "<p><b>Copy</b> " + e.copy.map((c) => c.copyKey ? "<code>messages['" + esc(c.copyKey) + "']</code>" + (c.values ? " with " + esc(JSON.stringify(c.values)) : "") + " (" + esc(c.slot) + ")" : c.literal ? '<span class="raw">typed text "' + esc(c.literal) + '" (' + esc(c.slot) + ")</span>" : "<span class=muted>" + esc(c.note) + "</span>").join("<br>") + "</p>" : "") +
          (e.icon ? "<p><b>Icon</b> <code>" + esc(e.icon.iconTs) + "</code> " + esc(e.icon.size ? e.icon.size.join("×") : "") + "</p>" : "") +
          '<div class="tblwrap"><table><thead><tr><th>Property</th><th>Token (native · web · value)</th></tr></thead><tbody>' + (styleRows(e.styles) || "<tr><td colspan=2 class=muted>No styles: the phone draws this.</td></tr>") + "</tbody></table></div>" +
          "<h3>Spacing</h3>" + (sp.above ? "<p>" + esc(sp.above.px) + " above, to <b>" + esc(sp.above.neighbour) + "</b>: " + (sp.above.setBy.length ? sp.above.setBy.map((s) => esc(s.element + " " + s.property + " ") + (s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>")).join("; ") : "<span class=muted>layout (no spacing rule)</span>") + "</p>" : "") +
          (sp.inside ? "<p>Inside: " + sp.inside.map((s) => esc(s.property + " ") + (s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>")).join("; ") + "</p>" : "") +
          "<h3>Behaviour</h3><p>" + (e.behaviour.decided.length ? e.behaviour.decided.map((d) => '<a href="../' + esc(d) + '">' + esc(d.replace("DECIDED.md#", "DECIDED ")) + "</a>").join(" · ") : "<span class=muted>none beyond the screen rule</span>") + "</p>" +
          "<h3>Accessibility</h3><p>" + Object.entries(e.accessibility).map(([k, v]) => "<b>" + esc(k) + "</b> " + esc(v)).join(" · ") + "</p></div>"));
      }
      const r = st.rule;
      panel.append($('<div class="card"><h3 style="margin-top:0">Rule for this state</h3><p>' + esc(r.pattern) + "</p><p>" + esc(r.appLogic) + "</p><p>" + r.decided.map((d) => '<a href="../DECIDED.md#' + d + '">DECIDED ' + d + "</a>").join(" · ") + "</p></div>"));
      const used = {}; for (const e of st.elements) for (const s of e.styles) for (const t of s["tokens"]) if (t.native) (used[t.native] ??= { t, els: new Set() }).els.add(e.id);
      panel.append($('<div class="card"><h3 style="margin-top:0">Tokens used in this state (' + Object.keys(used).length + ')</h3><div class="tblwrap"><table><thead><tr><th>Native</th><th>Web</th><th>Value</th><th>Elements</th></tr></thead><tbody>' +
        Object.values(used).sort((a, b) => a.t.native.localeCompare(b.t.native)).map(({ t, els }) => "<tr><td><code>" + esc(t.native) + "</code></td><td><code>" + esc(t.web) + "</code></td><td>" + sw(t.value) + esc(val(t.value)) + "</td><td>" + esc([...els].join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
      const raws = S.rawValues.builtApp.filter((x) => x.states.includes(st.id.replace("sign-in_", "")) || x.states.includes(st.id.replace("sign-in_", "")));
      panel.append($('<div class="card"><h3 style="margin-top:0" class="raw">Not tokens in this state (' + raws.length + ')</h3><div class="tblwrap"><table><thead><tr><th>Value</th><th>Where</th><th>Elements</th></tr></thead><tbody>' +
        raws.map((x) => '<tr class="raw"><td><code>' + esc(x.property + ": " + x.value) + "</code> (" + esc(x.kind) + ")</td><td>" + esc(x.file + ":" + x.line) + "</td><td>" + esc(x.elements.join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
    }
    drawPanel();
    const all = $('<details class="card"><summary><b>Approved reference file: values that are not tokens (' + S.rawValues.approvedReference.length + ')</b></summary><div class="tblwrap"><table><tbody>' + S.rawValues.approvedReference.map((x) => '<tr class="raw"><td><code>' + esc(x.property + ": " + x.value) + "</code> (" + esc(x.kind) + ")</td><td>" + esc(x.file + ":" + x.line) + "</td><td><code>" + esc(x.selector) + "</code></td></tr>").join("") + "</tbody></table></div></details>");
    main.append(all);
  }
  go(location.hash.slice(1));
})();
`;

if (CHECK) check(); else await build();
