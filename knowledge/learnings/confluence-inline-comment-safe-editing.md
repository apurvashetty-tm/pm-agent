---
name: confluence-inline-comment-safe-editing
description: How to edit a Confluence page body via the Atlassian MCP without breaking or orphaning inline reviewer comments — preserve annotation spans verbatim, strike (don't delete) anchored text, verify zero dangling. Read before touching any page that has open inline comments.
metadata:
  type: learning
  domain: tooling
  status: proven
---

# Editing a Confluence page without breaking its inline comments

Learned doing the ACOM × Ring AI PRD review (PROD page 2023260174), ~30 comment threads, v13 → v19.

## The core mechanic
Inline comments are anchored to the page body by a span:

    <span class="annotation" data-annotation-id="XXXX" data-annotation-type="inlineComment">anchored text</span>

The comment stays attached only while that exact span — attributes **and** the wrapped text — survives in the body. Delete or reword the anchored text and the comment goes **dangling** (orphaned), which looks to the reviewer like their comment was ignored or lost.

## Rules that worked
1. **Full-body updates only.** `updateConfluencePage` with `contentFormat: "html"` (get the current body first with `getConfluencePage`). There is no partial-edit API.
2. **Preserve every annotation span verbatim** — the `data-annotation-id`, the `data-annotation-type`, and the text inside. Copy them through untouched.
3. **Strike, don't delete.** When a reviewer's anchored text is what's changing, wrap the old text in `<s>...</s>` and add the new text *next to* it — keep the anchored words present so the span still matches. (This also matches the stakeholder's "we don't delete, we carefully strike out old assumptions and write the new ones" norm.)
4. **Verify after every publish.** Call `getConfluencePageInlineComments` and check for `resolutionStatus: "dangling"`. Target is **zero dangling**. Do this every publish, not just at the end.
5. **Replies are separate.** `createConfluenceInlineComment` with only `parentCommentId` posts a reply under a thread. There is **no edit-comment API** — a reply, once posted, can only be changed by hand in the UI. So when the wording of a reply matters, hand the user the exact text to paste rather than posting a version you'll want to revise.

## Gotchas
- Markdown is the source of truth here; the page is generated from a local `.md`. Keep the `.md` and a body snapshot mirrored to the same version as the live page, or the next diff check drifts.
- "Answered all comments" needs an actual count from `getConfluencePageInlineComments`, not memory — an airtight QA pass on this page surfaced 2 reviewer comments that had been missed (real count was 38, not 36).
- Don't sync to Confluence unless the user explicitly says "sync" / "update the doc".
