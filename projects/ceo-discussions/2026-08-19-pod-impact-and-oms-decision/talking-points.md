# Talking Points — POD Impact + OMS/Cart Migration Scope

- **Audience:** VP Product (manager) + Engineering Director
- **Length:** ~30 min. Peer-align, not a pitch. No bandwidth/operating-model ask.
- Numbers are `[USER-PROVIDED]` — speak them as "approximately", data-lock later.

## The one-line spine
> We moved these numbers through **functional and non-functional work — without
> blocking a single business or functional project.** That freed engineering
> capacity, and the same team is now unblocking Cart. Here's where Product's
> bandwidth is going, and the one call we need from you.

---

## Act 1 — Impact (outcomes first, with what drove them)

Present as an **L1 outcome ← L2 drivers** tree, not a flat list.

**HA CPO ₹16.5 → ₹7.8** (~₹67L/mo at 28k orders/day; FY-end goal, hit ~8 months early)
← driven by HA headcount reduction, enabled by:
- substitution skips
- portal-efficiency fixes: prescription-required handling, HAs unable to confirm orders, forced substitutions, HAs unable to log in, HAs not getting orders

**Pharmacist/CSR CPO ₹14 → ~₹9** (same FY-end goal, ~8 months early)
← driven by **voicebot**: 55% of call volume auto-handled + resolved, only 13% call back

**Stuck orders ~100/day → ~0** (incomplete / payment-pending / status issues)

**Engineers freed:** on-call/support effort on bug-fix + KTLO for doctors+HAs is down to **~1/3** — freeing engineers for functional and impactful work.

> Say it plainly: the impact came from *both* functional and non-functional work — not just platform plumbing.

---

## Act 2 — We did not block business

While doing the above, the pod **did not block any functional requirement or
business-impact project.** Delivered / enabled alongside:
- Call-skipping logic
- Valid-Rx categorisation
- Voicebot
- Assisted Commerce
- Ring AI
- NFS salts

> And because we cleared recurring ops, support/on-call man-hours dropped to roughly
> **1/3** — which is exactly what freed engineers for this business work.

---

## Act 3 — What the team is doing now: Cart unlock

> Cart can't fully unblock until the new OMS is live. For OMS to go live, **all our
> portals and payment services must migrate to it.** Engineering owns the heavy
> lifting on the bandwidth and effort that migration takes.

---

## Act 4 — Where Product's bandwidth is going, and why

> The onus is on us to say where Product's time is going. Product is **unblocking
> Engineering** — reducing the migration scope by identifying the *right* features to
> migrate, not every feature that exists today. On the Super Doctor Portal that's
> **29 features → 16 useful ones.** Less throwaway work, less rework, faster Cart.

---

## Act 5 — The key call (the decision)

> Today Product is only supporting **scope reduction**. But going deep on the portals
> this fast has given us something extra: a much clearer picture of the portals —
> where they overlap, where each one has gaps the others don't, and how they could
> converge. That opens real enhancement directions — including a **unified commerce +
> CRM platform**.
>
> So the call for this room: do we **agree to take up a focused set of these
> enhancements now** (enhance-and-migrate, with explicit Cart-date risk), or do we
> **note them and keep supporting Cart-only for now** (migrate-only)?

Lead the enhancement discussion with the strong examples in `decision-brief.md`.
It's not do-everything vs do-nothing — there's a middle: baseline + a small approved set.
