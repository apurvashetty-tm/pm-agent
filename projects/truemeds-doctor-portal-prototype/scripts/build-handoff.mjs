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
import zlib from "node:zlib";
import * as J from "./build-handoff.journeys.mjs";
import { WHEN, TABS } from "./build-handoff.when.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DS = path.resolve(ROOT, "../../design-system");
const OUT = path.join(ROOT, "handoff");
const MANIFEST = path.join(ROOT, "scripts/build-handoff.manifest.json");
const CHECK = process.argv.includes("--check");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(p, "utf8");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const die = (msg) => { console.error(`build-handoff: ${CHECK ? "handoff/ is OUT OF DATE (a quoted source moved or changed): " : ""}${msg}`); process.exit(1); };

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
  builder: [path.join(ROOT, "scripts/build-handoff.mjs"), path.join(ROOT, "scripts/build-handoff.py"), path.join(ROOT, "scripts/build-handoff.journeys.mjs"), path.join(ROOT, "scripts/build-handoff.when.mjs")],
  // everything the capture loads that can move or restyle Sign-in (shell frame, routing, keyboard drawing, fonts, copy)
  capture: ["app/index.html", "app/shell/shell.css", "app/shell/screen-host.js", "app/shell/mock-keyboard.js", "app/shell/mock-keyboard.css",
    "app/core/boot.js", "app/core/modes.js", "app/core/dom.js", "app/core/msg.js", "app/core/nav.js", "app/core/store.js", "app/core/clock.js",
    "app/core/storage.js", "app/core/settings.js", "app/screens/entry-ctx.js", "app/data/test-numbers.js", "app/data/links.js", "app/feedback/messages.js",
    "app/brand/truemeds-for-doctors.svg", "app/state-map.js", "app/design-system/icons/icons.js",
    // every other stylesheet index.html loads globally (a stray selector there could restyle Sign-in)
    "app/screens/otp.css", "app/screens/faster-signin-offer.css", "app/screens/returning-unlock.css"].map((f) => path.join(ROOT, f)),
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
const INTERNAL = /Apurva|\bRound\s*\d|\blane\b|Codex|\brender|Netlify|\bgit\b|\bbrief\b|\.py\b|\.md\b|\.html\b|\.png\b|\bA-\d\d\b|\bB-\d\d\b|\bCW-|beyond-salt|NEEDS-|\brecovery\b|\bplan v|\bplan B\d|fix round|check-locked|Mangesh|Kunal|Swapnil|Claude Code/i;
const PATHS = [[/`?ui-screens\/feedback\/messages\.json`?/g, "`foundation/messages.ts`"], [/`?docs\/feedback-state-map\.md`?/g, "the feedback map (quoted in DECIDED.md)"],
  [/`?brand\/truemeds-for-doctors\.svg`?/g, "`foundation/logo/truemeds-for-doctors.svg`"], [/`?truemeds\.css`?/g, "the design system"]];
const REPLACE = [[/^\*\*Rejected:\*\* pinned bottom button on sign-in\/OTP; auto-opening the keyboard on sign-in \(D-33 layout kept as approved\)\./, "On sign-in the keyboard does not open by itself, and the main button is not pinned to the bottom."], [/: "New here\? Sign up below\. Already applied\? Our team will call you once you're approved\."/, " (copy: `signin.notRegistered`)."]];
const DROP = [/^\(Try again · Not now/, /^Reconnect to turn on faster/, /^\(2\) \*\*16 messages/, /^\(3\) \*\*Kept/, /^\(4\) \*\*Faster sign-in offer copy/, /^`call\.transferReady`/, /^Failed stays on the offer/, /Sign-in is 174 today/, /166 is the largest width that fits Home/, /"New here\? Sign up below/, /Rule in §4\./, /^\(2\) \*\*16 messages shortened/];
function clean(s, safe = false) {
  let t = s.trim();
  if (t.startsWith("|")) { const c = t.split("|").map((x) => x.trim()).filter(Boolean); t = c.length > 2 ? `${c[0]} — ${c[1]}: ${c.slice(2).join(" · ")}` : c.join(" — "); }
  t = t.replace(/^\s*[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\s*\[(?:CHANGED|ADDED|ENHANCED|UPDATED)[^\]]*\]/g, "");
  for (const [re, to] of PATHS) t = t.replace(re, to);
  t = t.replace(/\*\*Decision \(Apurva\)[^*]*:\*\*\s*/g, "").replace(/Decision \(Apurva\)[^:]*:\s*/g, "");
  // parentheticals: keep only decision numbers
  for (let k = 0; k < 3; k++) t = t.replace(/\(([^()]*)\)/g, (m, inner) => {
    const ds = inner.match(/D-\d+(?:\s+(?:F\d+|pt \d+|point \d+))?/g);
    if (!INTERNAL.test(inner) && !/\bpicture/i.test(inner)) return m;
    return ds ? `(${ds.join(", ")})` : "";
  });
  t = t.replace(/`[^`\s]*(?:\/|\.md|\.py|\.html|\.png|\.css)[^`\s]*`/g, (m) => /https?:|^`foundation\//.test(m) ? m : "")
    .replace(/\(\s*,\s*/g, "(").replace(/\(\s*\)/g, "").replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
  for (const [re, to] of REPLACE) t = t.replace(re, to);
  t = t.split(/(?<!e\.g\.|i\.e\.)(?<=[.!?]["”*]{0,2})\s+(?=\S)/).filter((x) => !DROP.some((re) => re.test(x))).join(" ").replace(/ \*\*(?=[\s·]|$)/g, "**");
  // sentences that still carry internal notes go
  t = t.split(/(?<=\.)\s+(?=[A-Z*])/).filter((x) => !INTERNAL.test(x.replace(/\b(?:sign-in|Sign-in)\b/g, ""))).join(" ");
  if (INTERNAL.test(t.replace(/\b(?:sign-in|Sign-in)\b/g, ""))) { if (safe) return ""; die(`internal wording left after cleaning: ${t}`); }
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
const usedKeys = [...new Set([...read(FILES.signInJs).matchAll(/(?:MSG|parts)\(\s*"([\w.]+)"/g), ...read(FILES.signInJs).matchAll(/key:\s*"([\w.]+)"/g),
  ...read(FILES.signInJs).matchAll(/error:\s*"([\w.]+)"/g)].map((x) => x[1]))].filter((k) => messages[k]);
function copyFor(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const hits = usedKeys.flatMap((k) => {
    // {link} is drawn as its own element (the link), so the sentence's own text ends before it
    const re = new RegExp("^" + messages[k].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s*\\\{link\\\}\s*/g, "\\s*(?<link>.*?)\\s*").replace(/\\\{(\w+)\\\}/g, "(?<$1>.+?)") + "$");
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
      const kind = rawKind(value);
      if (kind !== "size" && kind !== "colour") continue;   // D-98: layout keywords and zeros are not flagged
      out.push({ raw: true, file: "sign-in.html", line, selector, property: d[1], value, kind: kind === "colour" ? "colour" : "size" });
    }
  }
  return out;
}
// Documented exceptions (D-98 fix brief): not tokens on purpose, shown as such, not red
const EXCEPTIONS = [{ property: "max-width", value: "31ch", why: "Documented exception (D-98): a text measure, not a size — the subtitle's line length. React Native has no ch unit; see OPEN o19." }];
function rawKind(value) {
  const v = value.replace(/var\(--[\w-]+\)/g, "");
  if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(?:white|black)\b/i.test(v)) return "colour";
  if (/-?\d*\.?\d+(?:px|ch|em|rem|vh|vw|pt)\b/.test(v)) return "size";
  if (/\d*\.?\d+m?s\b/.test(v)) return "timing";
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
  const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const browser = await chromium.launch({ executablePath: process.env.CHROME || process.env.CHROMIUM || (fs.existsSync(MAC_CHROME) ? MAC_CHROME : undefined),
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
          // ::placeholder rules (DevTools doesn't report them as matched): find them in the two stylesheets and test their base selector
          if (t.tag === "input") for (const [file, src] of [["design-system/truemeds.css", FILES.appCss], ["app/screens/sign-in.css", FILES.signInCss]])
            for (const [i, l] of read(src).split("\n").entries()) for (const r of l.matchAll(/([^{}]*::placeholder)\s*\{([^}]*)\}/g)) {
              const sel = r[1].trim(), base = sel.replace(/\s+::placeholder$/, " *").replace(/::placeholder$/, "");
              if (!(await pg.evaluate(([b, id]) => document.querySelector(`[data-kit="${id}"]`).matches(b), [base, t.id]))) continue;
              for (const d of r[2].matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) styles.push({ property: "::placeholder " + d[1], value: d[2].trim(), selector: sel, file, line: i + 1 });
            }
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
    // native logo: PNG exports of the locked lockup SVG at the lockup width token (166) @1x/@2x/@3x — rasterised, never redrawn
    const svg = fs.readFileSync(FILES.logo);
    const w = JSON.parse(read(FILES.tokensJson)).logoLockup.width;
    const logo = { source: "foundation/logo/truemeds-for-doctors.svg", sourceSha256: sha(svg), widthToken: "tokens.logoLockup.width", files: [] };
    fs.mkdirSync(path.join(T, "foundation/brand"), { recursive: true });
    for (const scale of [1, 2, 3]) {
      const pg = await browser.newPage({ viewport: { width: w, height: 200 }, deviceScaleFactor: scale });
      await pg.setContent(`<body style="margin:0;background:transparent"><img id="l" style="display:block;width:${w}px" src="data:image/svg+xml;base64,${svg.toString("base64")}"></body>`);
      await pg.waitForFunction(() => document.getElementById("l").complete);
      const h = await pg.evaluate(() => document.getElementById("l").getBoundingClientRect().height);
      const file = `foundation/brand/truemeds-for-doctors@${scale}x.png`;
      await pg.screenshot({ path: path.join(T, file), clip: { x: 0, y: 0, width: w, height: Math.ceil(h) }, omitBackground: true });
      logo.files.push({ folder: "foundation/brand", name: "truemeds-for-doctors", densitySuffix: `@${scale}x`, ext: "png", scale, widthPx: w * scale });
      await pg.close();
    }
    fs.writeFileSync(path.join(T, "foundation/brand/logo.json"), JSON.stringify({ about: "PNG exports of the locked \"truemeds for doctors\" lockup for React Native (react-native-svg can't draw the image the SVG embeds). Generated from the SVG; never redraw, recolour or stretch. React Native picks the 2x / 3x file by its density suffix, drawn tokens.logoLockup.width wide.", ...logo }, null, 1) + "\n");
    // every other journey: the same capture, elements named from the built markup
    const journeys = await J.captureJourneys({ browser, base, cascade, LONG, TEXT_PROPS, outDir: T, ROOT, die, log: (m) => console.log(m) });
    return { result, forced, crops, journeys };
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
  let residual = s.value.replace(/var\(--[\w-]+(?:,[^)]*)?\)/g, "").replace(/calc\(|\)|\*|\s|!important/g, "").replace(/^-1$/, "");
  // a .tm-text-* class is a text style token (tokens.text.<style>): its typed font values are that token's values
  const TEXT_KEY = { "font-size": "fontSize", "line-height": "lineHeight", "font-weight": "fontWeight", "font-family": "fontFamily", "letter-spacing": "letterSpacing" };
  const tc = (s.selector || "").match(/^\.(tm-text-[\w-]+)$/);
  let textStyle = null;
  if (tc && TEXT_KEY[s.property] && T.m.textClasses[tc[1]]) {
    const p = [...T.m.textClasses[tc[1]], TEXT_KEY[s.property]];
    let v = T.native ??= JSON.parse(read(FILES.tokensJson)); for (const k of p) v = v?.[k];
    if (v !== undefined && typeof v !== "object") textStyle = `Text style, not a typed number: use ${T.tsName(p)} (${v}), part of ${T.tsName(T.m.textClasses[tc[1]])}.`;
  }
  const rec = { property: s.property, value: s.value, tokens, from: { selector: s.selector, file: s.file, line: s.line } };
  const finish = (r) => { if (s.appliesTo) r.appliesTo = s.appliesTo; if (s.inherited) r.inherited = true; return r; };
  if (textStyle && residual) { rec.exception = textStyle; return finish(rec, s); }
  // the mock prescription paper stands in for the customer's uploaded prescription image: the app shows the image, it doesn't draw it
  if (s.file === "app/screens/rx-paper.css" && residual) { rec.exception = "Mock prescription paper (sample content standing in for the customer's prescription image). The app shows the image; nothing here is built."; return finish(rec, s); }
  if (s.appliesTo) rec.appliesTo = s.appliesTo;
  if (s.inherited) rec.inherited = true;
  // D-98: red (raw) only for a typed size or colour; layout keywords, zeros and % are layout values, shown plainly
  if (residual && residual !== "-1") {
    const kind = rawKind(s.value);
    const ok = rawOkReason(s.file, s.line);
    if (EXCEPTIONS.some((x) => x.property === s.property && x.value === s.value)) rec.exception = EXCEPTIONS.find((x) => x.value === s.value).why;
    // a typed value the design system accepts on purpose (geometry, ≤3px optical nudge): marked raw-ok on its source line
    else if ((kind === "size" || kind === "colour") && ok !== null) rec.exception = `Documented exception: ${ok || "accepted typed value"}. Not a token on purpose; use the number as is.`;
    else if (kind === "size" || kind === "colour") { rec.raw = true; rec.kind = kind; rec.file = s.file; rec.line = s.line; }
    else if (kind === "timing") { rec.timing = true; rec.unresolved = "Typed on the web: use tokens.duration.* (the spinner: tokens.duration.spinner). See DECIDED o24. Don't type it."; }
    else rec.layout = true;
  }
  if (tokens.some((t) => t.unmapped || t.palette)) rec.raw = true;
  return rec;
}
const srcLines = {};
function rawOkReason(file, line) {   // the reason after "raw-ok:" on the declaration's source line, or null
  if (!file || !line || file === "inline") return null;
  const p = file === "design-system/truemeds.css" ? path.join(ROOT, "app/design-system/truemeds.css") : path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const l = (srcLines[p] ??= read(p).split("\n"))[line - 1] || "";
  const m = l.match(/raw-ok:?\s*([^*]*)\*\//);
  return m ? m[1].trim().replace(/\.$/, "") : null;
}
// every documented exception the screen's elements use (H19: matched by property, value, file and line)
function screenExceptions(states) {
  const m = new Map();
  for (const s of states) for (const e of s.elements || []) for (const st of e.styles) if (st.exception) {
    const k = `${st.from.file}:${st.from.line}:${st.property}:${st.value}`;
    const cur = m.get(k) || { property: st.property, value: st.value, from: st.from, reason: st.exception, documentedException: true, states: [], elements: [] };
    if (!cur.states.includes(s.id)) cur.states.push(s.id);
    if (!cur.elements.includes(e.id)) cur.elements.push(e.id);
    m.set(k, cur);
  }
  return [...m.values()].sort((a, b) => a.from.file.localeCompare(b.from.file) || a.from.line - b.from.line);
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
const DECP = (d, re, part) => {   // one ruling out of a decision bullet that lists several (split on ";")
  const raw = lineOf("decisions", re, `### ${d} ·`).replace(/^\s*-\s*\*\*[^*]+\*\*\s*/, "");
  const hit = raw.split(/;\s*|\.\s+(?=\(\d\))/).filter((x) => part.test(x)).map((x) => clean(x));
  if (!hit.length) die(`${d}: no part matches ${part}`);
  return { src: d, text: hit.map((x) => x.trim().replace(/\.$/, "")).join("; ") + "." };
};
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
    { id: "d01", topic: "Input and paste", q: "What does the mobile field accept, and how are typed or pasted numbers cleaned?", a: [AL(/Typing and pasting are cleaned/), DEC("D-39", /Impossible input is blocked silently/), DEC("D-39", /\*\*Leading 0\*\*/), CODE("Sign-in build", DOCS.auth, /if \(d\.length > MOBILE_LENGTH && d\.startsWith\("91"\)\) d = d\.slice\(2\);/, "A leading 91 is dropped only when more than 10 digits were entered (a 10-digit number starting 91 is kept):"), CODE("Sign-in build", DOCS.auth, /if \(d\.length > MOBILE_LENGTH\) return "signin\.long";/, "More than 10 digits are never cut; the field shows the error signin.long:")], refs: ["D-33", "D-39", "D-101"] },
    { id: "d02", topic: "Validation", q: "Which checks run, in what order, and when does each error appear?", a: [AL(/Checks, most basic first/), DEC("D-39", /format errors follow one pattern/)], refs: ["D-39"] },
    { id: "d03", topic: "Validation", q: "When does an error clear?", a: [DEC("D-39", /format errors follow one pattern/), { src: "Message rules", text: ["signin.empty", "signin.short", "signin.prefix"].map((k) => `${k}: clears on ${metadata[k].clear}; keeps the ${metadata[k].retain}`).join(" · ") }], refs: ["D-39"] },
    { id: "d04", topic: "Errors", q: "Where do errors show, and what does the field look like in error?", a: [DEC("D-33", /\*\*Errors:\*\*/), RUL("9.5", /^\| \*\*Field error\*\*/), RUL("L4", /^\| L4 \|/), RUL("L7", /^\| L7 \|/)], refs: ["D-33", "D-46", "D-47"] },
    { id: "d05", topic: "Server answers", q: "What can the server answer after Send OTP, and how is each answer shown?", a: [AL(/After sending, server results show as a notice/), { src: "Sign-in screen", text: notices.map((n) => `${n.answer}: ${n.tone} notice, icon \`${n.icon}\`, copy \`${n.copyKey}\`, role="${n.role}"`).join(" · ") }, RUL("9.5", /^\| \*\*Notice\*\*/)], refs: ["D-33", "D-54"] },
    { id: "d06", topic: "Server answers", q: "Does a server answer stay when the doctor edits the number?", a: [{ src: "Message rules", text: notices.map((n) => `${n.copyKey}: clears on ${metadata[n.copyKey].clear}`).join(" · ") }, CODE("Sign-in build", FILES.signInJs, /if \(changed && m\.notice\) \{ m\.notice = null; m\.button = "default"; \}/, "Changing the number clears the server notice and the button goes back to Send OTP (an answer belongs to the number it was for); nothing is remembered per number on the phone:")], refs: ["D-33"] },
    { id: "d28", topic: "Errors", q: "What colour is the placeholder text in the field?", a: [CODE("Design system", FILES.dsCss, /\.tm-field__control ::placeholder \{ color: var\(--tm-content-placeholder\); \}/, "tokens.color.content.placeholder (web --tm-content-placeholder):")], refs: [] },
    { id: "o06", topic: "Limits", q: "When the \"Try again in m:ss\" countdown ends, does the notice stay or go?", a: [AL(/When the "Try again in m:ss" countdown ends/), CODE("Sign-in build", FILES.signInJs, /if \(clock\.now\(\) >= m\.until\) \{ m\.button = "default"; m\.notice = null; \}/, "The build does exactly that:")], refs: ["D-98"] },
    { id: "o13", topic: "Tokens", q: "Which token is the busy spinner's ring?", a: [DECP("D-98", /^- \*\*Main thread rulings/, /spinner ring/), CODE("Design system", FILES.dsCss, /border: var\(--tm-spinner-ring\) solid var\(--tm-content-inverse\)/, "Ring width tokens.spinner.ring, colour tokens.color.content.inverse, box tokens.spinner.size:")], refs: ["D-98"] },
    { id: "o14", topic: "Logo", q: "react-native-svg may not draw the image the logo SVG embeds. What do we use on the phone?", a: [DECP("D-98", /^- \*\*Main thread rulings/, /native logo/), { src: "Kit", text: "PNG exports in foundation/brand/ (truemeds-for-doctors.png with the @1x / @2x / @3x density suffixes: 166, 332, 498 px wide), drawn tokens.logoLockup.width wide; source SVG and its sha256 in foundation/brand/logo.json." }], refs: ["D-98", "D-02"] },
    { id: "o20", topic: "Layout", q: "Is a server notice 8 or 16 below the field?", a: [DECP("D-98", /^- \*\*Main thread rulings/, /notice sits 16/), RUL("8.3", /^3\. \*\*Three gaps only:\*\*/)], refs: ["D-98"] },
    { id: "d29", topic: "Tokens", q: "Border widths, the focus ring, icon and spinner sizes and the logo width: are there tokens?", a: [DECP("D-98", /^- \*\*Decision/, /Sizes the Sign-in kit found/), { src: "Tokens", text: "tokens.borderWidth.default, tokens.focusRing.width / .offset, tokens.iconSize.sm / .md / .lg, tokens.spinner.size / .ring, tokens.logoLockup.width. The +91 prefix is messages['signin.phonePrefix']; the logo's accessible name is messages['signin.logoAlt']." }], refs: ["D-98"] },
    { id: "d27", topic: "Errors", q: "Can a field error and a server notice show at the same time?", a: [DEC("D-33", /\*\*Errors:\*\*/), RUL("9.5", /^\| \*\*Rule\*\*/), CODE("Sign-in build", FILES.signInJs, /helper\.hidden = !!m\.notice;/, "No. The notice and the helper / error line share one spot; typing a different number removes the notice first, then the format check runs:")], refs: ["D-33"] },
    { id: "d07", topic: "Sending", q: "What happens to the button and the field while the code is being sent?", a: [RUL("L2", /^\| L2 \|/), RUL("9.1", /^- \*\*States:\*\*/), FM("signin.sending")], refs: ["D-46", "D-54"] },
    { id: "d08", topic: "Limits", q: "Too many attempts: what does the button show, and how long is the wait?", a: [AL(/After sending, server results show as a notice/), DEC("D-35", /Keep wait time server-driven/), DEC("D-46", /Timer format is m:ss/), CODE("Sign-in build", DOCS.auth, /return `\$\{Math\.floor\(s \/ 60\)\}:\$\{String\(s % 60\)\.padStart\(2, "0"\)\}`;/, "Minutes are not capped, so 75 minutes shows 75:00; the time is rounded up, so it never shows 0:00 while waiting:"), FM("signin.too-many-tries")], refs: ["D-35", "D-46"] },
    { id: "d09", topic: "Limits", q: "Which limits are enforced on the server and which in the app?", a: [AL(/All OTP limits are enforced by the server/), DEC("D-35", /OTP issue cap is configurable/), DEC("D-34", /5 server-confirmed wrong OTP submissions/)], refs: ["D-34", "D-35"] },
    { id: "d10", topic: "Limits", q: "What happens when the doctor signs in with a number that is locked?", a: [AL(/Sign-in on a locked number/), FM("signin.locked-number")], refs: ["D-81"] },
    { id: "d11", topic: "Inactive account", q: "The account is inactive: what does the doctor see and what does the button do?", a: [AL(/After sending, server results show as a notice/), FM("signin.inactive"), OQ("OQ-021", /^\*\*Answered 2026-10-12/)], refs: ["D-33"] },
    { id: "d12", topic: "Sign-up", q: "Where does \"Sign up\" go, and what happens for a number that isn't registered?", a: [DEC("D-33", /^- \*\*Not registered:\*\*/), { src: "Message rules", text: `signin.signupLink: ${metadata["signin.signupLink"].next}` }, OQ("OQ-021", /^\*\*Answered 2026-10-12/)], refs: ["D-33"] },
    { id: "d13", topic: "Keyboard", q: "Does the keyboard open by itself on Sign-in, and where is Send OTP when it is open?", a: [DEC("D-43", /^- \*\*Rejected:\*\*/), DEC("D-43", /\*\*Button placement:\*\*/), RUL("8.9", /^9\. \*\*Keyboard clearance:\*\*/)], refs: ["D-43", "D-46"] },
    { id: "d30", topic: "Keyboard", q: "On a phone, can the keyboard ever cover the number field or Send OTP?", a: [{ src: "Agreed fix (phone feedback, D-44)", text: "No. Use a keyboard-avoiding layout on every screen with a text field: when a field gets focus, the field (with its label and helper) and the screen's main button sit above the keyboard, the button at least 16 px clear of it, on Android and iOS alike." }], refs: ["D-43", "D-44"] },
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
  { file: "keyboard", re: /demo and play use the phone's real keyboard\. \[MOCK ASSUMPTION\]/, id: "o09" },
];
const MOCK_SCAN = ["app/screens/sign-in.js", "app/screens/sign-in.css", "app/screens/entry-ctx.js", "app/core/auth.js", "app/data/links.js", "app/data/test-numbers.js", "app/shell/mock-keyboard.js"];
const MOCK_KEY = { "app/core/auth.js": "auth", "app/shell/mock-keyboard.js": "keyboard" };
function open() {
  for (const m of MOCKS) lineOf(m.file, m.re);
  // every [MOCK ASSUMPTION] in the sign-in build, and every mock setting the sign-in rules read, must map to an OPEN entry
  for (const f of MOCK_SCAN) for (const l of read(path.join(ROOT, f)).split("\n").filter((x) => /MOCK ASSUMPTION/.test(x)))
    if (!MOCKS.some((m) => MOCK_KEY[f] === m.file && m.re.test(l))) die(`${f}: [MOCK ASSUMPTION] not mapped to OPEN.md: ${l.trim()}`);
  const settingsUsed = [...new Set([...doc("auth").matchAll(/value\("(\w+)"\)/g)].map((x) => x[1]))];
  for (const k of settingsUsed) { const l = doc("settings").split("\n").find((x) => x.trim().startsWith(k + ":"));
    if (l && /MOCK ASSUMPTION/.test(l) && !MOCKS.some((m) => m.file === "settings" && m.re.test(l))) die(`settings ${k}: mock value not mapped to OPEN.md`); }
  const checkIds = (items) => { for (const m of MOCKS) if (!items.some((o) => o.id === m.id)) die(`MOCK mapped to ${m.id}, which is not in DECIDED.md`); return items; };
  const signInSettings = doc("settings").split("\n").filter((l) => /MOCK ASSUMPTION/.test(l) && /OQ-017/.test(l));
  // D-101 (and its same-day amendment): every Sign-in question is answered. Product items quote D-101; Backend / Design
  // items take the prototype's own value, marked [MOCK] and keep configurable; o23 is the app team's; o09 a prototype note.
  const d101 = lineOf("decisions", /^- \*\*Decision \(Apurva, on the main/, "### D-101 ·");
  const D101 = (o) => { const part = d101.split(/\s(?=\(o\d\d\))/).find((x) => x.startsWith(`(${o})`)); if (!part) die(`D-101: no (${o})`); return { src: "D-101", text: clean(part.replace(/^\(o\d\d\)\s*/, "")) }; };
  const AMEND = { src: "D-101 (amended)", text: clean(lineOf("decisions", /^- \*\*Amended same day/, "### D-101 ·")) };
  const PRODUCT = ["o04", "o05", "o07", "o08", "o10", "o11", "o17", "o18", "o25", "o26"], MOCKED = ["o01", "o02", "o03", "o12", "o15", "o16", "o19", "o21", "o22", "o24"];
  return checkIds(asked().map((o) => {
    const prev = [o.now, ...(o.noteNow ? [{ src: "Prototype", text: o.noteNow }] : [])];
    if (PRODUCT.includes(o.id)) return { id: o.id, topic: o.topic, q: o.q, a: [D101(o.id)], refs: [...new Set(["D-101", ...o.refs])] };
    if (MOCKED.includes(o.id)) return { id: o.id, topic: o.topic, q: o.q, a: [{ src: "Prototype [MOCK]", text: `[MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: ${o.who}.` }, ...prev, AMEND], refs: [...new Set(["D-101", ...o.refs])] };
    if (o.id === "o23") return { id: o.id, topic: o.topic, q: o.q, a: [{ src: "D-101 (amended)", text: "The app team's choice: the kit does not set it." }, o.now], refs: ["D-101"] };
    if (o.id === "o09") return { id: o.id, topic: o.topic, q: o.q, a: [{ src: "D-101 (amended)", text: "Prototype only: no action for the app." }, o.now], refs: ["D-101"] };
    die(`Sign-in question ${o.id} has no D-101 ruling`);
  }));
  function asked() { return [
    { id: "o01", topic: "Limits", q: "How long are the OTP issue window, the number lock and the code life in production?", now: { src: "Prototype setting [MOCK]", text: "Code life and issue window 10 min (`otpWindow`), number lock 15 min after the 5th server-confirmed wrong code (`otpLock`, D-34), resend waits 30 s → 1 min → 2 min (`resendWaits`), 4 codes per window (D-35). `[MOCK ASSUMPTION]`" }, who: "Backend + Product", refs: ["OQ-017", "D-34", "D-35"] },
    { id: "o02", topic: "Limits", q: "How long is the \"Try again in m:ss\" wait after too many attempts?", now: { src: "Sign-in build", text: `The server sends the time the wait ends; the prototype uses ${signInSettings.map((l) => l.trim().split(":")[0]).join(", ")} as stand-ins (mock values, not product promises).` }, who: "Backend", refs: ["OQ-017", "D-35"] },
    { id: "o03", topic: "Server answers", q: "Send OTP again for the same number while the resend wait is still running: what does the server answer?", now: { src: "Sign-in build", text: "Assumed: no new code is sent; OTP opens on the running wait and the code already sent stays valid." }, who: "Backend", refs: [] },
    { id: "o04", topic: "Validation", q: "More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message?", now: DEC("D-39", /^- \*\*For review:\*\*/), who: "Product", refs: ["D-39"], noteNow: "Current build: extra digits are cut silently (no message); see d01." },
    { id: "o05", topic: "Offline", q: "Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)?", now: FM("signin.offline"), who: "Product", refs: ["D-65"], noteNow: "Current build: the offline notice appears only after Send OTP." },
    { id: "o07", topic: "Safe areas", q: "Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)?", now: RUL("8.13", /^13\. \*\*Logo lockup size and place/), who: "Product", refs: ["D-61"], noteNow: "The web build measures 16 from the top of the screen area (a browser has no status bar). No rule names the safe area for this screen." },
    { id: "o08", topic: "Navigation", q: "Android back gesture on Sign-in (the first screen): leave the app, or stay?", now: CODE("Sign-in build", FILES.signInJs, /setScreenBack\(null\);.*$/), who: "Product", refs: [] },
    { id: "o09", topic: "Keyboard", q: "The prototype draws a number keyboard in its pictures. Do we draw one?", now: { src: "Sign-in build", text: "No: the pictures show the phone's own number keyboard; the app uses the system keyboard (type tel)." }, who: "— (prototype only; no action)", refs: [] },
    { id: "o10", topic: "Edit after return", q: "Coming back from OTP (Change): is the number kept, and does the first typed digit replace it?", now: AL(/^- Back from OTP/), who: "Product", refs: [] },
    { id: "o11", topic: "Links", q: "Terms, Privacy and support links: final URLs, and where are they configured?", now: OQ("OQ-021", /^\*\*Safe placeholder:\*\*/), who: "Product + Ops", refs: ["OQ-021"], noteNow: "Sign-up URL and the Doctor Ops number are answered (d11, d12); only Terms and Privacy are open, and all links must be configurable." },
    { id: "o15", topic: "Server answers", q: "Send OTP API: endpoint, request and the shape of each answer (sent, locked, not registered, couldn't send, too many attempts, inactive). Does \"too many attempts\" return an end time or seconds left?", now: { src: "Sign-in build", text: "The web build fakes the server; it receives an end time for the wait. No contract exists yet." }, who: "Backend", refs: ["D-35"] },
    { id: "o16", topic: "Server answers", q: "How long does the app wait for Send OTP before showing \"Couldn't send the code.\"?", now: { src: "Sign-in build", text: "No timeout is defined; the web build answers at once." }, who: "Backend + Product", refs: [] },
    { id: "o17", topic: "Sign-up", q: "On the phone, does Sign up open the system browser or a browser inside the app?", now: { src: "Message rules", text: `signin.signupLink: ${metadata["signin.signupLink"].next}` }, who: "Product", refs: ["OQ-021"], noteNow: "On the web it opens a new tab." },
    { id: "o18", topic: "Server answers", q: "If the doctor changes the number and then types the old one back, should its earlier answer (too many attempts, inactive) show again without a new Send OTP?", now: { src: "Sign-in build", text: "No: the build remembers nothing per number; the answer shows again only after Send OTP (the server answers again)." }, who: "Product", refs: [] },
    { id: "o19", topic: "Platform", q: "Some web styles have no native equivalent: balanced line breaks for titles and notices (iOS), the subtitle's 31-character width limit, and the 2px focus ring for hardware keyboards. Drop or approximate?", now: { src: "Design rules", text: "Titles and notices wrap balanced (L8, d26); focus ring on buttons and links (d21)." }, who: "Design", refs: ["D-47"] },
    { id: "o21", topic: "Accessibility", q: "Is \"New to Truemeds? Sign up\" a link inside a sentence (exempt from the 48 tap target) or a standalone link (48 tall)?", now: RUL("8.6", /^6\. \*\*Tap targets:\*\*/), who: "Design", refs: [], noteNow: "Build: the link is about 20 tall; the visual must not change either way." },
    { id: "o22", topic: "Platform", q: "Should text grow with the phone's font-size setting (dynamic type), and is there a dark mode?", now: RUL("9.9", /^Dark mode · large text/), who: "Design + Product", refs: [] , noteNow: "Out of scope for the design system unless the project opts in; tokens are light only and fixed sizes." },
    { id: "o23", topic: "Platform", q: "Expo or bare React Native CLI, and which navigation library?", now: { src: "Kit", text: "Not set by the kit: the app team owns the components, screens and project set-up. Sign-in hands off to OTP (or locked OTP) after Send OTP (d10, d25)." }, who: "App team", refs: [] },
    { id: "o24", topic: "Motion", q: "How fast does the busy spinner turn, and does it stop when the phone's reduce-motion setting is on?", now: RUL("9.8", /^- Animations \(sheets, toasts\)/), who: "Design", refs: [], noteNow: "Use `tokens.duration.spinner` (800 ms): the web turns it once every 0.8 s and stops it under reduce motion." },
    { id: "o25", topic: "Copy", q: "\"New to Truemeds?\" and \"Sign up\" are two copy entries; the space between them is typed in code. One entry with a {link} placeholder instead?", now: { src: "Message rules", text: "Two keys today: signin.signup and signin.signupLink." }, who: "Product", refs: [] },
    { id: "o26", topic: "Inactive account", q: "What does \"Call Doctor Ops\" do on a device that can't make calls (tablet, no SIM)?", now: { src: "Kit", text: "Not defined. The support number also takes WhatsApp (d11)." }, who: "Product + Ops", refs: ["OQ-021"] },
    { id: "o12", topic: "Session", q: "How long does a signed-in session last before OTP is asked again?", now: OQ("OQ-017", /^\*\*Confirmed 2026-10-12:\*\*/), who: "Backend + Product", refs: ["OQ-017"] },
  ]; }
}
const APPLOGIC_MUST = [/When the "Try again in m:ss" countdown ends/, /Typing and pasting are cleaned/, /Checks, most basic first/, /After sending, server results show/, /Sign-in on a locked number/, /All OTP limits are enforced/, /^\| Sign-in \|/, /^Order on first use/, /\*\*Notices\*\* wrap balanced/];

// DECIDED / OPEN: one section per screen ("## <screen>"), an index table, then one entry per question
// ("### <id> · <question>", every answer line with its source, then its decision numbers).
const JOURNEY_TITLES = ["Sign-in", "OTP", "Faster sign-in offer", "Returning unlock", "Home", "Case page", "Prescribe"];
const NO_REF = "D-78 (the approved screens and app logic)";
function md(items, kind) {
  const L = [];
  const tbl = (s) => String(s).replace(/\|/g, "\\|");
  if (kind === "decided") {
    L.push("# DECIDED", "", "Questions already answered, by screen. **Check here before asking.** Each answer quotes its source; `D-xx` is a product decision number. `[MOCK]` = the prototype's own value or behaviour (it runs on a fake backend): build it, keep it configurable, and don't treat it as a production promise.", "Generated from the product rules — do not edit by hand.", "");
    for (const jt of JOURNEY_TITLES) {
      const its = items.filter((i) => (i.journey || "Sign-in") === jt);
      L.push(`## ${jt}`, "", "| # | Topic | Question |", "|---|---|---|", ...its.map((i) => `| [${i.id}](#${i.id}) | ${tbl(i.topic)} | ${tbl(i.q)} |`), "");
      for (const i of its) {
        L.push(`<a id="${i.id}"></a>`, `### ${i.id} · ${i.q}`, "");
        for (const a of i.a) L.push(`- ${a.text} — *Source: ${a.src}*`);
        L.push("", `Decisions: ${i.refs.length ? i.refs.join(", ") : NO_REF}`, "");
      }
    }
  } else {
    L.push("# OPEN", "", "Still open, by screen: only Product questions nobody has decided yet. Build with the **current assumption**, keep it easy to change, and ask the named owner. If your question is in neither DECIDED.md nor here, it is genuinely new: ask it.", "Generated from the product rules — do not edit by hand.", "");
    for (const jt of JOURNEY_TITLES) {
      const its = items.filter((i) => (i.journey || "Sign-in") === jt);
      L.push(`## ${jt}`, "");
      if (!its.length) { L.push("Nothing open for this screen.", ""); continue; }
      L.push("| # | Question | Who answers |", "|---|---|---|", ...its.map((i) => `| [${i.id}](#${i.id}) | ${tbl(i.q)} | ${i.who} |`), "");
      for (const i of its) {
        L.push(`<a id="${i.id}"></a>`, `### ${i.id} · ${i.q}`, "", `- **Current assumption:** ${i.noteNow ? i.noteNow + " " : ""}${i.now.text} — *Source: ${i.now.src}*`, `- **Who answers:** ${i.who}`);
        L.push(`- **References:** ${i.refs.length ? i.refs.join(", ") : NO_REF}`, "");
      }
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
      if (!p.states[key]) p.states[key] = { seenIn: `sign-in_${state}`, styles: e.styles.map((s) => ({ property: s.property, value: s.value, tokens: s.tokens.map((t) => ({ native: t.native, web: t.web, value: t.value })), ...(s.raw ? { raw: true, kind: s.kind, file: s.file, line: s.line } : {}), ...(s.layout ? { layout: true } : {}), ...(s.timing ? { timing: true, unresolved: s.unresolved } : {}), ...(s.exception ? { exception: s.exception } : {}), ...(s.inherited ? { inherited: true } : {}) })), size: `${e.box.w}×${e.box.h}` };
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
const EL_DECIDED = { "field-input": ["d01", "d02", "d14", "d28"], "field-helper": ["d03", "d04"], "field-control": ["d04"], notice: ["d05", "d06", "d26", "d27", "o20"], "notice-text": ["d05"], "notice-icon": ["d05"],
  submit: ["d07", "d08", "d11", "d24", "o06"], "submit-label": ["d07", "d08"], "submit-spinner": ["d07", "o13"], signup: ["d12", "d15"], "signup-link": ["d12"], logo: ["d19", "o14", "d29"], title: ["d17", "d20"], subtitle: ["d20"],
  keyboard: ["d13", "d14"], screen: ["d19"], hero: ["d19"], panel: ["d19"], field: ["d04"], "field-label": ["d20"], "field-prefix": ["d01"] };
function behaviourFor(e, state) {
  return { decided: (EL_DECIDED[e.id] || []).map((d) => `DECIDED.md#${d}`), state: `sign-in_${state}` };
}

// ---------------------------------------------------------------------------------------------------------------------
// Write files; manifest; CHANGES; --check
// ---------------------------------------------------------------------------------------------------------------------
function inputsHash() {
  const files = [FILES.tokensTs, FILES.tokensJson, FILES.iconsTs, FILES.messagesTs, FILES.messagesJson, FILES.metadataJson, FILES.approvedHtml,
    FILES.signInJs, FILES.signInCss, FILES.appCss, FILES.logo, FILES.dsCss, FILES.tokenBuild, FILES.tokenBuildNative, ...FILES.dsTokens, ...FILES.builder, ...FILES.capture,
    ...fs.readdirSync(path.join(ROOT, "app/design-system/fonts")).map((f) => path.join(ROOT, "app/design-system/fonts", f)),
    ...STATES.flatMap((s) => [PICTURE(s, 360), PICTURE(s, 390)]),
    // every journey: the whole built app it is measured from, and its approved pictures
    ...J.journeyInputs(ROOT), ...Object.values(J.journeyStates(ROOT)).flat().flatMap((st) => [J.pictureFile(ROOT, st, 360), J.pictureFile(ROOT, st, 390)])];
  const out = {};
  for (const f of [...new Set(files)]) out[rel(f)] = sha(fs.readFileSync(f));
  return out;
}
function docTexts(T) {   // everything quoted from the big documents (DECIDED, OPEN, block rules, state rules)
  for (const k of Object.keys(snippets)) delete snippets[k];
  const D = [...decided(T), ...open()].map((d) => ({ journey: "Sign-in", ...d }));
  const covered = D.flatMap((d) => d.a.map((a) => a.text)).join("\n");
  for (const re of APPLOGIC_MUST) { const line = clean(lineOf("appLogic", re)); if (!covered.includes(line)) die(`DECIDED/OPEN miss an app-logic rule: ${line}`); }
  // every other journey: generated from app-logic, the feedback map, settings and the code's [MOCK ASSUMPTION]s
  const JD = J.journeyDocs({ ROOT, read, doc, section, quote, cleanSafe: (s) => clean(s, true), die });
  const all = [...D, ...JD.items], O = JD.open;
  const stateRule = J.stateRuleFn({ docs: JD, doc, cleanSafe: (s) => clean(s, true), quote });
  const elementDecided = J.elementDecidedFn({ docs: JD });
  const rules = Object.fromEntries(Object.entries(BLOCKS).map(([k, b]) => [k, b.rules.map(([s, re]) => clean(lineOf("rules", re)))]));
  const stateRules = STATES.map((s) => [FM(`signin.${s}`).text, STATE_RULE[s] ? clean(lineOf("appLogic", STATE_RULE[s], "## 2. Sign-in")) : ""]);
  return { decidedMd: md(all, "decided"), openMd: md(O, "open"), rules, stateRules, D: all, O, JD, stateRule, elementDecided, snippetHash: Object.fromEntries(Object.entries(snippets).map(([k, v]) => [k, sha(v.join("\n"))])) };
}
function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? listFiles(path.join(dir, e.name), base) : [path.relative(base, path.join(dir, e.name)).split(path.sep).join("/")]);
}
const HAND = new Set([".gitignore", "README.md", "AGENTS.md", "CLAUDE.md", ".claude/skills/truemeds-native-ui/SKILL.md", "foundation/fonts/FONTS.md"]);
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
  // D-103: the whole-kit zip equals handoff/ (every file except the downloads folder, same bytes)
  const zp = path.join(OUT, "viewer/downloads", KIT_ZIP);
  if (fs.existsSync(zp)) {
    const ents = zipEntries(fs.readFileSync(zp)), want = kitFiles(OUT);
    const names = ents.map((e) => e.name);
    for (const f of want) if (!names.includes(f)) problems.push(`kit zip lacks: ${f}`);
    for (const e of ents) { const p = path.join(OUT, e.name); if (!want.includes(e.name)) problems.push(`kit zip has extra: ${e.name}`); else if ((zlib.crc32(fs.readFileSync(p)) >>> 0) !== e.crc) problems.push(`kit zip differs from handoff/${e.name}`); }
    for (const f of ["tokens.ts", "messages.ts", "icons.ts"]) if (sha(fs.readFileSync(path.join(OUT, "viewer/downloads", f))) !== sha(fs.readFileSync(path.join(OUT, "foundation", f)))) problems.push(`download differs: ${f}`);
  } else problems.push(`missing: handoff/viewer/downloads/${KIT_ZIP}`);
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
  // --reuse-capture (development only): reuse the last browser capture instead of measuring again
  const CACHE = path.join(ROOT, "docs/renders/2026-11-09-handoff-kit-all/tmp/capture");
  let cap;
  if (process.argv.includes("--reuse-capture") && fs.existsSync(path.join(CACHE, "cap.json"))) {
    cap = JSON.parse(read(path.join(CACHE, "cap.json")));
    for (const f of listFiles(path.join(CACHE, "files"))) { fs.mkdirSync(path.dirname(path.join(TMP, f)), { recursive: true }); fs.copyFileSync(path.join(CACHE, "files", f), path.join(TMP, f)); }
  } else {
    cap = await capture(TMP);
    fs.rmSync(CACHE, { recursive: true, force: true });
    for (const f of listFiles(TMP).filter((x) => /^(?:viewer\/shots|components\/pictures|foundation\/brand)\//.test(x))) { fs.mkdirSync(path.dirname(path.join(CACHE, "files", f)), { recursive: true }); fs.copyFileSync(path.join(TMP, f), path.join(CACHE, "files", f)); }
    fs.writeFileSync(path.join(CACHE, "cap.json"), JSON.stringify(cap));
  }
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
    rawValues: { about: "Typed sizes, colours or words that are not tokens / message keys: red in the viewer. Layout keywords, zeros and % are layout values (not flagged). builtApp should be empty; exceptions are documented, not red; approvedReference audits the approved reference file's screen CSS (its own review and capture scaffolding is excluded, D-98).",
      builtApp: dedupeRaw(A.rawAll), exceptions: EXCEPTIONS.map((x) => ({ ...x, documentedException: true, where: "app/screens/sign-in.css (subtitle)" })), approvedReference: audit },
  };
  // Sign-in states: plain name + "When this shows"; exceptions listed with their source line (H19)
  for (const s of A.states) { applyWhen(s, "sign-in"); s.built390 = s.pictures.built390; for (const e of s.elements) if (!e.behaviour.decided.length) e.behaviour.decided = s.rule.decided.map((d) => `DECIDED.md#${d}`); }
  screen.rawValues.exceptions = screenExceptions(A.states);
  // every text key of the screen, including messages for states that have no approved picture (e.g. signin.long)
  screen.copyKeys = Object.keys(messages).filter((k) => k.startsWith("signin."));
  W("screens/sign-in.json", JSON.stringify(screen) + "\n");
  // every other journey
  const AJ = J.assembleJourneys({ cap: cap.journeys, T, styleRecord, LONG, spacingOf, messages, read, ROOT, dt: { stateRule: dt.stateRule, elementDecided: dt.elementDecided }, die });
  const screens = [screen];
  const states = J.journeyStates(ROOT);
  for (const s of AJ.screens) {
    for (const st of s.states) {
      applyWhen(st, s.key);
      for (const w of [360, 390]) { fs.mkdirSync(path.join(TMP, "screens/pictures"), { recursive: true }); fs.copyFileSync(J.pictureFile(ROOT, states[s.key].find((x) => x.id === st.id), w), path.join(TMP, `screens/pictures/${st.id}_w${w}.png`)); }
      for (const e of st.elements) if (!e.behaviour.decided.length) e.behaviour.decided = st.rule.decided.map((d) => `DECIDED.md#${d}`);
    }
    const file = { screen: s.key, name: s.name, about: `Every element of every ${s.name} state. Facts measured from the built web app at 390 wide (density-independent points); tokens are the ones the applying CSS rule references. Schema: see AGENTS.md.`,
      widthMeasured: 390, states: s.states, tokensUsed: s.tokensUsed,
      rawValues: { about: "Typed sizes, colours or words that are not tokens / message keys: red in the viewer. Layout keywords, zeros and % are layout values (not flagged). Exceptions are documented on their source line, not red.",
        builtApp: dedupeRaw(AJ.rawAll.filter((r) => r.screen === s.key)), exceptions: screenExceptions(s.states) } };
    W(`screens/${s.key}.json`, JSON.stringify(file) + "\n");
    screens.push(file);
  }
  const blocks = mergeBlocks(A.blocks, AJ.blockSpec, screens);
  for (const b of blocks) W(`components/${b.block}.json`, JSON.stringify(b, null, 1) + "\n");
  W("DECIDED.md", dt.decidedMd + "\n"); W("OPEN.md", dt.openMd + "\n");
  // viewer
  W("viewer/truemeds.css", "/* Design-system stylesheet (comments removed), for the viewer's own look. Use foundation/tokens.ts in the app. */\n" + read(FILES.dsCss).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n{3,}/g, "\n\n"));
  for (const f of fs.readdirSync(FILES.dsFontsDir)) if (f.endsWith(".woff2")) { fs.mkdirSync(path.join(TMP, "viewer/fonts"), { recursive: true }); fs.copyFileSync(path.join(FILES.dsFontsDir, f), path.join(TMP, "viewer/fonts", f)); }
  W("viewer/index.html", VIEWER_HTML);
  W("viewer/viewer.js", VIEWER_JS);
  // CHANGES
  const allStates = screens.flatMap((s) => s.states);
  const allTokens = new Map(); for (const s of screens) for (const t of s.tokensUsed) allTokens.set(t.native, t.value);
  const keysUsed = [...new Set([...usedKeys, ...allStates.flatMap((s) => (s.elements || []).flatMap((e) => e.copyKeys || []))])].sort();
  const snap = { tokens: Object.fromEntries([...allTokens].map(([k, v]) => [k, JSON.stringify(v)])),
    blocks: Object.fromEntries(blocks.map((b) => [b.block, sha(JSON.stringify({ parts: b.parts, rules: b.rules }))])),
    screens: Object.fromEntries(allStates.map((s) => [s.id, sha(JSON.stringify((s.elements || []).map((e) => ({ ...e, box: undefined }))))])), copy: Object.fromEntries(keysUsed.map((k) => [k, messages[k]])) };
  const changes = changesMd(prev?.snapshot, snap, prev?.changes);
  W("CHANGES.md", changes.text);
  // downloads (D-103): single files + the whole kit as one zip (everything in handoff/ except the downloads folder)
  W("viewer/downloads/tokens.ts", read(FILES.tokensTs)); W("viewer/downloads/messages.ts", read(FILES.messagesTs)); W("viewer/downloads/icons.ts", read(FILES.iconsTs));
  W("viewer/downloads/fonts.zip", zipOf(TMP, listFiles(TMP).filter((f) => f.startsWith("foundation/fonts/")), (f) => f.replace(/^foundation\//, "")));
  W("viewer/downloads/logo.zip", zipOf(TMP, listFiles(TMP).filter((f) => f.startsWith("foundation/brand/") || f.startsWith("foundation/logo/")), (f) => f.replace(/^foundation\//, "")));
  // data.js shows each download's size; the kit zip contains data.js, so settle its size in a few passes
  const sizes = Object.fromEntries(["tokens.ts", "messages.ts", "icons.ts", "fonts.zip", "logo.zip"].map((f) => [f, kb(fs.statSync(path.join(TMP, "viewer/downloads", f)).size)]));
  for (let pass = 0, last = ""; pass < 4; pass++) {
    W("viewer/data.js", viewerData(screens, blocks, tokenIndex, dt, sizes));
    const z = zipOf(TMP, kitFiles(TMP));
    W(`viewer/downloads/${KIT_ZIP}`, z);
    if (kb(z.length) === last) break;
    sizes[KIT_ZIP] = last = kb(z.length);
    if (pass === 3) die("kit zip size did not settle");
  }
  // manifest
  const outputs = {};
  for (const f of listFiles(TMP)) if (!HAND.has(f) && !f.startsWith("foundation/fonts/")) outputs[f] = sha(fs.readFileSync(path.join(TMP, f)));
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.renameSync(TMP, OUT);
  fs.writeFileSync(MANIFEST, JSON.stringify({ about: "build-handoff.mjs state: source hashes, quoted-document hashes, generated-file hashes, last snapshot (for CHANGES.md).",
    inputs: inputsHash(), snippets: dt.snippetHash, outputs, snapshot: snap, changes: changes.log }, null, 1) + "\n");
  const raws = screens.reduce((n, s) => n + s.rawValues.builtApp.length, 0);
  console.log(`handoff/ built: ${screens.length} screens, ${allStates.length} states, ${allStates.reduce((n, s) => n + (s.elements || []).length, 0)} element records, ${blocks.length} blocks, ${allTokens.size} tokens used, ${raws} raw values in the built app, ${audit.length} in the Sign-in reference file; ${changes.summary}`);
}

// ---------------------------------------------------------------------------------------------------------------------
// All journeys: state names and "When this shows", merged block specs, viewer data, downloads
// ---------------------------------------------------------------------------------------------------------------------
function applyWhen(st, screenKey) {
  const w = WHEN[st.id];
  if (!w || !w.name || !w.shows || !w.next) die(`build-handoff.when.mjs: no name / shows / next for ${st.id}`);
  st.name = w.name;
  st.when = { shows: w.shows, next: w.next };
  if (!st.rule.decided?.length) die(`${st.id}: no answered questions linked`);
}
const DS_BLOCK_RULES = {   // design-system blocks used by the new journeys: rules quoted from the design rules
  sheet: [/^\| \*\*Sheet\*\*/, /^- \*\*Sheet template/],
  toast: [/^\| \*\*Toast\*\*/],
  chip: [/^\| \*\*Chip/],
  actionbar: [/^\| \*\*Action bar\*\*/],
};
function blockRules(name, usedIn, screens) {
  const out = [];
  for (const re of DS_BLOCK_RULES[name] || []) { const l = doc("rules").split("\n").find((x) => re.test(x)); if (l) out.push({ section: "Design rules", text: clean(lineOf("rules", re)) }); }
  const on = [...new Set(screens.filter((s) => s.states.some((x) => usedIn.includes(x.id))).map((s) => s.name || "Sign-in"))];
  out.push({ section: "Kit", text: `Build it once from the parts × states below (tokens only, copy from messages); it appears on ${on.join(", ")}. What it does in each state is in DECIDED.md under those screens.` });
  return out;
}
function mergeBlocks(signInBlocks, spec, screens) {
  const byName = new Map(signInBlocks.map((b) => [b.block, { ...b, usedIn: [...b.usedIn] }]));
  for (const [name, s] of Object.entries(spec)) {
    const pascal = name.split(/[-_]+/).filter(Boolean).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
    const b = byName.get(name) || { block: name, name: pascal, rn: `<${pascal} />`, web: `.${name}`, parts: {}, rules: null, pictures: [], usedIn: [] };
    for (const [part, p] of Object.entries(s.parts)) { const bp = (b.parts[part] ??= { states: {} }); for (const [k, v] of Object.entries(p.states)) if (!bp.states[k]) bp.states[k] = v; }
    for (const id of s.usedIn) if (!b.usedIn.includes(id)) b.usedIn.push(id);
    byName.set(name, b);
  }
  // every element of every screen has its block, part and state in a spec (Sign-in's unnamed blocks, e.g. the keyboard, too)
  for (const scr of screens) for (const st of scr.states) for (const e of st.elements || []) {
    const pascal = e.block.split(/[-_]+/).filter(Boolean).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
    const b = byName.get(e.block) || { block: e.block, name: pascal, rn: `<${pascal} />`, web: `.${e.block}`, parts: {}, rules: null, pictures: [], usedIn: [] };
    const p = (b.parts[e.part] ??= { states: {} });
    if (!Object.keys(p.states).some((k) => k.includes(e.blockState))) {
      const key = e.variant === "default" ? e.blockState : `${e.variant}${e.blockState === "default" ? "" : " · " + e.blockState}`;
      p.states[key.includes(e.blockState) ? key : `${key} · ${e.blockState}`] = { seenIn: st.id, styles: e.styles.map(J.slim), size: `${e.box.w}×${e.box.h}` };
    }
    if (!b.usedIn.includes(st.id)) b.usedIn.push(st.id);
    byName.set(e.block, b);
  }
  for (const b of byName.values()) {
    if (!b.rules) b.rules = blockRules(b.block, b.usedIn, screens);
    // one list of the block's states (part × state keys), for a quick read and the H20 join
    const states = {};
    for (const [part, p] of Object.entries(b.parts)) for (const k of Object.keys(p.states)) (states[k] ??= []).push(part);
    b.states = states;
  }
  return [...byName.values()].filter((b) => b.usedIn.length).sort((a, b) => a.block.localeCompare(b.block));
}
const KIT_ZIP = "truemeds-doctor-app-kit.zip";
const kitFiles = (dir) => listFiles(dir).filter((f) => !f.startsWith("viewer/downloads/")).sort();
// Deterministic zip (stored + deflate, fixed date): the same kit always gives the same bytes, so --check can compare.
function zipOf(dir, files, name = (f) => f) {
  const local = [], central = [];
  let off = 0;
  for (const f of [...files].sort()) {
    const data = fs.readFileSync(path.join(dir, f));
    const def = zlib.deflateRawSync(data, { level: 9 });
    const useDef = def.length < data.length;
    const body = useDef ? def : data, crc = zlib.crc32(data), n = Buffer.from(name(f));
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(useDef ? 8 : 0, 8);
    h.writeUInt16LE(0, 10); h.writeUInt16LE(0x5b6a, 12); h.writeUInt32LE(crc >>> 0, 14); h.writeUInt32LE(body.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(n.length, 26); h.writeUInt16LE(0, 28);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(useDef ? 8 : 0, 10);
    c.writeUInt16LE(0, 12); c.writeUInt16LE(0x5b6a, 14); c.writeUInt32LE(crc >>> 0, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(0o100644 * 65536, 38); c.writeUInt32LE(off, 42);
    local.push(h, n, body); central.push(c, n);
    off += 30 + n.length + body.length;
  }
  const cd = Buffer.concat(central), e = Buffer.alloc(22);
  e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(files.length, 8); e.writeUInt16LE(files.length, 10); e.writeUInt32LE(cd.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...local, cd, e]);
}
// read a zip's central directory: [{ name, crc, size }] (for --check: the kit zip must equal handoff/)
function zipEntries(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const n = buf.readUInt16LE(eocd + 10), at = buf.readUInt32LE(eocd + 16), out = [];
  for (let i = 0, p = at; i < n; i++) { const len = buf.readUInt16LE(p + 28), extra = buf.readUInt16LE(p + 30), com = buf.readUInt16LE(p + 32);
    out.push({ name: buf.toString("utf8", p + 46, p + 46 + len), crc: buf.readUInt32LE(p + 16), size: buf.readUInt32LE(p + 24) }); p += 46 + len + extra + com; }
  return out;
}
const kb = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
function viewerData(screens, blocks, tokenIndex, dt, sizes = {}) {
  // the same style lists repeat across states: store each once (K.sets) and point to it by number
  const sets = [], seen = new Map();
  const intern = (v) => { const k = JSON.stringify(v); if (!seen.has(k)) { seen.set(k, sets.length); sets.push(v); } return seen.get(k); };
  const vStyle = (s) => ({ property: s.property, value: s.value, tokens: s.tokens.map((t) => ({ native: t.native, web: t.web, value: t.value, ...(t.via?.length ? { via: t.via } : {}) })),
    ...(s.raw ? { raw: true } : {}), ...(s.layout ? { layout: true } : {}), ...(s.exception ? { exception: s.exception } : {}), ...(s.timing ? { timing: true, unresolved: s.unresolved } : {}), ...(s.inherited ? { inherited: true } : {}) });
  const tabs = TABS.map((t) => {
    const src = screens.find((s) => s.screen === t.screen);
    const states = src.states.filter((s) => !t.filter || t.filter(s.id));
    const ids = new Set(states.map((s) => s.id));
    // tokens used on this tab (Foundation filter); raw values for its states
    const used = new Map();
    for (const s of states) for (const e of s.elements || []) for (const st of e.styles) for (const tk of st.tokens) if (tk.native) used.set(tk.native, true);
    return { key: t.screen, tab: t.tab, name: t.name, file: `screens/${t.screen}.json`,
      states: states.map((s) => ({ id: s.id, name: s.name, when: s.when, built: s.built !== false, ...(s.later ? { later: s.later } : {}), pictures: s.pictures, rule: { decided: s.rule.decided },
        elements: (s.elements || []).map((e) => ({ id: e.id, block: e.block, part: e.part, variant: e.variant, blockState: e.blockState, box: e.box, copy: e.copy, ...(e.icon ? { icon: e.icon } : {}),
          st: intern(e.styles.map(vStyle)), sp: intern(e.spacing || {}), ...(e.accessibility?.name ? { sr: e.accessibility.name } : {}) })) })),
      tokensUsed: [...used.keys()].sort(), rawValues: { builtApp: src.rawValues.builtApp.filter((r) => r.states.some((x) => ids.has(x) || ids.has(`sign-in_${x}`))) } };
  });
  const strip = (t) => String(t ?? "").replace(/\s*\[(?:RECOMMENDED|PROPOSED|LOCKED)\]/g, "").replace(/\s*\((?:see )?(?:RULES |Design rules )?§\s?\d+(?:\.\d+)*[a-z]?\)/g, "").replace(/\s*(?:RULES |Design rules )?§\s?\d+(?:\.\d+)*[a-z]?/g, "").replace(/\s+([.,;:])/g, "$1");
  const vb = blocks.map((b) => ({ block: b.block, name: b.name, rn: strip(b.rn), web: b.web, rules: b.rules.map((r) => ({ text: strip(r.text) })), pictures: b.pictures, usedIn: b.usedIn,
    parts: Object.fromEntries(Object.entries(b.parts).map(([p, v]) => [p, { states: Object.fromEntries(Object.entries(v.states).map(([k, s]) => [k, { size: s.size, ...(s.changesOnly ? { changesOnly: true } : {}), st: intern(s.styles.map(vStyle)) }])) }])) }));
  const files = [["tokens.ts", "Design values for React Native"], ["messages.ts", "Every piece of app text"], ["icons.ts", "The icon set"], ["fonts.zip", "Plus Jakarta Sans, 4 weights + licence"], ["logo.zip", "The logo: SVG + PNG at 1x, 2x, 3x"]];
  return "// Generated — the same facts as screens/*.json and components/*.json, for the viewer (opens from disk, no server).\nwindow.KIT = " +
    JSON.stringify({ screens: tabs, blocks: vb, sets, tokenIndex: tokenIndex.map((t) => ({ native: t.native, ts: t.ts, web: t.web, value: t.value, ...(/^alias of/.test(t.source || "") ? { via: t.source.replace(/^alias of /, "") } : {}) })),
      decided: dt.D.map((d) => ({ id: d.id, q: d.q })), open: dt.O.map((o) => ({ id: o.id, q: o.q })) }) + ";\n" +
    `window.KIT_VERSION = ${JSON.stringify(`All screens · ${new Date().toISOString().slice(0, 10)}`)};\n` +
    "window.KIT_DOWNLOADS = " + JSON.stringify([{ main: true, href: `downloads/${KIT_ZIP}`, label: "Download the whole kit (.zip)", what: "Everything: this viewer, design values, text, icons, fonts, logo, answers, AI instructions", size: sizes[KIT_ZIP] || "" },
      ...files.map(([f, what]) => ({ href: `downloads/${f}`, label: f, what, size: sizes[f] }))]) + ";\n";
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
  return [...m.values()].sort((a, b) => String(a.file).localeCompare(String(b.file)) || a.line - b.line);
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
// Viewer (static; opens by double-click; reads data.js). D-103 design: Start here (how-to, four lines, downloads),
// Foundation (values, "used on <screen>" filter), Building blocks ("Where it's used"), Screens (a tab per screen,
// phone fixed left, right panel: When this shows → tapped element → pick from a list).
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
main.v { max-width: 1180px; margin: 0 auto; padding: var(--tm-space-lg) var(--tm-space-page) 48px; }
.v h1 { font-size: var(--tm-font-size-title-lg); line-height: var(--tm-font-lineheight-2xl); margin: 0 0 var(--tm-space-sm); }
.v h2 { font-size: 20px; line-height: 28px; margin: var(--tm-space-2xl) 0 var(--tm-space-sm); }
.v h3 { font-size: 16px; line-height: 24px; margin: var(--tm-space-lg) 0 var(--tm-space-xs); }
.v p, .v li { color: var(--tm-content-secondary); }
.v code { font-size: 13px; background: var(--tm-surface-tertiary); padding: 1px 4px; border-radius: 4px; color: var(--tm-content-primary); overflow-wrap: anywhere; }
.v table { width: 100%; border-collapse: collapse; background: var(--tm-surface-primary); font-size: 13px; line-height: 18px; }
.v th, .v td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--tm-border-subtle); overflow-wrap: anywhere; }
.v th { color: var(--tm-content-secondary); font-weight: var(--tm-font-weight-semibold); }
.tblwrap { overflow-x: auto; }
/* raw values (typed, not a token): shown in red */
.raw, .raw code { color: var(--tm-content-error) !important; }
tr.raw td { background: var(--tm-feedback-error-surface); }
.swatch { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: -2px; margin-right: 4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.card { background: var(--tm-surface-primary); border-radius: var(--tm-radius-lg); padding: var(--tm-space-lg); margin: var(--tm-space-sm) 0; box-shadow: var(--tm-shadow-card); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: var(--tm-space-sm) 0; }
.chips button { border: 1px solid var(--tm-border-default); background: var(--tm-surface-primary); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 13px; min-height: 36px; cursor: pointer; }
.chips button[aria-pressed="true"] { border-color: var(--tm-border-selected); background: var(--tm-surface-brand-subtle); color: var(--tm-content-brand); }
.scrtabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 0 0 var(--tm-space-sm); border-bottom: 1px solid var(--tm-border-subtle); padding-bottom: var(--tm-space-sm); }
.scrtabs button { font: inherit; font-weight: var(--tm-font-weight-semibold); border: 0; background: none; padding: 8px 12px; border-radius: var(--tm-radius-md); color: var(--tm-content-secondary); min-height: 40px; cursor: pointer; }
.scrtabs button[aria-current="true"] { background: var(--tm-surface-brand-subtle); color: var(--tm-content-brand); }
.stage { display: grid; grid-template-columns: 390px minmax(0, 1fr); gap: var(--tm-space-lg); align-items: start; }
.shot { position: sticky; top: 64px; width: 390px; margin: 0; }
.shot .frame { position: relative; }
.shot img { width: 390px; display: block; border-radius: 12px; box-shadow: var(--tm-shadow-card); }
.shot .hit { position: absolute; border: 1px dashed transparent; cursor: pointer; background: none; padding: 0; }
.shot .hit:hover { border-color: var(--tm-border-focus); }
.shot .hit.sel { border: 2px solid var(--tm-border-focus); background: rgba(38,108,225,.08); }
.shot figcaption { font-size: 12px; color: var(--tm-content-secondary); margin-top: 4px; }
.panel { position: sticky; top: 64px; max-height: calc(100vh - 80px); overflow-y: auto; padding-right: 4px; min-width: 0; }
.panel .card:first-child { margin-top: 0; }
.card.when { border-left: 4px solid var(--tm-border-selected); }
.card.when .label { margin: var(--tm-space-sm) 0 0; font-size: 13px; font-weight: var(--tm-font-weight-semibold); color: var(--tm-content-primary); }
.card.when p { margin: 4px 0; }
.card.hint p { margin: 0; }
details.ans summary, details.elfold summary { cursor: pointer; font-size: 13px; color: var(--tm-content-secondary); padding: 6px 0; }
details.ans ul { margin: 6px 0 0; padding-left: 18px; font-size: 13px; }
.ellist { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: var(--tm-space-sm); }
.ellist button { font: inherit; font-size: 12px; border: 1px solid var(--tm-border-subtle); background: var(--tm-surface-primary); border-radius: 6px; padding: 4px 8px; min-height: 32px; cursor: pointer; }
.ellist button[aria-pressed="true"] { border-color: var(--tm-border-selected); color: var(--tm-content-brand); }
.later { background: var(--tm-feedback-warning-surface); border-radius: var(--tm-radius-md); padding: var(--tm-space-sm) var(--tm-space-md); font-size: 13px; }
.blockpics { display: flex; gap: var(--tm-space-sm); flex-wrap: wrap; }
.blockpics figure { margin: 0; max-width: 100%; }
.blockpics img { max-width: 100%; max-height: 220px; border: 1px solid var(--tm-border-subtle); border-radius: 6px; background: #fff; }
.usedon { margin: var(--tm-space-sm) 0 var(--tm-space-lg); padding: var(--tm-space-md); background: var(--tm-surface-secondary); border-radius: var(--tm-radius-md); }
.usedon p { margin: 6px 0; }
a.uchip { display: inline-block; margin: 4px 6px 0 0; padding: 4px 10px; border: 1px solid var(--tm-border-default); border-radius: 999px; font-size: 13px; text-decoration: none; color: var(--tm-content-brand); background: var(--tm-surface-primary); }
.lede { font-size: 16px; color: var(--tm-content-primary) !important; }
ul.plain { padding-left: 18px; margin: 0; } ul.plain li { margin: 6px 0; }
.small { font-size: 13px; }
.dls { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--tm-space-sm); margin: var(--tm-space-sm) 0; }
a.dl { display: flex; flex-direction: column; gap: 2px; padding: 12px; border: 1px solid var(--tm-border-default); border-radius: var(--tm-radius-md); text-decoration: none; color: var(--tm-content-primary); background: var(--tm-surface-primary); }
a.dl span { font-size: 12px; color: var(--tm-content-secondary); }
a.dl-main { grid-column: 1 / -1; border-color: var(--tm-border-selected); background: var(--tm-surface-brand-subtle); }
a.dl-main b { color: var(--tm-content-brand); }
label.only { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; font-size: 14px; color: var(--tm-content-secondary); }
label.only select { font: inherit; padding: 4px 8px; }
.muted { color: var(--tm-content-tertiary); }
@media (max-width: 860px) { .stage { grid-template-columns: 1fr; } .shot, .panel { position: static; max-height: none; } }
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
const VIEWER_JS = String.raw`// Hand-off kit viewer. Static: reads window.KIT from data.js (generated): screens (one per tab, with states and their
// tokensUsed), blocks, tokenIndex, decided / open questions, downloads. No server needed.
(() => {
  const K = window.KIT, SCR = K.screens, $ = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sw = (v) => typeof v === "string" && /^(#|rgb)/.test(v) ? '<span class="swatch" style="background:' + esc(v) + '"></span>' : "";
  const val = (v) => typeof v === "object" ? (v.boxShadow ? v.boxShadow : JSON.stringify(v)) : v;
  const PROP = { "box-shadow": "shadow" };   // how React Native calls it
  const prop = (p) => PROP[p] || p;
  const via = (t) => t.via && t.via.length ? ' <span class=muted title="Defined as: ' + esc([].concat(t.via).join(" → ")) + '">ⓘ</span>' : "";
  const tokCell = (t) => t.native ? sw(t.value) + "<code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + via(t) + " · " + esc(val(t.value)) + "</span>" : '<span class="raw">' + esc(t.web) + " — not a native token</span>";
  const styleRows = (styles) => styles.map((s) => '<tr class="' + (s.raw ? "raw" : "") + '"><td><code>' + esc(prop(s.property)) + "</code>" + (s.inherited ? " <span class=muted>(from the parent)</span>" : "") + "</td><td>" +
    (s["tokens"].length ? s["tokens"].map(tokCell).join("<br>") : "") +
    (s.layout ? (s["tokens"].length ? "<br>" : "") + "<code>" + esc(s.value) + "</code> <span class=muted>layout value</span>" : "") +
    (s.exception ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.exception) + "</span>" : "") +
    (s.timing ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.unresolved) + "</span>" : "") +
    (!s["tokens"].length && !s.layout && !s.exception && !s.timing && !s.raw ? "—" : "") +
    (s.raw ? '<br><span class="raw">not a design value: <code>' + esc(s.value) + "</code></span>" : "") + "</td></tr>").join("");
  const nav = document.querySelector(".v-top"), main = document.getElementById("v");
  const tabs = { start: "Start here", foundation: "Foundation", blocks: "Building blocks", screens: "Screens" };
  // a click draws the new page at once (the address updates too, so Back and links keep working)
  const open = (h) => { if (location.hash.slice(1) !== h) history.pushState(null, "", "#" + h); go(h); };  for (const [k, l] of Object.entries(tabs)) { const b = $('<button type="button">' + l + "</button>"); b.onclick = () => { open(k); }; b.dataset.k = k; nav.append(b); }
  window.addEventListener("hashchange", () => go(location.hash.slice(1)));
  const blockOf = (id) => K.blocks.find((x) => x.block === id);
  const where = (stateId) => { for (const s of SCR) { const st = s.states.find((x) => x.id === stateId); if (st) return { s, st }; } return null; };
  function go(h) {
    const parts = (h || "start").split("/").map(decodeURIComponent), k = tabs[parts[0]] ? parts[0] : "start";
    nav.querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", String(x.dataset.k === k)));
    main.innerHTML = ""; ({ start, foundation, blocks, screens })[k](...parts.slice(1)); window.scrollTo(0, 0);
  }
  function start() {
    const D = window.KIT_DOWNLOADS || [];
    const dl = D.map((d) => '<a class="dl' + (d.main ? " dl-main" : "") + '" href="' + esc(d.href) + '" download><b>' + esc(d.label) + "</b><span>" + esc(d.what) + (d.size ? " · " + esc(d.size) : "") + "</span></a>").join("");
    const n = SCR.reduce((a, s) => a + s.states.length, 0);
    main.append($('<section><h1>Truemeds doctor app — hand-off kit</h1><p class="lede">How to use it: <b>Start with Screens. Tap anything. Check DECIDED before asking.</b></p>' +
      '<div class="card"><h3 style="margin-top:0">What is here</h3><ul class="plain">' +
      "<li><b>Screens</b>: every state of every screen (" + SCR.length + " tabs, " + n + " states). Tap a part of the phone to see what it is, its colours, sizes, spacing and text.</li>" +
      "<li><b>Building blocks</b>: the reusable parts (button, field, notice…) with every version of each, and where each is used. Build these once, use them everywhere.</li>" +
      "<li><b>Foundation</b>: every design value (colour, size, gap, corner) by the name you use in code.</li>" +
      '<li><b>Answers</b>: <a href="../DECIDED.md">DECIDED</a> (' + K.decided.length + ' questions already answered) · <a href="../OPEN.md">OPEN</a> (' + K.open.length + " still open, and who answers).</li></ul></div>" +
      '<div class="card"><h3 style="margin-top:0">Download</h3><div class="dls">' + dl + '</div><p class="muted small" style="margin:0">Using an AI coding tool? Download the whole kit and open it as a folder: the tool reads <code>AGENTS.md</code> on its own. Kit version ' + esc(window.KIT_VERSION || "") + ".</p></div></section>"));
  }
  function foundation() {
    main.append($('<section><h1>Foundation</h1><p>Every design value by the name you use in code (left). Download the files from <a href="#start">Start here</a>.</p></section>'));
    const only = $('<label class="only"><input type="checkbox"> Only values used on <select>' + SCR.map((s, i) => '<option value="' + i + '">' + esc(s.name) + "</option>").join("") + "</select></label>");
    const q = $('<input class="tm-input" placeholder="Filter (e.g. content, space, --tm-border)" style="width:100%;padding:12px;border:1px solid var(--tm-border-default);border-radius:8px;font:inherit;margin:8px 0">');
    const box = $('<div class="tblwrap"></div>');
    const cb = only.querySelector("input"), sel = only.querySelector("select");
    const draw = () => {
      const f = q.value.toLowerCase(), used = cb.checked ? new Set(SCR[+sel.value].tokensUsed) : null;
      box.innerHTML = "<table><thead><tr><th>Native (use this)</th><th>Web</th><th>Value</th></tr></thead><tbody>" + K.tokenIndex.filter((t) => !used || used.has(t.native)).filter((t) => !f || (t.native + t.web).toLowerCase().includes(f))
        .map((t) => "<tr><td><code>" + esc(t.ts) + "</code></td><td><code>" + esc(t.web) + "</code>" + via(t) + "</td><td>" + sw(t.value) + esc(val(t.value)) + "</td></tr>").join("") + "</tbody></table>";
    };
    q.oninput = draw; cb.onchange = draw; sel.onchange = draw; main.append(q, only, box); draw();
  }
  // Where a block is used, grouped by screen tab; each state opens Screens with that block's element selected.
  function usedOn(b) {
    const rows = [];
    for (const s of SCR) {
      const ids = s.states.filter((st) => b.usedIn.includes(st.id));
      if (!ids.length) continue;
      rows.push("<p><b>" + esc(s.name) + "</b> (" + ids.length + ")<br>" + ids.map((st) => { const el = (st.elements || []).find((e) => e.block === b.block);
        return '<a class="uchip" href="#screens/' + esc(s.tab) + "/" + esc(st.id) + (el ? "/" + esc(el.id) : "") + '">' + esc(st.name) + "</a>"; }).join("") + "</p>");
    }
    return '<div class="usedon"><h3 style="margin-top:0">Where it\'s used</h3>' + rows.join("") + "</div>";
  }
  function blocks(which) {
    main.append($('<section><h1>Building blocks</h1><p>The reusable parts. Build each once in React Native and reuse it. The React Native names are suggestions; you own the components.</p></section>'));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    const b = blockOf(which) || K.blocks[0];
    for (const x of K.blocks) { const c = $('<button type="button">' + esc(x.name) + "</button>"); c.setAttribute("aria-pressed", String(x === b)); c.onclick = () => { open("blocks/" + x.block); }; chips.append(c); }
    const sec = $('<section class="card"></section>');
    sec.innerHTML = "<h2 style=margin-top:0>" + esc(b.name) + "</h2><p><code>" + esc(b.rn) + "</code><br><span class=muted>web: " + esc(b.web) + "</span></p>" + usedOn(b) +
      (b.pictures.length ? '<div class="blockpics">' + b.pictures.map((p) => '<figure><img src="../' + esc(p.file) + '" alt="' + esc(b.name + " " + p.state) + '"><figcaption>' + esc(p.state) + "</figcaption></figure>").join("") + "</div>" : "") +
      Object.entries(b.parts).map(([part, p]) => "<h3>" + esc(part) + "</h3>" + Object.entries(p.states).map(([st, s]) => "<p><b>" + esc(st) + "</b>" + (s.size ? ' <span class=muted>' + esc(s.size) + "</span>" : "") + (s.changesOnly ? " <span class=muted>changes from default only</span>" : "") + '</p><div class="tblwrap"><table><tbody>' + styleRows(K.sets[s.st]) + "</tbody></table></div>").join("")).join("") +
      "<h3>Rules</h3><ul>" + b.rules.map((r) => "<li>" + esc(r.text) + "</li>").join("") + "</ul>";
    main.append(sec);
  }
  function screens(tab, stateId, elId) {
    const S = SCR.find((s) => s.tab === tab) || (stateId && where(stateId) || {}).s || SCR[0];
    const st = S.states.find((s) => s.id === stateId) || S.states[0];
    const bar = $('<nav class="scrtabs" aria-label="Screens"></nav>');
    for (const s of SCR) { const b = $('<button type="button">' + esc(s.name) + "</button>"); b.setAttribute("aria-current", String(s === S)); b.onclick = () => { open("screens/" + s.tab + "/" + s.states[0].id); }; bar.append(b); }
    main.append(bar);
    const chips = $('<div class="chips"></div>'); main.append(chips);
    for (const s of S.states) { const c = $('<button type="button">' + esc(s.name) + "</button>"); c.setAttribute("aria-pressed", String(s === st)); c.onclick = () => { open("screens/" + S.tab + "/" + s.id); }; chips.append(c); }
    const built = st.built !== false;
    const stage = $('<div class="stage"></div>');
    const shot = $('<figure class="shot"><div class="frame"><img alt="' + esc(st.name) + '" src="../' + esc(built ? st.pictures.built390 : st.pictures.w390) + '"></div><figcaption>' + (built ? "Tap any part · " : "") + "smallest supported phone: 360 wide</figcaption></figure>");
    const frame = shot.querySelector(".frame");
    const panel = $('<div class="panel"></div>');
    const els = st.elements || [];
    let sel = els.find((e) => e.id === elId) || null;
    for (const e of [...els].sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h)) {
      const h = $('<button type="button" class="hit" aria-label="' + esc(e.id) + '"></button>');
      Object.assign(h.style, { left: e.box.x / 3.9 + "%", top: e.box.y / 8.44 + "%", width: e.box.w / 3.9 + "%", height: e.box.h / 8.44 + "%" });
      h.onclick = (ev) => { ev.stopPropagation(); pick(e); }; h.dataset.id = e.id; frame.append(h);
    }
    stage.append(shot, panel); main.append(stage);
    function pick(e) { sel = e; history.replaceState(null, "", "#screens/" + S.tab + "/" + st.id + "/" + e.id); drawPanel(); }
    function drawPanel() {
      shot.querySelectorAll(".hit").forEach((h) => h.classList.toggle("sel", !!sel && h.dataset.id === sel.id));
      panel.innerHTML = "";
      const Q = (id) => (K.decided.find((d) => d.id === id) || {}).q || id;
      const ans = st.rule.decided;
      const when = $('<div class="card when"><h3 style="margin-top:0">When this shows</h3><p class="when-shows"></p><p class="label">What happens next</p><p class="when-next"></p>' +
        (ans.length ? '<details class="ans"><summary>Answered questions (' + ans.length + ")</summary><ul>" + ans.map((d) => '<li><a href="../DECIDED.md#' + esc(d) + '">' + esc(Q(d)) + "</a></li>").join("") + "</ul></details>" : "") + "</div>");
      when.querySelector(".when-shows").textContent = st.when.shows; when.querySelector(".when-next").textContent = st.when.next;
      panel.append(when);
      if (!built) panel.append($('<div class="card"><p class="later">' + esc(st.later) + "</p></div>"));
      if (built && !sel) panel.append($('<div class="card hint"><p>Tap any part of the phone (a button, the field, a line of text) to see how it is built.</p></div>'));
      if (sel) {
        const e = sel, sp = K.sets[e.sp] || {}, b = blockOf(e.block) || { name: e.block };
        const tok = (s) => s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>";
        panel.append($('<div class="card el"><h2 style="margin-top:0">' + esc(e.id) + '</h2><p><b>Block</b> <a href="#blocks/' + esc(e.block) + '" title="Every version, and where else it is used">' + esc(b.name) + "</a> · <b>part</b> " + esc(e.part) + " · <b>variant</b> " + esc(e.variant) + " · <b>state</b> " + esc(e.blockState) + "</p>" +
          (e.copy.length ? "<p><b>Text</b> " + e.copy.map((c) => c.copyKey ? "<code>messages['" + esc(c.copyKey) + "']</code>" + (c.values ? " with " + esc(JSON.stringify(c.values)) : "") + " (" + esc(c.slot) + ")" : c.literal ? '<span class="raw">typed text "' + esc(c.literal) + '" (' + esc(c.slot) + ")</span>" : "<span class=muted>" + esc(c.note || "") + "</span>").join("<br>") + "</p>" : "") +
          (e.icon ? "<p><b>Icon</b> <code>" + esc(e.icon.iconTs) + "</code> " + esc(e.icon.size ? e.icon.size.map((x) => Math.round(x)).join("×") : "") + "</p>" : "") +
          '<div class="tblwrap"><table><thead><tr><th>Property</th><th>Design value (native · web · value)</th></tr></thead><tbody>' + (styleRows(K.sets[e.st]) || "<tr><td colspan=2 class=muted>No styles: the phone draws this.</td></tr>") + "</tbody></table></div>" +
          (sp.above || sp.inside ? "<h3>Spacing</h3>" : "") +
          (sp.above ? "<p>" + esc(sp.above.px) + " above, to <b>" + esc(sp.above.neighbour) + "</b>: " + (sp.above.setBy.length ? sp.above.setBy.map((s) => esc(s.element + " " + prop(s.property) + " ") + tok(s)).join("; ") : "<span class=muted>layout (no spacing rule)</span>") + "</p>" : "") +
          (sp.inside ? "<p>Inside: " + sp.inside.map((s) => esc(prop(s.property) + " ") + tok(s)).join("; ") + "</p>" : "") +
          (e.sr ? "<h3>Screen reader label</h3><p>" + esc(e.sr) + "</p>" : "") + "</div>"));
      }
      if (els.length) {
        const fold = $('<details class="elfold"><summary>Can\'t tap it? Pick from a list</summary><div class="ellist"></div></details>'), list = fold.querySelector(".ellist");
        for (const e of els) { const b = $('<button type="button">' + esc(e.id) + "</button>"); b.setAttribute("aria-pressed", String(sel === e)); b.onclick = () => pick(e); list.append(b); }
        panel.append(fold);
      }
      const raws = S.rawValues.builtApp.filter((x) => x.states.includes(st.id) || x.states.includes(st.id.replace(/^sign-in_/, "")));
      if (raws.length) panel.append($('<div class="card"><h3 style="margin-top:0" class="raw">Not design values yet: ' + raws.length + '</h3><div class="tblwrap"><table><tbody>' + raws.map((x) => '<tr class="raw"><td><code>' + esc(prop(x.property) + ": " + x.value) + "</code></td><td>" + esc(x.elements.join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
      panel.scrollTop = 0;
    }
    drawPanel();
  }
  go(location.hash.slice(1));
})();
`;

if (CHECK) check(); else await build();
