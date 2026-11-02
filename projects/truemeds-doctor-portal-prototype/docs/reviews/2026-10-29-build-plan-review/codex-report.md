## 1. Verdict

**Approve with changes** — plain HTML/JS suits prototype; conflicting acceptance rules, guard targets, deployment packaging and state coverage need correction before building.

**Plan** = `docs/proposals/2026-10-29-prototype-build-plan.md`; **Checklist** = `docs/reviews/2026-10-29-rebuild-checklist.md`. Review is source-based: `app/` does not exist; deployment and device behavior **unverified**.

## 2. Blockers

1. **Acceptance rules contradict approved behavior.** Checklist carries old standards “unchanged”: margins, paired-button icons, headers, outcome placement and End call are superseded. Checklist 4.16 wrongly removes Back to Home while availability remains; 4.1 needs missing-record submission exception. Feedback map also sends failed/cancelled faster-sign-in enrollment Home, conflicting with current app logic. · **Sources:** Checklist introduction, 4.1, 4.16; `2026-10-15-standards-checklist.md` 1.1, 3.5, 5.1, 5.7, 5.10, 7.5, 7b.3; `docs/feedback-state-map.md` “Faster sign-in offer”; `ui-screens/app-logic.md` §2, §5–6; decision log D-58, D-61, D-67, D-70. · **Change:** publish explicit supersession table. Preserve quiet Back to Home while available, sole primary Back to Home when ended, and 7d submission without claiming prescription confirmation. No further §4 app-logic edit requested.

2. **Existing checks can pass without testing rebuilt app.** Layout checker opens frozen `index.html` through `file://`; standards/source guards target `ui-screens/` and historical coverage lists. · **Sources:** Checklist 1.1–1.2, 2.3, 3.1, 6.1; `docs/layout_check.py` URL; `ui-screens/feedback/check-locked-specs.py` screen constants/`EXPECTED`/`check_coverage`; `check-sources.mjs`. · **Change:** step 0 must provide HTTP-served `app/` target, current coverage manifest and runtime assertions. Direct state loading proves rendering, not transition reachability; test both. ES modules require server-based local testing. [MDN modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

3. **Second site needs isolated configuration and complete asset packaging.** Root config publishes project root and copies design system outside proposed `app/` publish directory. UI settings alone can be overridden. · **Sources:** Plan B1/B5/B6, §4; repo `netlify.toml` `[build]`; approved HTML asset references. · **Change:** use this configuration:
   - Site: `truemeds-doctor-app-preview`; production branch: `project/truemeds-doctor-portal-prototype`.
   - Base directory: repository root.
   - Package directory: `projects/truemeds-doctor-portal-prototype/app`, containing site-specific `netlify.toml`.
   - Publish directory: `projects/truemeds-doctor-portal-prototype/app`, relative to base.
   - Deploy command stages central design system **including fonts/icons**, approved brand lockup, and canonical message adapter/data inside publish directory. Rewrite asset URLs accordingly; exclude generated copies from commits.
   
   Leave current site’s config intact. Verify effective config and deployed asset responses. No framework compilation needed; packaging step remains necessary. [Netlify configuration](https://docs.netlify.com/build/configure-builds/monorepos/), [configuration precedence](https://docs.netlify.com/build/configure-builds/file-based-configuration/)

4. **State scheme and build order lack complete mapping.** `call.valid` maps to different pictures; some calling rows have no State ID; auth families reuse names such as `default`. Step 6 omits `t10b-forwarded`; Rx failure is grouped under Prescribe despite belonging to viewer journey. Step 5 promises demo through next case, deferred to step 7. · **Sources:** Plan B4, §1, §5; `ui-screens/app-logic.md` §5; `ui-screens/README.md` calling IDs, Prescribe, state-opening instructions. · **Change:** define crosswalk: journey-qualified fixture ID → semantic state → scenario → render ID → representative picture → owning step → transition tests. Preserve existing IDs as mappings. Assign `t10b` explicitly, test `d-rx-failed` with viewer, deliver basic next-case loop before declaring demo ready. Include behavior-only states from feedback map.

## 3. Should change

1. **Specify polling and clock behavior.** “Polls mock server” leaves backgrounding, duplicate responses and gate boundaries undefined. Short demo call can fail eligibility if only gate changes while minimum counted-call duration remains unchanged. · **Sources:** Plan B7–B8/P4; Checklist 4.9–4.10; decision log D-58 points 19–22, D-72 point 4. · **Change:** one controllable clock; immediate foreground reconciliation; single polling lifecycle; case/attempt identity; stale-response rejection; stop rules including pending-record reconciliation. Test late results, accumulated eligible calls and transfer ending between display and tap. Accelerate demo consistently while preserving review-mode settings.

2. **Persist enough state to fulfil resume promise; isolate modes.** B10 lists preferences and availability, yet promises open-case recovery. Review fixtures could overwrite demo session. · **Sources:** Plan B10/§4; Checklist 5.2, 5.5; app-logic §3–4. · **Change:** define versioned mock snapshot covering open case, reviewed medicines, notes, pending operations and absolute deadlines. Separate demo/review storage; capture starts from fixed fixtures without persistent writes. Define Reset/logout behavior. Installed launch must ignore review/capture overrides.

3. **Complete install contract and device acceptance.** · **Sources:** Plan §4/P6; Checklist 5.4–5.6. · **Change:** specify manifest `id`, `name`, `short_name`, demo-only `start_url`, `scope`, `display: standalone`, portrait preference, theme/background colors and manifest link. Supply 192×192 and 512×512 PNG exports plus 180×180 Apple touch icon from approved square SVG, preserving complete artwork; do not label untested artwork maskable. Detect standalone display, with Safari fallback. Add `viewport-fit=cover`, safe-area handling and keyboard checks. Define “full screen” as no browser chrome; portrait/fullscreen support varies. Android prompt timing is not guaranteed; document browser-menu installation and Safari Add to Home Screen. Record Android **and** iPhone results, OS/browser versions. [Manifest requirements](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [standalone detection](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Create_a_standalone_app), [orientation limits](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/orientation), [safe areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

4. **Offline cache needs update policy.** Persistent cache can keep approved testers on stale HTML, modules, copy or styles. · **Sources:** Plan §4 “Install”; Checklist §5–6. · **Change:** define versioned asset set, activation policy, obsolete-cache cleanup and build identity in review evidence. Test installed version A → deployed version B, offline launch, reconnection and retained session. Avoid forced worker activation mid-case. Simpler initial option: defer offline caching; installation does not inherently require it. [Service-worker updates](https://web.dev/learn/pwa/update), [installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)

5. **Native sign-in behavior needs explicit prototype boundary.** Persisting “faster sign-in enabled” does not provide native biometric/screen-lock authentication. · **Sources:** Plan B3/B10, §5 step 1; Checklist 4.15; app-logic §2–3; feedback map “Returning unlock.” · **Change:** document mock authentication adapter and configurable outcomes, distinguished from native-team validation. Do not imply generic native unlock APIs exist in browser or invent OS prompt UI. WebAuthn introduces credential-registration/challenge behavior beyond this static prototype. [WebAuthn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion)

6. **Several checklist methods need narrower, observable criteria.** · **Sources:** Checklist introduction, 1.3, 3.1–3.2, 3.6, 5.1, 6.3–6.4, 7.3; `docs/feedback-rules.md` §7/§10. · **Change:** distinguish registry-owned copy from synthetic values/user input; check hard-coded gate values rather than any occurrence of “50”; combine synthetic-fixture provenance review with scans—automation cannot prove fictional identity. Lockup hash check does not verify screen placement. Define expected scenario/endings matrix, text-enlargement setting, review-panel exception and approval evidence. Separate prototype handoff checks from native-device gates; native implementation is outside this build.

7. **Make visual comparison reproducible and cumulative.** · **Sources:** Plan §5; Checklist 2.1–2.2; promotion `REPORT.md` “Close-out”; decision log D-73 point 4. · **Change:** pin approved promotion revision, viewport heights, density, fonts, clock and animation state. Map behavior-only states to representatives. Record state × viewport × checklist evidence; rerun affected frozen journeys after shared-core changes. Final promotion baseline remains pending per report—retain start gate.

## 4. Nice to have

- **Compact engineering handoff:** state crosswalk, mock contracts, message IDs and explicit assumptions beside B3/B7 implementation; supports React Native team without expanding into production architecture. Source: Plan §3, §7.
- **Simpler hosting alternative:** existing site’s branch deploy serving `/app/` reduces site setup, but changes asset/scope paths; separate named preview site remains sound. Source: Plan §4; [Netlify branch deploys](https://docs.netlify.com/deploy/deploy-types/branch-deploys/).

## 5. P1–P8

| Point | View | Why |
|---|---|---|
| P1 | Agree | Preserve promotion, app-logic and checklist approval gates; §4 fix already settled by brief. |
| P2 | Agree | Native ES modules fit prototype; explicit URL imports, HTTP local server and deploy packaging required. |
| P3 | Agree | Technically sound with demo-only manifest launch and isolated review/capture state. Product choice remains Apurva’s. |
| P4 | Agree | Settled shorter phone demo; accelerate clock/eligibility consistently, retain real review gate. |
| P5 | Agree | Named second site works with blocker 3 configuration. Name availability/account settings **unverified**. |
| P6 | Agree | Official square SVG exists; preserve artwork and generate platform-sized exports. |
| P7 | Agree | Log semantic outcomes separately, once per completed operation; pending submission is not confirmation. Sources: app-logic §6, D-50. |
| P8 | Can’t judge | Product cutover choice. Switching preview branch to `main` does **not** change old site’s publish target; define cutover and installed-origin implications separately. |

## 6. Parked

Production telecom/backend architecture, real authentication, Ops tooling/SOP implementation, Help/Profile redesign, token inspector and native platform certification. Sources: Plan §7; backlog §2d/§4–4b; decision log D-72–D-73.