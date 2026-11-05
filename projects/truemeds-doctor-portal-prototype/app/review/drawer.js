// Phone drawer (plan §4, checklist 5.11): a small handle at the screen edge slides the controls up. Shown only in review / play on a
// narrow screen. Tapping outside closes it. The controls shown are the ones for the screen the phone is on.
export function mountDrawer({ mode, panel, handle, backdrop }) {
  const narrow = matchMedia("(max-width: 767px)");
  const show = (open) => {
    document.body.classList.toggle("drawer-open", open);
    handle.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open; // the backdrop takes taps only while the drawer is open
  };
  const apply = () => {
    const on = (mode === "review" || mode === "play") && narrow.matches;
    handle.hidden = !on;
    if (!on) show(false);
  };
  handle.addEventListener("click", () => show(!document.body.classList.contains("drawer-open")));
  backdrop.addEventListener("click", () => show(false));
  narrow.addEventListener("change", apply);
  apply();
  return { open: () => show(true), close: () => show(false), refresh: apply, isNarrow: () => narrow.matches };
}
