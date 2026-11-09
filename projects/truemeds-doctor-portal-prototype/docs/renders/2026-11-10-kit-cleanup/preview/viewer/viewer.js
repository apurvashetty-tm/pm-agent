// Hand-off kit viewer. Static: reads window.KIT from data.js (generated). No server needed.
(() => {
  const K = window.KIT, S = K.screen, $ = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sw = (v) => typeof v === "string" && /^(#|rgb)/.test(v) ? '<span class="swatch" style="background:' + esc(v) + '"></span>' : "";
  const val = (v) => typeof v === "object" ? (v.boxShadow ? v.boxShadow : JSON.stringify(v)) : v;
  const tokCell = (t) => t.native ? sw(t.value) + "<code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + (t.via && t.via.length ? ' <span class=muted title="Defined as: ' + esc(t.via.join(" → ")) + '">ⓘ</span>' : "") + " · " + esc(val(t.value)) + "</span>" : '<span class="raw">' + esc(t.web) + " — not a native token</span>";
  const clean = (t) => String(t ?? "").replace(/\s*\[(RECOMMENDED|PROPOSED|LOCKED)\]/g, "").replace(/\s*\((see )?(RULES |Design rules )?§\s?\d+(\.\d+)*[a-z]?\)/g, "").replace(/\s*(RULES |Design rules )?§\s?\d+(\.\d+)*[a-z]?/g, "").replace(/\s+([.,;:])/g, "$1");
  const soft = (k) => k === "keyword" || k === "zero";
  const styleRows = (styles) => styles.map((s) => '<tr class="' + (s.raw ? "raw" + (soft(s.kind) ? " soft" : "") : "") + '"><td><code>' + esc(s.property) + "</code>" + (s.inherited ? " <span class=muted>(inherited)</span>" : "") + (s.appliesTo ? "<br><span class=muted>" + esc(s.appliesTo.join(", ")) + "</span>" : "") + "</td><td>" + (s["tokens"].length ? s["tokens"].map(tokCell).join("<br>") : "") + (s.layout ? (s["tokens"].length ? "<br>" : "") + "<code>" + esc(s.value) + "</code> <span class=muted>layout value</span>" : "") + (s.exception ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.exception) + "</span>" : "") + (s.timing ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.unresolved) + "</span>" : "") + (!s["tokens"].length && !s.layout && !s.exception && !s.timing && !s.raw ? "—" : "") +
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
    const D = window.KIT_DOWNLOADS || [];
    const dl = D.map((d) => '<a class="dl' + (d.main ? " dl-main" : "") + '" href="' + esc(d.href) + '" download><b>' + esc(d.label) + "</b><span>" + esc(d.what) + " · " + esc(d.size) + "</span></a>").join("");
    main.append($('<section><h1>Truemeds doctor app — hand-off kit</h1><p class="lede">How to use it: <b>start with Screens, tap anything on the phone picture, and check the answers (DECIDED) before asking us.</b></p>' +
      '<div class="card"><h3 style="margin-top:0">What is here</h3><ul class="plain">' +
      '<li><b>Screens</b>: every state of each screen. Tap a part of the phone to see what it is, its colours, sizes, spacing, text and behaviour.</li>' +
      '<li><b>Building blocks</b>: the reusable parts (button, field, notice…) with every version of each. Build these once, use them everywhere.</li>' +
      '<li><b>Foundation</b>: every design value (colour, size, gap, corner) by the name you use in code.</li>' +
      '<li><b>Answers</b>: <a href="../DECIDED.md">DECIDED</a> (' + K.decided.length + ' questions already answered) · <a href="../OPEN.md">OPEN</a> (' + K.open.length + ' still open, and who answers).</li></ul></div>' +
      '<div class="card"><h3 style="margin-top:0">Download</h3><div class="dls">' + dl + '</div><p class="muted small">Using an AI coding tool? Download the whole kit and open it as a folder: the tool reads <code>AGENTS.md</code> on its own. Kit version ' + esc((window.KIT_VERSION || "")) + '.</p></div></section>'));
  }
  function foundation() {
    main.append($('<section><h1>Foundation</h1><p>Every design value by the name you use in code (left). Download the files from <a href="#start">Start here</a>.</p></section>'));
    const used = new Set(S.tokensUsed.map((t) => t.native));
    const only = $('<label class="only"><input type="checkbox"> Only values used on Sign-in (' + used.size + ')</label>');
    const q = $('<input class="tm-input" placeholder="Filter tokens (e.g. content, space, --tm-border)" style="width:100%;padding:12px;border:1px solid var(--tm-border-default);border-radius:8px;font:inherit;margin:8px 0">');
    const box = $('<div class="tblwrap"></div>');
    const draw = () => { const f = q.value.toLowerCase(); box.innerHTML = "<table><thead><tr><th>Native (use this)</th><th>Web</th><th>Value</th></tr></thead><tbody>" + K.tokenIndex.filter((t) => !only.querySelector("input").checked || used.has(t.native) || used.has(t.ts)).filter((t) => !f || (t.native + t.web).toLowerCase().includes(f)).map((t) => "<tr><td><code>" + esc(t.ts) + "</code></td><td><code>" + esc(t.web) + "</code></td><td>" + sw(t.value) + esc(val(t.value)) + "</td></tr>").join("") + "</tbody></table>"; };
    q.oninput = draw; only.querySelector("input").onchange = draw; main.append(q, only, box); draw();
  }
  // Where a block is used, grouped by screen; each state opens Screens with that block selected.
  const SCREEN_NAMES = { "sign-in": "Sign-in", otp: "OTP", offer: "Faster sign-in offer", unlock: "Returning unlock", home: "Home", case: "Case", prescribe: "Prescribe", calling: "Calling" };
  function usedOn(b) {
    const by = {};
    for (const id of b.usedIn) { const scr = id.split("_")[0]; (by[scr] ??= []).push(id); }
    const stateOf = (id) => S.states.find((s) => s.id === id);
    return '<div class="usedon"><h3 style="margin-top:0">Where it\'s used</h3>' + Object.entries(by).map(([scr, ids]) =>
      "<p><b>" + esc(SCREEN_NAMES[scr] || scr) + "</b> (" + ids.length + ")<br>" + ids.map((id) => { const st = stateOf(id); const el = st && st.elements.find((e) => e.block === b.block); return '<a class="uchip" href="#screens/' + esc(id) + (el ? "/" + esc(el.id) : "") + '">' + esc(st ? st.name : id) + "</a>"; }).join("") + "</p>").join("") + "</div>";
  }
  function blocks(which) {
    main.append($('<section><h1>Building blocks</h1><p>The reusable parts. Build each once in React Native and reuse it. The React Native names are suggestions; you own the components.</p></section>'));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    const b = K.blocks.find((x) => x.block === which) || K.blocks[0];
    for (const x of K.blocks) { const c = $('<button type="button">' + esc(x.name) + "</button>"); c.setAttribute("aria-pressed", String(x === b)); c.onclick = () => { location.hash = "blocks/" + x.block; }; chips.append(c); }
    const sec = $('<section class="card"></section>');
    sec.innerHTML = "<h2 style=margin-top:0>" + esc(b.name) + "</h2><p><code>" + esc(clean(b.rn)) + "</code><br><span class=muted>web: " + esc(b.web) + "</span></p>" + usedOn(b) +
      '<div class="blockpics">' + b.pictures.map((p) => "<figure><img src=\"../" + esc(p.file) + "\" alt=\"" + esc(b.name + " " + p.state) + "\"><figcaption>" + esc(p.state) + "</figcaption></figure>").join("") + "</div>" +
      Object.entries(b.parts).map(([part, p]) => "<h3>" + esc(part) + "</h3>" + Object.entries(p.states).map(([st, s]) => "<p><b>" + esc(st) + "</b> <span class=muted>" + esc(s.seenIn) + (s.size ? " · " + esc(s.size) : "") + (s.changesOnly ? " · changes from default only" : "") + '</span></p><div class="tblwrap"><table><tbody>' + styleRows(s.styles) + "</tbody></table></div>").join("")).join("") +
      "<h3>Rules</h3><ul>" + b.rules.map((r) => "<li>" + esc(clean(r.text)) + "</li>").join("") + "</ul>";
    main.append(sec);
  }
  function screens(stateId, elId) {
    const st = S.states.find((s) => s.id === stateId) || S.states[0];
    const SCREENS = [["sign-in", "Sign-in"], ["otp", "OTP"], ["offer", "Faster sign-in offer"], ["unlock", "Returning unlock"], ["home", "Home"], ["case", "Case"], ["prescribe", "Prescribe"], ["calling", "Calling"]];
    main.append($('<nav class="scrtabs" aria-label="Screens">' + SCREENS.map(([k, l]) => k === "sign-in" ? '<button type="button" aria-current="true">' + l + "</button>" : '<button type="button" disabled title="Added with the full kit">' + l + "</button>").join("") + "</nav>"));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    for (const s of S.states) { const c = $('<button type="button">' + esc(s.name) + "</button>"); c.setAttribute("aria-pressed", String(s === st)); c.onclick = () => { location.hash = "screens/" + s.id; }; chips.append(c); }
    const stage = $('<div class="stage"></div>');
    const shot = $('<figure class="shot" style="margin:0"><div class="frame" style="position:relative"><img alt="' + esc(st.name) + ' at 390, built app" src="../' + esc(st.pictures.built390) + '"></div><figcaption>Tap any part · smallest supported phone: 360 wide</figcaption></figure>');
    const frame = shot.querySelector(".frame");
    const panel = $('<div class="panel"></div>');
    const order = [...st.elements].sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h);
    let sel = st.elements.find((e) => e.id === elId) || null;
    for (const e of order) {
      const h = $('<button type="button" class="hit" aria-label="' + esc(e.id) + '"></button>');
      Object.assign(h.style, { left: e.box.x / 3.9 + "%", top: e.box.y / 8.44 + "%", width: e.box.w / 3.9 + "%", height: e.box.h / 8.44 + "%" });
      h.onclick = (ev) => { ev.stopPropagation(); pick(e); }; h.dataset.id = e.id; frame.append(h);
    }
    stage.append(shot, panel); main.append(stage);
    const list = $('<div class="ellist"></div>');
    function pick(e) { sel = e; history.replaceState(null, "", "#screens/" + st.id + "/" + e.id); drawPanel(); }
    function drawPanel() {
      shot.querySelectorAll(".hit").forEach((h) => h.classList.toggle("sel", sel && h.dataset.id === sel.id));
      panel.innerHTML = ""; list.innerHTML = "";
      for (const e of st.elements) { const b = $('<button type="button">' + esc(e.id) + "</button>"); b.setAttribute("aria-pressed", String(sel === e)); b.onclick = () => pick(e); list.append(b); }
      const fold = $('<details class="elfold"><summary>Can\'t tap it? Pick from a list</summary></details>'); fold.append(list);
      if (!sel) panel.append($('<div class="card hint"><p>Tap any part of the phone (a button, the field, a line of text) to see how it is built.</p></div>'));
      if (sel) {
        const e = sel, sp = e.spacing || {};
        panel.append($('<div class="card"><h2 style="margin-top:0">' + esc(e.id) + "</h2><p><b>Block</b> <a href=\"#blocks/" + esc(e.block) + "\" title=\"Every version, and where else it's used\">" + esc((K.blocks.find((x) => x.block === e.block) || {}).name || e.block) + "</a>" + " · <b>part</b> " + esc(e.part) + " · <b>variant</b> " + esc(e.variant) + " · <b>state</b> " + esc(e.blockState) + (e.rn ? "<br><b>RN</b> <code>" + esc(clean(e.rn)) + "</code>" : "") + "</p>" +
          (e.copy.length ? "<p><b>Copy</b> " + e.copy.map((c) => c.copyKey ? "<code>messages['" + esc(c.copyKey) + "']</code>" + (c.values ? " with " + esc(JSON.stringify(c.values)) : "") + " (" + esc(c.slot) + ")" : c.literal ? '<span class="raw">typed text "' + esc(c.literal) + '" (' + esc(c.slot) + ")</span>" : "<span class=muted>" + esc(c.note) + "</span>").join("<br>") + "</p>" : "") +
          (e.icon ? "<p><b>Icon</b> <code>" + esc(e.icon.iconTs) + "</code> " + esc(e.icon.size ? e.icon.size.join("×") : "") + "</p>" : "") +
          '<div class="tblwrap"><table><thead><tr><th>Property</th><th>Token (native · web · value)</th></tr></thead><tbody>' + (styleRows(e.styles) || "<tr><td colspan=2 class=muted>No styles: the phone draws this.</td></tr>") + "</tbody></table></div>" +
          "<h3>Spacing</h3>" + (sp.above ? "<p>" + esc(sp.above.px) + " above, to <b>" + esc(sp.above.neighbour) + "</b>: " + (sp.above.setBy.length ? sp.above.setBy.map((s) => esc(s.element + " " + s.property + " ") + (s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>")).join("; ") : "<span class=muted>layout (no spacing rule)</span>") + "</p>" : "") +
          (sp.inside ? "<p>Inside: " + sp.inside.map((s) => esc(s.property + " ") + (s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>")).join("; ") + "</p>" : "") +
          (e.accessibility && e.accessibility.name ? "<h3>Screen reader label</h3><p>" + esc(e.accessibility.name) + "</p>" : "") + "</div>"));
      }
      const w = st.when || {}, Q = (id) => (K.decided.find((d) => d.id === id) || {}).q || id;
      panel.prepend($('<div class="card when"><h3 style="margin-top:0">When this shows</h3><p>' + esc(w.shows || "") + '</p><p><b>What happens next:</b> ' + esc(w.next || "") + '</p>' + (st.rule.decided.length ? '<details class="ans"><summary>Answered questions (' + st.rule.decided.length + ')</summary><ul>' + st.rule.decided.map((d) => '<li><a href="../DECIDED.md#' + d + '">' + esc(Q(d)) + "</a></li>").join("") + "</ul></details>" : "") + "</div>"));
      panel.append(fold); panel.scrollTop = 0;
      const raws = S.rawValues.builtApp.filter((x) => x.states.includes(st.id.replace("sign-in_", "")));
      if (raws.length) panel.append($('<div class="card"><h3 style="margin-top:0" class="raw">Not design values yet: ' + raws.length + '</h3><div class="tblwrap"><table><tbody>' + raws.map((x) => '<tr class="raw"><td><code>' + esc(x.property + ": " + x.value) + "</code></td><td>" + esc(x.elements.join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
    }
    drawPanel();
  }
  go(location.hash.slice(1));
})();
