// Storage per mode (checklist 5.4): demo, review and play keep separate namespaces; capture writes nothing; reset clears a namespace.
const PREFIX = "tm-doctor-app";
export function storageFor(mode) {
  const ns = `${PREFIX}:${mode}:`;
  const ls = globalThis.localStorage;
  const ok = !!ls && mode !== "capture";
  return {
    ns,
    get(k) { if (!ok) return null; const v = ls.getItem(ns + k); return v === null ? null : JSON.parse(v); },
    set(k, v) { if (ok) ls.setItem(ns + k, JSON.stringify(v)); },
    clear() {
      if (!ls) return;
      for (let i = ls.length - 1; i >= 0; i--) { const key = ls.key(i); if (key && key.startsWith(ns)) ls.removeItem(key); }
    },
    keys() { if (!ls) return []; const out = []; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.startsWith(ns)) out.push(k); } return out; },
  };
}
