# Sign-in handoff acceptance cases

Scope: this independent suite is authored only from the sources listed below. D-98 / FIX-BRIEF supersede the original scope; app Sign-in sources are read only for assertions. The pilot checklist is already approved (proposal line 3; brief lines 16–17). These tests do not approve the kit or alter its sources. They intentionally fail until a built kit exists.

Run from the project folder:

```sh
node --test tests/codex/handoff/handoff.test.mjs
```

`HANDOFF_DIR` may select another built kit; freshness still checks the project builder and its normal output. `HANDOFF_SAMPLE_DOCTOR` may contain the exact approved sample doctor's displayed name. No personal name was supplied in the permitted text sources; do not invent an allowlist. Source numbering below is the on-disk numbering at test authoring; image filenames supply state/width provenance, not invented line numbers.

## Source legend

- **P**: `docs/proposals/2026-11-09-native-handoff-kit.md` §6, lines 71–83.
- **B**: `docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md`.
- **S**: `ui-screens/sign-in/sign-in.html`.
- **L**: `ui-screens/app-logic.md` §2, lines 28–54.
- **F**: `docs/feedback-state-map.md`.
- **T**: `../../design-system/native/tokens.ts`, export at lines 3 onward.
- **M**: `ui-screens/native/messages.ts`, Sign-in keys lines 3–21.

## Automated checks

| ID | Pass condition | Source lines | Test |
|---|---|---|---|
| H01 | Portable folder has README, AI files, decisions/open questions, changes, foundation tokens/icons/messages/fonts, block JSON, screen JSON and disk viewer; no symlinks requiring the original repo. | B:50–67 | H01 |
| H02 | Every native reference shown in text/JSON resolves against T, including bracket notation and explicit token fields. Foundation token TS/JSON and message TS match their canonical exports. Native names retain their web names beside them (review E02 as well). | P:73; B:30–31,61,71–75; T:3 onward | H02 |
| H03 | Every `copyKey`/`messageKey` (or plural array) resolves in M; all Sign-in keys are represented. No typed user-facing copy is substituted for a key (review E03 as well). | P:78; B:90–93; M:3–21 | H03 |
| H04 | Exactly the 12 source states, with every visible source DOM element represented, including containers, labels, icons, spinner, prefix, helper/notice text slots, signup and keyboard keys. Each element has ID, block, variant, tokens, neighbour spacing, behaviour and accessibility. Both approved pictures are bundled for each state; state cites its behaviour source. | P:75,78; B:81–93; S:64–95,118–165 | H04 |
| H05 | Every typed size/colour in screen reference CSS is flagged with exact source line/property/value. Exclude html/body, review-controls and capture scaffolding per D-98. Layout keywords and zeros are plain, not red; 31ch is a documented text-measure exception. | P:76; B:76–77; S:9–61 | H05 |
| H06 | Scan all textual kit files and filenames for internal git/hosting/tool/brief/render-rule/review details, known internal names, local workspace paths, credential patterns, emails and unapproved `Dr …` names. Manually inspect other names and binary/image content as E10. Official Google Fonts provenance and mandatory OFL copyright names are legal provenance, not internal leaks. | B:32–35,113–115 | H06 |
| H07 | Root CLAUDE is exactly `@AGENTS.md`; AGENTS and skill point to existing kit tokens/messages, screen, components, DECIDED and OPEN. Markdown relative links stay inside kit and resolve. AGENTS states RN, token/copy rules, case wording, one primary, decisions/open questions. | B:54–67,90–93; B:124–133 | H07 |
| H08 | Four actual static TrueType files have OS/2 weights 400/500/600/700; no variable `fvar` table. OFL exists; FONTS note names every file and its computed SHA256, official source, family, iOS/Android and weight mapping. Setup correctness and licence contents reviewed separately. | P:77; B:113–115 | H08 |
| H09 | Builder exists; current `--check` succeeds. An isolated replica also passes before mutation; modifying the copied canonical message source makes `--check` fail, without modifying any real source. Reject timeout, missing-module and syntax failures as evidence of staleness. | P:81; B:117–120 | H09 |

### Screen audit join (test interface, not a product decision)

The brief deliberately leaves JSON structure simple and requires AGENTS to document it (B:90–93). To make completeness falsifiable, H04 reads `states` as an array of `{id,elements}` or an object keyed by state ID. State IDs may use `signin.` or `sign-in_` prefixes. Every element supplies a source selector in `sourceSelector`, `selector`, or `sourceSelectors[]`. A block may cover multiple source nodes without creating a separate native component for each HTML wrapper.

Selectors use `#id` when present; otherwise `tag:nth-of-type(n)` under the parent's selector, starting with `section:nth-of-type(1)`. The test derives this inventory from S:67–95, excludes source-hidden nodes per S:141–158 and S:41–42, and checks each visible node in each state. This covers the approved HTML fixture; it cannot prove a separate app DOM matches it. A different schema needs an explicitly reviewed adapter; do not silently drop completeness checks to make a build pass.

Element aliases accepted: `spacing`/`spacingTokens`, `behaviour`/`behavior`/`behaviourRef`/`behaviorRef`, `accessibility`/`a11y`. Raw records may live anywhere in non-foundation JSON and must include `raw: true`, `property`, `value`, and either source file + numeric `line`/`sourceLine` or `file:line`. Structured copy fields use `copyKey`, `messageKey`, `copyKeys` or `messageKeys`; textual native references use `tokens.…`. H02 also checks fields named `native`, `nativeToken`, `tokenName` or `token`.

### Per-state oracle

All rows require the shared logo, title, subtitle, field container/control, label, country prefix, input, submit button and submit-label elements (S:67–86), including their visible ancestor containers. The source-generated selector inventory is authoritative, rather than a count produced by the builder.

| State | Additional visible elements / required semantics (eye check where noted) | Source lines |
|---|---|---|
| default | SMS helper; signup label/link; keyboard hidden; empty input. | S:79,89,119,143–160; F:28 |
| keyboard-open | SMS helper; keyboard and all keys; signup hidden; partial entry, focus, no early length error. | S:90–95,120,143–160; F:29 |
| empty-tap | Error helper and keyboard; empty; focus field on submit; edit recovery. | S:121,143–165; L:32; F:30 |
| too-short | Error helper and keyboard; retained incomplete digits; error after submit. | S:122,143–165; L:32; F:31 |
| wrong-first-digit | Error helper and keyboard; immediate impossible-prefix error, clears on valid correction. | S:123,143–165; L:32; F:32 |
| pasted-cleaned | SMS helper and keyboard; normalized meaningful digits, focused input. | S:124,143–165; L:31; F:33 |
| sending | SMS helper and keyboard; spinner; busy label, read-only input, disabled button/no duplicate send. | S:125,141,155–160; F:34 |
| not-registered | Neutral notice, info icon and text slot; signup; helper hidden; access recovery. | S:80,126,143–154; L:33; F:35 |
| offline | Warning notice, icon and text slot; signup; retained number, one message, reconnect/retry. | S:81,127,143–154; L:33; F:36 |
| couldnt-send | Error notice, icon and text slot; signup; retained number and retry confirmed failure. | S:82,128,143–154; L:33; F:37 |
| too-many-tries | Warning notice, clock and text slot; signup; disabled countdown CTA, retained number, authoritative eligibility. | S:83,129,143–160; L:33; F:38 |
| inactive | Error notice, icon and text slot; signup; Call Doctor Ops CTA. | S:84,130,143–160; L:33; F:40 |

Each row has approved `ui-screens/sign-in/sign-in_<state>_w360.png` and `_w390.png` inputs (B:90–91). `signin.locked-number` is a behaviour route to locked OTP, not another pictured Sign-in state (F:39; L:45–46).

## Required review evidence (not claimed by Node tests)

Every line below is a pass/fail eye check. Record evidence with the case ID; empty files, keywords or a successful automated suite do not prove these checks.

| ID | Pass condition | Source lines |
|---|---|---|
| E01 | Generated tokens, copy, sizes, colours and screen facts trace to their maintained sources; only README/AGENTS/CLAUDE/skill/FONTS are handwritten. Regenerate without manual repair. | B:30–31; P:81 |
| E02 | Web → native map comes from the canonical generator; each property's token comes from the applicable CSS variable, including overrides, rather than matching a computed value. Both names appear together. | B:71–75; P:73 |
| E03 | Inspect all 12 states against both approved pictures and per-state oracle. Every visible element's block/variant, property tokens, neighbour spacing, copy key, behaviour and target/label notes are correct, including dynamic countdown substitution. No typed copy or guessed tokens. | B:90–93; P:78; S:118–165 |
| E04 | Every block used by these states has a spec, all actual parts × actual states, tokens/sizes/spacing/rules, and a picture cropped from an approved source. RN suggestion is `[RECOMMENDED]`, same name as web. Includes field, primary/busy/disabled buttons, notice variants, spinner, logo and signup, any action band if present. No invented component/state. | P:74; B:79–86 |
| E05 | Double-click viewer offline without server; no missing dependencies. Start here/Foundation/Building blocks/Screens work. Readable at phone width. All 12 states inspectable at 390; 360 approved pictures alongside. | P:75; B:95–101 |
| E06 | Tap every element: panel shows block, variant, native + web tokens, spacing, copy key and working behaviour link. Tokens-used table per state and whole screen is complete and accurate. | P:75; B:98–100 |
| E07 | Every H05 raw record is visible in red and traceable to file/line; raw values cannot disappear under a token with an identical value. This includes fixture keyboard and non-screen CSS, distinctly labelled if necessary. | P:76; B:74–77,100 |
| E08 | DECIDED/OPEN cover mobile cleaning, validation order/timing/rechecking, each server result, signup route, keyboard/paste/offline/errors, limits/lockouts and locked-number OTP route, copy, accessibility, fonts and safe areas. Answers cite decisions/rules; unresolved answers include current assumption and Product/Backend/Ops owner. No mock timeout becomes a product promise. | P:79; B:58–59,103–109; L:28–46; F:7–13,22–40 |
| E09 | Include only Sign-in-relevant cross-boundary OTP/faster-sign-in rules: server-enforced limits and locked route, sign-in entry/exit, mock durations and genuinely open policies. Do not imply the other screens are part of this pilot. Each sourced decision number accompanies the actual decision, not debate. | B:33–34,105–109; L:41–52; F:39 |
| E10 | Independently review all kit text, JSON, scripts, comments, SVGs, images and metadata for internal names/details, git/hosting/tool/brief/render rules, review history and credentials. Only the approved sample doctor may appear as a person's app identity; mandatory public font licence/provenance remains intact. Use “case” for doctor's unit of work. Automated name/secret patterns are a partial scan, not proof of absence. | B:32–35,113–115 |
| E11 | AGENTS explains app, file locations, rules and screen schema; skill gives usable RN construction steps, checks DECIDED before asking, asks only OPEN or genuinely missing questions. CLAUDE loads the same instructions. Copy only kit to an unrelated folder and verify all references there. | B:50–67,90–93,124–133 |
| E12 | Verify font files really are official Plus Jakarta Sans static TTFs; OFL is the actual licence. Execute accurate iOS/Android family and weight setup steps. H08 proves bytes/weights/hashes, not official provenance or device setup. | P:77; B:111–115 |
| E13 | One command regenerates all generated files and CHANGES (tokens, blocks, screens); unchanged rerun is stable. Change each distinct source class in an isolated copy (tokens, copy, screen/stylesheet, rule source), observe check fail, rebuild, observe check pass and meaningful CHANGES. H09 supplies one source mutation, not full dependency coverage. | P:81; B:60,117–120 |
| E14 | Fresh sessions for BOTH Claude Code and Codex receive only copied kit outside repo, exact brief prompt; retain every transcript. Classify every question as DECIDED/OPEN/new; new questions go to OPEN + main-thread report, never invented answers. Last round: zero DECIDED questions and generated RN uses tokens/messages only, no raw colours/sizes/typed copy. At most initial plus two repair rounds. | P:80; B:122–136 |
| E15 | Protected `app/`, `ui-screens/`, design-system unchanged by kit work; pre-existing/parallel changes distinguished using pre-work evidence. No internal context/decision log edits, no fake approvals, no deployment. Report read-only defects to main thread. | P:82; B:9–12,26–29,36–39,153–156 |
| E16 | Check tests have no unreported failures; disputes cite source lines and remain available for main-thread judgement. Critique lists blockers/should-fix/nice-to-have and unchecked cases; response records valid fixes or reasons; blocker re-review done, or usage limit reported. | B:41–46,138–147,158–160 |
| E17 | Evidence sheet shows start page, block, tapped inspector, tokens table and red raw flag at phone width. REPORT covers proposal checklist, pass/fail evidence, fresh-AI round scores, changed files and NEEDS-APURVA; main thread reviews before Apurva. Publishing uses prescribed script/explicit files, no deployment. | B:149–160 |
| E18 | After Apurva review: FE engineer walkthrough completed and doubts logged as fixes. This is deferred, not silently passed by pilot automation. | P:83; B:16–17 |

## Limits and execution safety

H09 first runs the existing builder's read-only `--check`, then runs it in a temporary overlay with private copies of `scripts/`, `handoff/` and the changed source. All other project entries are symlinks to preserve builder dependencies without copying or inspecting `app/`. The original suite never opened app code; D-98 H10–H12 read Sign-in code without writing it. It and never mutates canonical sources. The builder must respect `--check` and its own read-only-source rule (B:26–27,119–120). A builder that resolves workspace sources outside this replica must fail the replica baseline or mutation check; do not count an infrastructure failure as freshness detection.

The automated suite deliberately has no skip-if-kit-missing path. No browser or fresh AI is silently launched by it. H06 cannot recognize every arbitrary human name or secret; E10 closes that gap. No official sample name is inferred from internal people's details. No design-system rules, decision log, backend behaviour or app code outside the allowed inputs was consulted; references to those rules in block specs require reviewer verification, not fabricated expectations.

## Authoring validation

- `node --check tests/codex/handoff/handoff.test.mjs`: passed.
- `node --test --test-name-pattern='^oracle:' tests/codex/handoff/handoff.test.mjs`: passed. Checks source-derived state count, keyboard inventory, unique element selectors, conditional visibility, representative raw declarations, token validity and exclusion of a token-only declaration.
- Initial full acceptance run: failed against the in-progress kit (missing required files/contracts). H09 stopped at its real-project baseline: Python builder raised `ModuleNotFoundError: No module named 'build'`. No source mutation was attempted; no stale-detection pass is claimed. The initial leakage scan found no matching text, but the suite now also requires textual kit content to avoid treating an empty folder as evidence of no leaks.
- Re-run the full command after the builder and kit are complete; then collect all E-case review evidence. Authoring did not read or edit `app/` or repair the parallel builder.


## D-98 fix-round additions (approved scope)

Source: `docs/context/decision_log.md:992–996`; `docs/renders/2026-11-09-handoff-kit/FIX-BRIEF.md:26–68`.

| ID | Pass/fail check (auto) | Source |
|---|---|---|
| H10 | Red flags only typed sizes, colours or words; no unexplained built Sign-in red, unmapped tokens, typed copy or unflagged typed styles. Only the documented 31ch text measure is exempt. | FIX §1, §5.1 |
| H11 | Logo/prefix and central spinner, notice-icon, focus rules use tokens; map native names exist in canonical tokens.ts. H02 checks all kit token references. | FIX §1 |
| H12 | Both exact strings have canonical/generated message keys, consumed through MSG; no typed +91 or accessible lockup name in sign-in.js. | FIX §2 |
| H13 | Native PNG exports exist at widths 166/332/498, valid PNG IHDR dimensions; brand note records the actual locked source SVG SHA256. | FIX §5.3 |
| H14 | o06/o13/o14/o20 have DECIDED anchors and D-98 provenance; no longer OPEN. | FIX §5.4 |

Eye checks remain necessary: viewer actually paints only problems red, PNG pixels match the locked SVG without redraw, and token changes produce no visual difference. PNG header/hash checks do not prove rendered pixel identity. Existing manual cases are superseded wherever they ask for red layout/zero values or scaffolding.

Tests are intentionally written before implementation. Run the full suite after regeneration; do not weaken failures to match an unfinished kit. Only tests/codex/handoff/ is modified by this tester; no shared handoff/context record is written.
