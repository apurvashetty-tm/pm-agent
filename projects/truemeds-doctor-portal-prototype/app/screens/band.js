// The one band (D-107, design-system/RULES.md "Entry and home screens"): sign-in, OTP, faster sign-in offer, returning unlock and
// Home build it here and never restyle it. Logo 16 from the top (safe area) · logo → title 16 · title L1 · title → subtitle 8 ·
// subtitle L3 one 20 line · subtitle → panel 32. The panel (white, radius 24, top padding 32) is `.entry-panel`; with this band
// its top lands at 173 on every screen. Allowed variants: Home header actions (`actions`), a title carrying a name may wrap
// (it wraps naturally), the OTP subtitle's number + `.tm-link` Change (`subtitle` as nodes). Styles: band.css.
import { h } from "../core/dom.js";
import { MSG } from "../core/msg.js";

export function band({ title, titleId, subtitle, actions = null, tag = "header" }) {
  return h(tag, { class: "entry-band band" },
    h("div", { class: "entry-band__row" },
      h("img", { class: "entry-band__logo login-logo", src: "brand/truemeds-for-doctors.svg", alt: MSG("signin.logoAlt") }),
      actions ? h("div", { class: "entry-band__actions" }, actions) : null),
    h("h1", { class: "entry-band__title", id: titleId, text: title }),
    h("p", { class: "entry-band__sub sub" }, subtitle));
}
