// Hand-off kit viewer. Static: reads window.KIT from data.js (generated). No server needed.
(() => {
  const K = window.KIT, S = K.screen, $ = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sw = (v) => typeof v === "string" && /^(#|rgb)/.test(v) ? '<span class="swatch" style="background:' + esc(v) + '"></span>' : "";
  const val = (v) => typeof v === "object" ? (v.boxShadow ? v.boxShadow : JSON.stringify(v)) : v;
  const tokCell = (t) => t.native ? sw(t.value) + "<code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + (t.via && t.via.length ? " (via " + esc(t.via.join(", ")) + ")" : "") + " · " + esc(val(t.value)) + "</span>" : '<span class="raw">' + esc(t.web) + " — not a native token</span>";
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
    main.append($('<section><h1>Sign-in — hand-off kit</h1><p>Everything the React Native team needs to build the Truemeds doctor app\'s Sign-in screen from the same tokens, copy and rules as the approved design.</p>' +
      '<div class="card"><h3>What is here</h3><ul><li><b>Foundation</b>: tokens (native names beside the web names), icons, copy, fonts.</li><li><b>Building blocks</b>: each block on the screen, its parts and states, the token for each, sizes and rules.</li><li><b>Screens</b>: all ' + S.states.length + ' Sign-in states. Tap any element for its block, tokens, spacing, copy key and behaviour.</li><li><b>Red</b> = a value that is not a token.</li></ul></div>' +
      '<div class="card"><h3>Files</h3><ul><li><code>../AGENTS.md</code> — for your AI coding tool.</li><li><code>../DECIDED.md</code> — questions already answered (' + K.decided.length + ').</li><li><code>../OPEN.md</code> — still open, with who answers (' + K.open.length + ').</li><li><code>../screens/sign-in.json</code>, <code>../components/*.json</code> — the same facts as data.</li><li><code>../CHANGES.md</code> — what moved since the last drop.</li></ul></div>' +
      '<div class="card"><h3>Tokens used on Sign-in (' + S.tokensUsed.length + ')</h3><div class="tblwrap"><table><thead><tr><th>Native · web</th><th>Value</th><th>States</th></tr></thead><tbody>' +
      S.tokensUsed.map((t) => "<tr><td><code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web.join(", ")) + "</span></td><td>" + sw(t.value) + esc(val(t.value)) + "</td><td>" + (t.states === "all" ? "all" : esc(t.states.map((x) => x.replace("sign-in_", "")).join(", "))) + "</td></tr>").join("") + "</tbody></table></div></div></section>"));
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
    const shot = $('<figure class="shot" style="margin:0"><div class="frame" style="position:relative"><img alt="' + esc(st.name) + ' at 390, built app" src="../' + esc(st.pictures.built390) + '"></div><figcaption>390 · built app · inspectable</figcaption></figure>');
    const frame = shot.querySelector(".frame");
    const ref = $('<figure class="ref" style="margin:0"><img alt="' + esc(st.name) + ' at 360, approved" src="../' + esc(st.pictures.w360) + '"><figcaption>360 · approved picture</figcaption><br><img alt="' + esc(st.name) + ' at 390, approved" src="../' + esc(st.pictures.w390) + '"><figcaption>390 · approved picture</figcaption></figure>');
    const panel = $('<div class="panel"></div>');
    const order = [...st.elements].sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h);
    let sel = st.elements.find((e) => e.id === elId) || null;
    for (const e of order) {
      const h = $('<button type="button" class="hit" aria-label="' + esc(e.id) + '"></button>');
      Object.assign(h.style, { left: e.box.x / 3.9 + "%", top: e.box.y / 8.44 + "%", width: e.box.w / 3.9 + "%", height: e.box.h / 8.44 + "%" });
      h.onclick = (ev) => { ev.stopPropagation(); pick(e); }; h.dataset.id = e.id; frame.append(h);
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
      panel.append($('<div class="card"><h3 style="margin-top:0">Tokens used in this state (' + Object.keys(used).length + ')</h3><div class="tblwrap"><table><thead><tr><th>Native · web</th><th>Value</th><th>Elements</th></tr></thead><tbody>' +
        Object.values(used).sort((a, b) => a.t.native.localeCompare(b.t.native)).map(({ t, els }) => "<tr><td><code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + "</span></td><td>" + sw(t.value) + esc(val(t.value)) + "</td><td>" + esc([...els].join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
      const raws = S.rawValues.builtApp.filter((x) => x.states.includes(st.id.replace("sign-in_", ""))).sort((a, b) => soft(a.kind) - soft(b.kind));
      panel.append($('<div class="card"><h3 style="margin-top:0"' + (raws.length ? ' class="raw"' : '') + '>Not tokens in this state: ' + raws.length + (raws.length ? ' typed sizes, colours or words' : ' (every size, colour and word is a token or a message key)') + '</h3><div class="tblwrap"><table><thead><tr><th>Value</th><th>Where</th><th>Elements</th></tr></thead><tbody>' +
        raws.map((x) => '<tr class="raw' + (soft(x.kind) ? " soft" : "") + '"><td><code>' + esc(x.property + ": " + x.value) + "</code> (" + esc(x.kind) + ")</td><td>" + esc(x.file + ":" + x.line) + "</td><td>" + esc(x.elements.join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
    }
    drawPanel();
    const all = $('<details class="card"><summary><b>Approved reference file: values that are not tokens (' + S.rawValues.approvedReference.length + ')</b></summary><div class="tblwrap"><table><tbody>' + S.rawValues.approvedReference.map((x) => '<tr class="raw"><td><code>' + esc(x.property + ": " + x.value) + "</code> (" + esc(x.kind) + ")</td><td>" + esc(x.file + ":" + x.line) + "</td><td><code>" + esc(x.selector) + "</code></td></tr>").join("") + "</tbody></table></div></details>");
    main.append(all);
  }
  go(location.hash.slice(1));
})();
