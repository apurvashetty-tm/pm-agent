// Hand-off kit: every journey after Sign-in (OTP, faster sign-in offer, returning unlock, Home, case page, Prescribe).
// Called by scripts/build-handoff.mjs. Same contract as the Sign-in pilot (screen file, element record, block spec,
// DECIDED / OPEN format); the difference is how elements are found: Sign-in names its elements by hand, these journeys
// name them from the built markup (BEM classes: `block__part`, `block--variant`; design-system blocks are `tm-*`), so a
// new state or element needs no configuration. Everything is still read from the sources; nothing is typed into the kit.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// ---------------------------------------------------------------------------------------------------------------------
// Journeys: states come from the app's state map (one per approved picture), grouped by picture folder
// ---------------------------------------------------------------------------------------------------------------------
export const JOURNEYS = [
  { key: "otp", name: "OTP", folder: "otp", fmap: "## OTP", appLogic: [["## 2. Sign-in", /^\*\*OTP\*\*$/, /^\*\*Faster sign-in\*\*/]], code: ["app/screens/otp.js", "app/screens/otp.css", "app/screens/band.js", "app/screens/band.css", "app/core/auth.js"],
    settings: ["otpWindow", "otpLock", "resendWaits", "otpWrongLimit", "otpCodesPerWindow", "otpTriesLeftFrom"], rules: [["## 13.", /^\*\*OTP \(item 4/]] },
  { key: "faster-signin-offer", name: "Faster sign-in offer", folder: "faster-signin-offer", fmap: "## Faster sign-in offer", appLogic: [["## 2. Sign-in", /^\*\*Faster sign-in\*\*/, /^- Returning unlock:/]],
    code: ["app/screens/faster-signin-offer.js", "app/screens/faster-signin-offer.css", "app/screens/band.js", "app/screens/band.css"], settings: ["fasterOfferMax"], rules: [["## 13.", /^\*\*Pinned action bar \(item 1\)/]] },
  { key: "returning-unlock", name: "Returning unlock", folder: "returning-unlock", fmap: "## Returning unlock", appLogic: [["## 2. Sign-in", /^- Returning unlock:/, null], ["## 2. Sign-in", /^- Wording follows the phone/, null]],
    code: ["app/screens/returning-unlock.js", "app/screens/returning-unlock.css", "app/screens/band.js", "app/screens/band.css"], settings: ["returningUnlockFallbackAfter"], rules: [] },
  { key: "home", name: "Home", folder: "home", fmap: "## Availability and Home", appLogic: [["## 3. Home", null, null]],
    code: ["app/screens/home.js", "app/screens/home.css", "app/screens/band.js", "app/screens/band.css"], settings: ["nearExpiryWarning", "availabilityMinimum", "availabilityStep", "availabilityMaximum", "earningsPerConfirmedRx"], rules: [] },
  { key: "case", name: "Case page", folder: "case", fmap: ["## Case page exits", "## Case page — states"], appLogic: [["## 4. The case journey", null, null], ["## 5. Calls", null, null], ["## 6. Final buttons", null, null], ["## 7. Callback", null, null], ["## 9. Order details", null, null], ["## 10. Errors", null, null]],
    code: ["app/screens/case.js", "app/screens/case.css", "app/screens/callback-sheet.js", "app/screens/skip-ha-sheet.js", "app/screens/unavailable-sheet.js", "app/screens/rx-viewer.js", "app/screens/rx-paper.css", "app/screens/parts.js", "app/core/call-engine.js", "app/data/cases.js", "app/data/callback-slots.js"],
    settings: ["gate", "minCountedCall", "talkWindow", "noResultTimeout", "stillOnCallRepeat", "callRecordWait", "holdRetryGap", "holdRetryAttempts", "pollingInterval", "attemptGap"], rules: [["## 13.", /^\*\*Sheets over the bar/], ["## 13.", /^\*\*Busy states/], ["## 13.", /^\*\*Header edge/]] },
  { key: "prescribe", name: "Prescribe", folder: "prescribe", fmap: "## Prescribe", appLogic: [["## 8. Medicines", null, null], ["## 9. Order details", /^- \*\*Keyboard rule/, /^- \*\*Order details/]],
    code: ["app/screens/prescribe.js", "app/screens/prescribe.css"], settings: [], rules: [] },
];
// D-87: launch is Fallback B; version-A-only screens come later. The build draws a placeholder for them.
export const LATER = { note: "Version A only (Pilot route known at call start). Not in the launch build: launch is Fallback B (D-87). Picture kept for reference; not inspectable." };

export function stateMap(ROOT) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "app/state-map.js"), "utf8"), ctx);
  return ctx.window.TM_STATE_MAP;
}
export function journeyStates(ROOT) {
  const m = stateMap(ROOT);
  const out = {};
  for (const j of JOURNEYS) out[j.key] = m.pictures.filter((p) => p.picture.split("/")[0] === j.folder).map((p) => ({ id: p.id, picture: p.picture, version: p.version, behaviour: p.behaviour }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return out;
}
export const pictureFile = (ROOT, st, w) => path.join(ROOT, `ui-screens/${st.picture}_w${w}.png`);

// Every app file a journey's capture depends on (for --check). The review panel is prototype-only and excluded.
export function journeyInputs(ROOT) {
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name);
    if (fs.statSync(p).isDirectory()) { /* follows symlinked folders too */ if (!["review", "pictures", "icons"].includes(e.name) && !p.endsWith("app/design-system")) walk(p); }
    else if (/\.(?:js|css|html|svg)$/.test(e.name)) out.push(p); } };
  walk(path.join(ROOT, "app"));
  return out.sort();
}

// ---------------------------------------------------------------------------------------------------------------------
// Capture (browser): every visible element inside the phone frame and the 390 × 844 viewport
// ---------------------------------------------------------------------------------------------------------------------
const VIEW = { w: 390, h: 844 };
function sheetFileOf(u) {
  if (!u) return null;
  if (u.endsWith("/design-system/truemeds.css")) return "design-system/truemeds.css";
  const m = u.match(/\/(screens\/[\w-]+\.css)$/); if (m) return "app/" + m[1];
  if (u.endsWith("/shell/shell.css")) return "app/shell/shell.css";
  return null;   // review panel, drawn keyboard: not app UI
}
export async function captureJourneys({ browser, base, cascade, LONG, TEXT_PROPS, T, outDir, ROOT, die, log }) {
  const states = journeyStates(ROOT);
  const result = {};
  for (const j of JOURNEYS) {
    result[j.key] = {};
    for (const st of states[j.key]) {
      const t0 = Date.now();
      const pg = await browser.newPage({ viewport: { width: VIEW.w, height: VIEW.h }, deviceScaleFactor: 2 });
      const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
      await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
      const cdp = await pg.context().newCDPSession(pg);
      const sheets = {};
      cdp.on("CSS.styleSheetAdded", ({ header }) => { sheets[header.styleSheetId] = header.sourceURL; });
      await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
      await pg.goto(`${base}?capture=1&s=${st.id}&w=390`);
      await pg.evaluate(() => document.fonts && document.fonts.ready);
      await pg.waitForTimeout(450);
      // freeze the screen as drawn: live countdowns re-render every second and would swap nodes mid-capture
      await pg.evaluate(() => { const top = setTimeout(() => {}, 0); for (let i = Math.max(0, top - 5000); i <= top + 50; i++) { clearTimeout(i); clearInterval(i); } });
      if (errs.length) die(`${st.id}: page errors ${errs}`);
      const placeholder = await pg.evaluate(() => !!document.querySelector("#screen > .shell-picture"));
      if (placeholder) {
        if (st.version === "B") die(`${st.id}: launch state not built (placeholder picture)`);
        result[j.key][st.id] = { built: false };
        await pg.close(); continue;
      }
      const tagged = await pg.evaluate(({ VIEW }) => {
        const frame = document.querySelector("#frame"), fr = frame.getBoundingClientRect();
        const UTIL = /^(?:tm|kb|visually-hidden|is-[\w-]+|has-[\w-]+|tm-text-[\w-]+)$/;
        const seen = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !el.closest("[hidden]") && Number(cs.opacity) !== 0 &&
            r.bottom - fr.top > 0 && r.top - fr.top < VIEW.h && r.right - fr.left > 0 && r.left - fr.left < VIEW.w; };
        // a sheet / overlay covers what is under it: elements fully hidden behind an open sheet's scrim are still in the DOM but not seen
        const name = (el) => {
          const cls = [...el.classList].filter((c) => !UTIL.test(c));
          const tmPart = cls.find((c) => /^tm-[a-z0-9-]+__[a-z0-9-]+$/.test(c)), tmBlock = cls.find((c) => /^tm-[a-z0-9-]+$/.test(c));
          const ownPart = cls.find((c) => !c.startsWith("tm-") && c.includes("__") && !c.includes("--")), ownBlock = cls.find((c) => !c.startsWith("tm-") && !c.includes("__") && !c.includes("--"));
          if (tmPart) return { block: tmPart.split("__")[0], part: tmPart.split("__")[1], key: ownPart || ownBlock || tmPart };
          if (tmBlock) return { block: tmBlock, part: "container", key: ownPart || ownBlock || tmBlock };
          if (ownPart) return { block: ownPart.split("__")[0], part: ownPart.split("__")[1], key: ownPart };
          if (ownBlock) return { block: ownBlock, part: "container", key: ownBlock };
          if (el.id === "lockup") return { block: "logo-header", part: "lockup", key: "logo" };
          return null;
        };
        const out = [], used = {}, byEl = new Map();
        const list = [...frame.querySelectorAll("*")].filter((el) => !el.closest("svg") && !(el.parentElement && el.parentElement.closest(".tm-icon")) &&
          !(el.parentElement && el.parentElement.closest(".mock-kbd")) && seen(el));
        for (const el of list) {
          let n = name(el);
          const parentRec = (() => { for (let p = el.parentElement; p && p !== frame; p = p.parentElement) if (byEl.has(p)) return byEl.get(p); return null; })();
          if (el.classList.contains("mock-kbd")) n = { block: "system-keyboard", part: "keyboard", key: "keyboard" };
          if (el.id && !n) n = { block: parentRec ? parentRec.block : "screen", part: el.id, key: el.id };
          if (!n) n = { block: parentRec ? parentRec.block : "screen", part: el.tagName.toLowerCase(), key: (parentRec ? parentRec.id : "screen") + "-" + el.tagName.toLowerCase() };
          let id = n.key; used[id] = (used[id] || 0) + 1; if (used[id] > 1) id += "-" + used[id];
          const rec = { id, block: n.block, part: n.part };
          byEl.set(el, rec); el.dataset.kit = id;
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          const own = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(" ").replace(/\s+/g, " ").trim();
          const attrs = {}; for (const a of el.attributes) if (/^(?:aria-|role$|type$|inputmode$|autocomplete$|placeholder$|alt$|href$|target$|disabled$|readonly$)/.test(a.name)) attrs[a.name] = a.value;
          if (/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) { attrs.value = el.value; if (el.readOnly) attrs.readonly = ""; }
          if (/^(?:BUTTON|INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.disabled) attrs.disabled = "";
          out.push({ ...rec, tag: el.tagName.toLowerCase(), classes: [...el.classList], rect: { x: r.x - fr.left, y: r.y - fr.top, w: r.width, h: r.height }, text: own, attrs,
            focused: document.activeElement === el, display: cs.display, parent: parentRec ? parentRec.id : null, icon: el.dataset.icon || null,
            iconSize: el.classList.contains("tm-icon") ? [r.width, r.height] : null,
            interactive: /^(?:BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.getAttribute("role") === "button" || el.getAttribute("role") === "switch" || el.getAttribute("role") === "radio" });
        }
        return out;
      }, { VIEW });
      const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
      const elements = [];
      for (const t of tagged) {
        let styles = [], ax = null;
        if (t.block !== "system-keyboard") {
          const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-kit="${CSS_ESC(t.id)}"]` });
          if (!nodeId) die(`${st.id}: lost ${t.id}`);
          const m = await cdp.send("CSS.getMatchedStylesForNode", { nodeId });
          const sf = (id) => sheetFileOf(sheets[id]);
          styles = cascade(m.matchedCSSRules, sf, m.inlineStyle);
          if (t.text || t.tag === "input" || t.tag === "textarea" || t.icon) {
            for (const prop of TEXT_PROPS) {
              if (styles.some((s) => s.property === prop || (LONG[s.property] || []).includes(prop))) continue;
              for (const [i, inh] of (m.inherited || []).entries()) {
                const hit = cascade(inh.matchedCSSRules, sf).find((s) => s.property === prop || (s.property === "font" && prop !== "color"));
                if (hit) { styles.push({ ...hit, property: prop, inherited: true, inheritedDepth: i + 1 }); break; }
              }
            }
          }
          try { const a = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false }); const n = a.nodes.find((x) => !x.ignored) || a.nodes[0]; ax = { role: n?.role?.value, name: n?.name?.value || "" }; } catch { /* none */ }
        }
        elements.push({ ...t, styles, ax });
      }
      fs.mkdirSync(path.join(outDir, "viewer/shots"), { recursive: true });
      await pg.screenshot({ path: path.join(outDir, `viewer/shots/built-390_${st.id}.png`) });
      result[j.key][st.id] = { built: true, elements };
      await pg.close();
      log?.(`    ${st.id}: ${elements.length} elements, ${Date.now() - t0} ms`);
    }
    log?.(`  captured ${j.key}: ${states[j.key].length} states`);
  }
  return result;
}
const CSS_ESC = (s) => s.replace(/(["\\])/g, "\\$1");

// ---------------------------------------------------------------------------------------------------------------------
// Copy: match visible text to messages.ts (placeholders allowed); unmatched text is sample data, or typed copy if the
// journey's code types it
// ---------------------------------------------------------------------------------------------------------------------
export function copyMatcher(messages, codeText) {
  const res = Object.entries(messages).map(([k, v]) => [k, new RegExp("^" + v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s*\\\{link\\\}\s*/g, "\\s*(?<link>.*?)\\s*").replace(/\\\{(\w+)\\\}/g, "(?<$1>.+?)") + "$"), /\{\w+\}/.test(v)]);
  const LIT = Object.fromEntries(Object.entries(messages).map(([k, v]) => [k, v.replace(/\{\w+\}/g, "").replace(/[^A-Za-z]/g, "").length]));
  return (text, prefer, slot) => {
    const t = (text || "").replace(/\s+/g, " ").trim();
    if (!t) return null;
    let hits = res.filter(([, re]) => re.test(t));
    if (hits.length > 1) { const exact = hits.filter(([, , ph]) => !ph); if (exact.length) hits = exact; }
    // the template with the most fixed words wins ("Disabled: {reason}. …" over "{slot}: {dose}")
    if (hits.length > 1) { const best = Math.max(...hits.map(([k]) => LIT[k])); hits = hits.filter(([k]) => LIT[k] === best).concat(hits.filter(([k]) => LIT[k] !== best)); }
    if (hits.length > 1) { const lead = hits.filter(([k]) => LIT[k] === LIT[hits[0][0]]); const pre = lead.filter(([k]) => prefer.some((p) => k.startsWith(p))); if (pre.length) hits = pre.concat(hits.filter((h) => !pre.includes(h))); }
    // a template with no fixed words ("{n} {unit}") says nothing on its own: visible text that only matches one is data
    // (a name from the backend), or a value the app puts together with those keys (a dose, a duration)
    if (hits.length && LIT[hits[0][0]] === 0 && slot !== "aria-label") {
      const keys = hits.map((h) => h[0]); const mm = t.match(hits[0][1]); const first = mm.groups ? Object.values(mm.groups)[0] : "";
      if (/^[\d½¼¾]/.test(first)) return { data: t, note: "A value the app puts together, not copy: build it with " + keys.map((x) => "messages." + x).join(" / ") + "." };
      return { data: t, note: "Sample data (from the backend in the real app), not copy." };
    }
    if (hits.length) {
      const [k, re] = hits[0]; const mm = t.match(re);
      return { copyKey: k, ...(mm.groups ? { values: { ...mm.groups } } : {}), ...(hits.length > 1 ? { sameTextAs: hits.slice(1).map((h) => h[0]) } : {}) };
    }
    if (/^[\d½¼¾.,:\s]+$/.test(t)) return { data: t, note: "A value (number, dose, time or count), not copy." };
    if (codeText.includes(`"${t}"`) || codeText.includes(`'${t}'`) || codeText.includes("`" + t + "`")) return { literal: t };
    return { data: t, note: "Sample data (from the backend in the real app), not copy." };
  };
}
const PREFER = { otp: ["otp."], "faster-signin-offer": ["offer."], "returning-unlock": ["unlock."], home: ["home.", "availability.", "profile."], case: ["case.", "call.", "callback.", "rx."], prescribe: ["prescribe.", "rx."] };

// ---------------------------------------------------------------------------------------------------------------------
// Assemble: element records, per-state rules, block specs
// ---------------------------------------------------------------------------------------------------------------------
const BLOCK_ALIAS = { "tm-btn": "button", "tm-field": "field", "tm-notice": "notice", "tm-spinner": "spinner" };
export const blockName = (b) => BLOCK_ALIAS[b] || b.replace(/^tm-/, "");
const PASCAL = (s) => s.split(/[-_]/).filter(Boolean).map((x) => x[0].toUpperCase() + x.slice(1)).join("");
function blockStateOf(e, all) {
  const c = e.classes, a = e.attrs;
  const own = all.find((x) => x.id === e.id);
  if (c.some((k) => /--busy$/.test(k)) || a["aria-busy"] === "true") return "busy";
  if ("disabled" in a || a["aria-disabled"] === "true") return "disabled";
  if (c.some((k) => /--error$/.test(k)) || a["aria-invalid"] === "true") return "error";
  if (a["aria-pressed"] === "true" || a["aria-checked"] === "true" || a["aria-selected"] === "true" || c.some((k) => /--(?:selected|on|active)$/.test(k))) return "selected";
  if (own?.focused) return "focus";
  if ("readonly" in a) return "read-only";
  return "default";
}
function variantOfEl(e) {
  const root = e.classes.find((k) => k === `${e.rawBlock}`) ? e.rawBlock : e.rawBlock;
  const mods = e.classes.filter((k) => k.startsWith(root + "--")).map((k) => k.slice(root.length + 2));
  return mods.length ? mods.join(" · ") : "default";
}

export function assembleJourneys({ cap, T, styleRecord, LONG, spacingOf, messages, read, ROOT, dt, die }) {
  const states = journeyStates(ROOT);
  const screens = [], blockSpec = {}, rawAll = [], exceptions = [];
  for (const j of JOURNEYS) {
    // typed copy = text typed in screen code; text from app/data/ is sample data (the backend's in the real app)
    const codeText = j.code.filter((f) => !f.startsWith("app/data/")).map((f) => read(path.join(ROOT, f))).join("\n");
    const copyFor = copyMatcher(messages, codeText);
    const usedTokens = new Map();
    const out = [];
    for (const st of states[j.key]) {
      const c = cap[j.key][st.id];
      const rule = dt.stateRule(j, st);
      const base = { id: st.id, name: st.id, pictures: { w360: `screens/pictures/${st.id}_w360.png`, w390: `screens/pictures/${st.id}_w390.png` } };
      if (!c.built) { out.push({ ...base, built: false, later: LATER.note, rule, elements: [], tokensUsed: [] }); continue; }
      base.pictures.built390 = base.built390 = `viewer/shots/built-390_${st.id}.png`;
      const els = c.elements.map((e) => ({ ...e, rawBlock: e.block, block: blockName(e.block) }));
      const recs = {};
      for (const e of els) recs[e.id] = e.styles.map((s) => styleRecord(s, T));   // raw-ok exceptions are handled there
      const elements = els.map((e) => {
        const r = recs[e.id];
        const tokens = {};
        for (const s of r) for (const t of s.tokens) if (t.native) {
          (tokens[s.property] ??= []).push(t.native);
          const u = usedTokens.get(t.native) || { native: t.native, ts: t.ts, web: new Set(), value: t.value, states: new Set(), elements: new Set() };
          u.web.add(t.web); u.states.add(st.id); u.elements.add(e.id); usedTokens.set(t.native, u);
        }
        for (const s of r) if (s.raw) rawAll.push({ screen: j.key, state: st.id, element: e.id, ...s, file: s.file || s.from?.file, line: s.line || s.from?.line });
        const copies = [];
        if (e.text && /^rx-paper/.test(e.rawBlock)) copies.push({ slot: "text", data: "(sample prescription text)", note: "Mock prescription paper: sample content standing in for the customer's prescription image; not copied into the kit." });
        else if (e.text) copies.push({ slot: "text", ...copyFor(e.text, PREFER[j.key]) });
        if (e.attrs.placeholder) copies.push({ slot: "placeholder", ...copyFor(e.attrs.placeholder, PREFER[j.key]) });
        if (e.attrs["aria-label"]) { const cc = copyFor(e.attrs["aria-label"], PREFER[j.key], "aria-label"); if (cc.copyKey) copies.push({ slot: "aria-label", ...cc }); }
        if (e.attrs.alt) copies.push({ slot: "alt", ...copyFor(e.attrs.alt, PREFER[j.key]) });
        if ((e.tag === "input" || e.tag === "textarea") && e.attrs.value) copies.push({ slot: "value", data: e.attrs.value, note: "What the doctor typed (sample), not copy." });
        for (const cc of copies) if (cc.literal) {
          const file = j.code.find((f) => read(path.join(ROOT, f)).includes(cc.literal));
          const line = file ? read(path.join(ROOT, file)).split("\n").findIndex((l) => l.includes(cc.literal)) + 1 : 0;
          rawAll.push({ screen: j.key, state: st.id, element: e.id, raw: true, kind: "copy", property: cc.slot, value: cc.literal, file, line, from: { file, line, selector: "(text)" } });
        }
        const keys = copies.filter((x) => x.copyKey).map((x) => x.copyKey);
        const a = { role: e.ax?.role || null, name: e.ax?.name || "", size: `${Math.round(e.rect.w)}×${Math.round(e.rect.h)}` };
        for (const k of ["role", "aria-label", "aria-describedby", "aria-invalid", "aria-busy", "aria-disabled", "aria-pressed", "aria-checked", "aria-expanded", "aria-live", "alt", "type", "inputmode", "autocomplete"]) if (e.attrs[k] !== undefined) a[k === "role" ? "roleAttribute" : k] = e.attrs[k];
        if (e.interactive) a.target = Math.round(Math.min(e.rect.h, e.rect.w)) >= 48 ? "meets 48" : `below 48 (${Math.round(e.rect.w)}×${Math.round(e.rect.h)}; check the hit area)`;
        return {
          id: e.id, block: e.block, part: e.part, variant: variantOfEl(e), blockState: blockStateOf(e, els),
          rn: `${PASCAL(e.block)} [RECOMMENDED]`, appSelector: "." + e.classes.join(".") || e.tag,
          // the part inside the 390 × 844 screen (an element running past the fold keeps its full size in boxFull)
          box: clip(e.rect), ...(clip(e.rect).w !== rnd(e.rect.w) || clip(e.rect).h !== rnd(e.rect.h) ? { boxFull: { x: rnd(e.rect.x), y: rnd(e.rect.y), w: rnd(e.rect.w), h: rnd(e.rect.h) } } : {}),
          tokens, styles: r, spacing: spacingOf(e, els, recs), copy: copies,
          ...(copies.find((x) => x.copyKey && x.slot === "text") ? { copyKey: copies.find((x) => x.copyKey && x.slot === "text").copyKey } : {}),
          ...(keys.length ? { copyKeys: [...new Set(keys)] } : {}),
          ...(e.icon ? { icon: { name: e.icon, size: e.iconSize, iconTs: `icons['${e.icon}']` } } : {}),
          behaviour: { decided: dt.elementDecided(j, e, keys).map((d) => `DECIDED.md#${d}`), state: st.id },
          accessibility: a,
        };
      });
      out.push({ ...base, name: rule.name || st.id, ...(st.version === "A" ? { version: "A" } : {}), rule, elements, tokensUsed: [...new Set(elements.flatMap((x) => Object.values(x.tokens).flat()))].sort() });
      for (const e of elements) {
        const b = (blockSpec[e.block] ??= { parts: {}, usedIn: new Set(), first: {} });
        b.usedIn.add(st.id);
        const p = (b.parts[e.part] ??= { states: {} });
        const key = e.variant === "default" ? e.blockState : `${e.variant}${e.blockState === "default" ? "" : " · " + e.blockState}`;
        if (!p.states[key]) {
          p.states[key] = { seenIn: st.id, styles: e.styles.map(slim), size: `${e.box.w}×${e.box.h}` };
          if (e.part === "container" || !b.first[key]) b.first[key] = { state: st.id, el: e.id, box: e.box, part: e.part };
        }
      }
    }
    const tokensUsed = [...usedTokens.values()].map((u) => ({ native: u.native, ts: u.ts, web: [...u.web], value: u.value, states: [...u.states].length === out.filter((s) => s.built !== false).length ? "all" : [...u.states], elements: [...u.elements] })).sort((a, b) => a.native.localeCompare(b.native));
    screens.push({ key: j.key, name: j.name, states: out, tokensUsed });
  }
  return { screens, blockSpec, rawAll, exceptions };
}
const rnd = (v) => Math.round(v * 10) / 10;
const clip = (r) => { const x0 = Math.max(0, r.x), y0 = Math.max(0, r.y), x1 = Math.min(VIEW.w, r.x + r.w), y1 = Math.min(VIEW.h, r.y + r.h);
  const fl = (v) => Math.floor(Math.max(0, v) * 10) / 10;   // rounded down, so x + w and y + h stay inside the screen
  return { x: rnd(x0), y: rnd(y0), w: fl(x1 - rnd(x0)), h: fl(y1 - rnd(y0)) }; };
export const slim = (s) => ({ property: s.property, value: s.value, tokens: s.tokens.map((t) => ({ native: t.native, web: t.web, value: t.value })),
  ...(s.raw ? { raw: true, kind: s.kind, file: s.file || s.from?.file, line: s.line || s.from?.line } : {}), ...(s.layout ? { layout: true } : {}),
  ...(s.timing ? { timing: true, unresolved: s.unresolved } : {}), ...(s.exception ? { exception: s.exception } : {}), ...(s.inherited ? { inherited: true } : {}) });

// ---------------------------------------------------------------------------------------------------------------------
// DECIDED / OPEN for the journeys: generated from app-logic (every rule line of the journey's sections), the feedback map
// (every row of the journey's section), the settings (rule or [MOCK] stand-in) and every [MOCK ASSUMPTION] in the code.
// Questions are phrased from the rule's own lead; the answer is always the quoted rule.
// ---------------------------------------------------------------------------------------------------------------------
export function journeyDocs({ ROOT, read, doc, section, quote, cleanSafe, die }) {
  const items = [], open = [], ruleIndex = {};
  const settingsSrc = read(path.join(ROOT, "app/core/settings.js"));
  quote("settings", settingsSrc.split("\n").filter((l) => /source: "(?:rule|MOCK ASSUMPTION)"/.test(l)).join("\n"));
  const setting = (k) => {
    const l = settingsSrc.split("\n").find((x) => x.trim().startsWith(k + ":"));
    if (!l) die(`settings: no ${k}`);
    const m = l.match(/value:\s*(\[[^\]]*\]|[^,]+),.*source:\s*"([^"]+)",\s*ref:\s*"([^"]*)"/);
    if (!m) die(`settings: can't read ${k}`);
    return { key: k, value: m[1].trim(), mock: m[2] === "MOCK ASSUMPTION", ref: m[3] };
  };
  const human = (v) => v.replace(/^\[(.*)\]$/, (m, x) => x.split(/\s*,\s*/).join(" → ")).replace(/(\d+)\s*\*\s*MIN/g, "$1 min").replace(/(\d+)\s*\*\s*SEC/g, "$1 s");
  const lead = (t) => {
    const b = t.match(/^\*\*([^*]+)\*\*/); if (b) return b[1].replace(/[:.]$/, "").trim();
    return t.replace(/\*\*/g, "").split(/[.:(—]/)[0].split(" ").slice(0, 9).join(" ").trim();
  };
  const ruleLines = (sec, from, to) => {
    let lines = section("appLogic", sec).split("\n").slice(1);
    if (from) { const i = lines.findIndex((l) => from.test(l.trim())); if (i < 0) die(`app-logic ${sec}: no ${from}`); lines = lines.slice(i); }
    if (to) { const i = lines.findIndex((l, k) => k > 0 && to.test(l.trim())); if (i > 0) lines = lines.slice(0, i); }
    // join wrapped lines; keep bullets, table rows, paragraphs
    const out = [];
    for (const l of lines) {
      const t = l.trim();
      if (!t || /^---$/.test(t) || /^\|[-| ]+\|$/.test(t) || /^#/.test(t)) continue;
      if (/^\| #? ?\|/.test(t) || /^\| (?:Stage|Case type|Form|Scenario|Enter|#) \|/.test(t)) continue;   // table headers
      if (/^\*\*[^*]+\*\*$/.test(t)) continue;   // a bold sub-heading on its own
      out.push(t);
    }
    return out;
  };
  let n = {};
  const add = (j, it) => { n[j.key] = (n[j.key] || 0) + 1; const id = `${ID[j.key]}${String(n[j.key]).padStart(2, "0")}`; items.push({ id, journey: j.name, ...it }); return id; };
  for (const j of JOURNEYS) {
    ruleIndex[j.key] = [];
    // app-logic rule lines
    for (const [sec, from, to] of j.appLogic) for (const raw of ruleLines(sec, from, to)) {
      quote("appLogic", raw);
      const text = cleanSafe(raw).replace(/\s*\*Original flag:\*.*$/, "");   // export the answer, not the review history
      if (!text || (!raw.startsWith("|") && text.replace(/[^A-Za-z]/g, "").length < 12)) continue;   // table rows (e.g. dose lists) stay even when short
      const refs = [...new Set(raw.match(/D-\d+/g) || [])];
      const isRow = raw.startsWith("|");
      // a short table row (e.g. a dose list): label each cell with its column header so it reads on its own
      if (isRow) {
        const secLines = section("appLogic", sec).split("\n"); const at = secLines.findIndex((x) => x.trim() === raw);
        let h = at; while (h > 0 && !/^\|[-| ]+\|$/.test(secLines[h].trim())) h--;
        const head = h > 0 ? secLines[h - 1].split("|").map((x) => x.trim()).filter(Boolean) : null;
        const cells = raw.split("|").map((x) => x.trim()).filter(Boolean);
        if (head && head.length === cells.length && (head[0] === "Form" || text.replace(/[^A-Za-z]/g, "").length < 12)) {
          quote("appLogic", secLines[h - 1].trim());
          const t = cleanSafe(cells.slice(1).map((c, k) => `${head[k + 1]}: ${c}`).join(" · "));
          const id = add(j, { topic: "App rules", q: head[0] === "Form" ? `What doses can be picked for ${cells[0]}?` : `What are the ${head.slice(1).join(", ").toLowerCase()} for ${cells[0]}?`, a: [{ src: `App logic ${sec.replace(/^## /, "§").split(" ")[0]}`, text: t }], refs, raw });
          ruleIndex[j.key].push({ id, raw });
          continue;
        }
      }
      const cells = isRow ? raw.split("|").map((x) => x.trim()).filter(Boolean) : null;
      const q = isRow ? `What happens in "${cells[1] && cells[1].length < 60 ? cells[1].replace(/\*\*|`/g, "") : cells[0].replace(/\*\*|`/g, "")}"${cells[0] && /^\d|^\d+[a-f]$/.test(cells[0]) ? ` (state ${cells[0]})` : ""}?` : `What is the rule for "${lead(text)}"?`;
      const id = add(j, { topic: "App rules", q, a: [{ src: `App logic ${sec.replace(/^## /, "§").split(" ")[0]}`, text }], refs, raw });
      ruleIndex[j.key].push({ id, raw });
    }
    // extra rule paragraphs from app-logic §13 the journey follows
    for (const [sec, re] of j.rules) {
      const l = ruleLines(sec, re, /^\*\*/)[0];
      quote("appLogic", l); const text = cleanSafe(l);
      if (text) { const id = add(j, { topic: "Layout", q: `What is the rule for "${lead(l)}"?`, a: [{ src: "App logic §13", text }], refs: [...new Set(l.match(/D-\d+/g) || [])], raw: l }); ruleIndex[j.key].push({ id, raw: l }); }
    }
    // feedback map rows
    for (const fsec of [].concat(j.fmap)) {
      for (const l of section("fmap", fsec).split("\n").filter((x) => /^\| [a-z]+\.[\w-]+ \|/.test(x))) {
        quote("fmap", l);
        const c = l.split("|").map((x) => x.trim()).filter(Boolean);
        const text = cleanSafe(`${c[0]}: ${c[1]} — ${c[2]}`);
        if (!text) continue;
        const id = add(j, { topic: "States and feedback", q: `What does the app show in ${c[0]}, and how does it recover?`, a: [{ src: `Feedback state map: ${c[0]}`, text }], refs: [...new Set(l.match(/D-\d+/g) || [])], raw: l, fmapKey: c[0] });
        ruleIndex[j.key].push({ id, raw: l, fmapKey: c[0] });
      }
    }
    // settings: rule or prototype stand-in
    for (const k of j.settings) {
      const s = setting(k);
      // the setting's note may name people or working files: keep only what survives cleaning, else its decision numbers
      s.ref = cleanSafe(`(${s.ref})`).replace(/^\(|\)$/g, "") || (s.ref.match(/D-\d+(?: F\d+)?|OQ-\d+/g) || []).join(", ");
      add(j, { topic: "Limits and timings", q: `What is the value of "${k}"?`, a: [{ src: s.mock ? "Prototype setting [MOCK]" : "Setting (agreed rule)", text: s.mock
        ? `[MOCK] ${human(s.value)} in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: ${s.ref}.`
        : `${human(s.value)}. Agreed rule (${s.ref}). Read it from configuration; copy reads the value, never a typed number.` }], refs: [...new Set(s.ref.match(/D-\d+/g) || [])], mock: s.mock });
    }
  }
  // [MOCK ASSUMPTION] lines in each journey's code → DECIDED [MOCK] (D-101 amended: the kit is a prototype with a fake backend)
  for (const j of JOURNEYS) for (const f of j.code.filter((x) => x.endsWith(".js"))) {
    for (const l of read(path.join(ROOT, f)).split("\n").filter((x) => /MOCK ASSUMPTION|\[MOCK\]/.test(x))) {
      if (/settings|review tool|^import/.test(l) && !/ONGOING|Callback times|backend sends/.test(l)) continue;
      quote("code", l);
      const c = l.replace(/^\s*(?:\/\/|\*)\s*/, "").replace(/^.*?\/\/\s*/, "").replace(/\[MOCK ASSUMPTION[^\]]*\]|\[MOCK\]/g, "").trim();
      const text = cleanSafe(c);
      if (!text) continue;
      add(j, { topic: "Prototype stand-ins", q: `The prototype fakes this: "${lead(text)}". What do we build?`, a: [{ src: "Prototype [MOCK]", text: `[MOCK] ${text} Keep configurable; the real value or answer comes from the backend.` }], refs: [], mock: true });
    }
  }
  // Backend routing facts the kit must never invent (CLAUDE "never silently invent"): stated as the prototype's mock
  const caseJ = JOURNEYS.find((j) => j.key === "case");
  add(caseJ, { topic: "Prototype stand-ins", q: "What decides Cat4 vs Pilot, value vs non-value medicines, HA required and HA-skip eligibility?",
    a: [{ src: "App logic §6", text: cleanSafe(doc("appLogic").split("\n").find((l) => /^- What decides case type/.test(l))) }, { src: "Prototype [MOCK]", text: "[MOCK] The prototype reads them as fields on the sample case (case type, HA status). Keep them as backend fields; the app never works them out." }], refs: ["D-50"], mock: true });
  const rxJ = JOURNEYS.find((j) => j.key === "prescribe");
  add(rxJ, { topic: "Prototype stand-ins", q: "Does Prescribe or Disable save to the server, and what shows if that save fails?",
    a: [{ src: "Prototype [MOCK]", text: "[MOCK] No server call: the prototype keeps each Prescribe and Disable on the phone with the case, and everything is sent once, with the case's confirm button (Confirming…; an unclear result is checked, never sent twice, D-69). So Prescribe has no save-failure state. Keep it that way; if the backend later saves each medicine on its own, a save-failure state needs design first." }], refs: ["D-69"], mock: true });
  // Phone feedback before the final deploy (F-04 wheel, F-05 keyboard; wheel-keyboard run): plain-words rules for the native app
  const homeJ = JOURNEYS.find((j) => j.key === "home");
  add(homeJ, { topic: "Availability wheel", q: "How does the availability wheel behave on the phone?",
    a: [{ src: "Agreed fix (phone feedback, D-40)", text: "A native-feel wheel. The doctor swipes each column (hours, minutes); it moves with momentum and snaps to one row, and the row in the centre band is the value. Three rows are visible. Minutes go in 15-minute steps and the minimum is 15 minutes. Tapping the row above or below moves one step. While Setting… or Adding… the wheel is locked. iOS has a native wheel picker; Android's picker is a dropdown, so use a wheel component there (the app team's choice of library)." }], refs: ["D-40"] });
  const KEYBOARD = { topic: "Keyboard", q: "Where are the focused field and the main button when the phone's keyboard is open?",
    a: [{ src: "Agreed fix (phone feedback, D-44, D-81)", text: "Always above the keyboard: use a keyboard-avoiding layout on every screen with a text field. When a field gets focus, scroll so the field (with its label and helper) and the screen's main button sit above the keyboard, the button at least 16 px clear of it. On the case page and Prescribe the pinned action bar hides while the keyboard is open and comes back when it closes (D-81), so there the field alone is kept in view." }], refs: ["D-44", "D-81"] };
  for (const key of ["otp", "case", "prescribe"]) add(JOURNEYS.find((j) => j.key === key), { ...KEYBOARD });
  // Genuinely undecided Product questions stay OPEN (D-101 amended)
  const OQ = (q, re) => { const t = cleanSafe(section("oqs", `### ${q}`).split("\n").find((l) => re.test(l)) || ""); if (!t) die(`open_questions ${q}: no ${re}`); quote("oqs", t); return t; };
  open.push({ id: "o27", journey: "Home", topic: "No cases", q: "After \"No cases right now\", does the app check again by itself, and how often?", now: { src: "OQ-019", text: OQ("OQ-019", /^\*\*Safe placeholder:\*\*/) }, who: "Product", refs: ["OQ-019"], noteNow: "Prototype: no automatic re-check; the doctor taps Request a case again." });
  // o28 (re-offer after Not now, OQ-023) answered by D-104: now an app-logic rule and the fasterOfferMax setting (DECIDED)
  return { items, open, ruleIndex };
}
const ID = { otp: "otp-", "faster-signin-offer": "offer-", "returning-unlock": "unlock-", home: "home-", case: "case-", prescribe: "rx-" };

// State → its rule: the feedback-map row of its behaviour, the app-logic state-table row naming its render id, else the journey's first rule
export function stateRuleFn({ docs, doc, cleanSafe, quote }) {
  const table = doc("appLogic").split("\n").filter((l) => /^\| /.test(l));
  return (j, st) => {
    const idx = docs.ruleIndex[j.key];
    const fm = st.behaviour ? idx.find((r) => r.fmapKey === st.behaviour) : null;
    const row = table.find((l) => new RegExp("`" + st.id.replace(/[-]/g, "\\-") + "`").test(l));
    const named = idx.filter((r) => r.raw.includes(st.id) || (fm && r === fm));
    const decided = [...new Set([...(fm ? [fm.id] : []), ...named.map((r) => r.id), ...(row ? idx.filter((r) => r.raw === row).map((r) => r.id) : [])])];
    let name = st.id;
    if (row) { quote("appLogic", row); const c = row.split("|").map((x) => x.trim()).filter(Boolean); if (c[2] && !/`/.test(c[2])) name = `${c[0]} ${c[2]}`.replace(/\*\*/g, ""); }
    return { name, feedbackMap: fm ? `feedback-state-map: ${st.behaviour}` : null, pattern: fm ? docs.items.find((i) => i.id === fm.id).a[0].text : null,
      appLogic: row ? `App logic state table: ${cleanSafe(row)}` : `App logic: see the ${j.name} rules in DECIDED.md`, decided: decided.length ? decided : idx.slice(0, 3).map((r) => r.id) };
  };
}
export function elementDecidedFn({ docs }) {
  return (j, e, keys) => {
    const idx = docs.ruleIndex[j.key];
    const words = keys.map((k) => k.split(".").pop()).filter((w) => w.length > 3);
    return idx.filter((r) => keys.some((k) => r.raw.includes(k)) || (e.text && e.text.length > 6 && r.raw.includes(e.text))).slice(0, 4).map((r) => r.id)
      .concat(words.length ? [] : []);
  };
}
