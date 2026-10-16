# PRD: My Statistics — Unified Agent Performance View

**Owner:** Apurva Shetty · **Date:** 8 Sep 2026 · **Status:** Draft for review  
**Reviewers:** Product, Design, Engineering, Operations

## 1. Context

Agents currently view performance statistics across multiple portal pages. The existing My Statistics page requires selecting a date range and clicking **Get Details** before showing results. Its flat card layout also gives equal prominence to metrics that do not have equal importance.

Agents need one reliable place to understand current performance quickly and review recent weekly or monthly results when required.

## 2. Objective

Make My Statistics a clear, low-friction performance view that:

- Shows today’s performance when the page opens.
- Allows agents to review weekly and monthly periods.
- Prioritises the most useful metrics.
- Keeps secondary information available without overwhelming the page.
- Reduces unnecessary requests, calculations, and waiting time.

## 3. Users

Internal agents who use the portal to monitor their calls, orders, order value, and fulfilment-related performance.

## 4. Proposed experience

The existing portal header and footer remain unchanged.

### View and period selection

- Provide **Day**, **Week**, and **Month** views.
- Select **Day** by default.
- Day period: Today, from 00:00 through the current time.
- Week periods: This Week, Last Week, and Two Weeks Ago.
- Month periods: Current Month, Last Month, and Month Before Last.
- Limit available history to the most recent three months.
- Display clear date ranges for the selected period.
- Remove the current date-range form and **Get Details** action.

### Loading and timestamp behaviour

- Load statistics automatically when the page opens.
- Do not require a separate Refresh action in this release.
- Show a loading state while the initial request is in progress.
- Display the time when the page last successfully fetched statistics, labelled **Last loaded**.
- Do not continuously poll while the page remains open.

### Metric hierarchy

The default view should show **Key Performance** metrics first:

1. Total calls initiated
2. Total calls connected
3. Connected calls %
4. Total orders placed
5. Conversion %
6. Total order value
7. Orders on Hold
8. Scheduled Orders

Orders on Hold and Scheduled Orders are informational counts in this release.

Below the primary metrics, provide expandable groups:

- **Fulfilment:** retain the current Fulfilment metric set.
- **OTC:** retain the current OTC metric set.

Secondary groups should remain collapsed until selected. Expansion should happen within the page.

### Metric definitions

Use existing metric definitions, including the current definition of Conversion % based on connected calls and orders placed. Product, Engineering, and Data teams must confirm the existing definitions and data sources before implementation.

## 5. Performance requirements

- Initial Day view should use one aggregate statistics request, not separate requests for individual cards.
- Week and Month views should use precomputed or cached period aggregates where possible.
- The frontend should receive aggregate values rather than raw order or call records.
- Avoid run-time aggregation of raw transactions for page rendering.
- Engineering should baseline and agree p95 targets for initial load and period switching before development completes.
- Track API latency, database execution time, cache-hit rate, rows scanned, and error rate.

## 6. Page states

The page must support:

- Loading state.
- Populated state.
- Zero-activity state for a selected period.
- Error state with a clear recovery message.
- Responsive desktop layouts for narrower supported widths.

## 7. Success measures

Baseline and targets will be confirmed before release:

- Lower time for an agent to understand current performance.
- Lower dependence on date-range selection and repeated navigation.
- Improved page load and period-switch latency.
- Reduced statistics-page error rate.
- Usage of Week and Month views.
- Positive usability feedback from agents.

## 8. Dependencies

- Existing metric definitions and data sources.
- Aggregate data for Day, Week, and Month periods.
- Agreed timezone and period-boundary rules.
- Existing portal components and design system.
- Engineering measurement of API and database performance.

## 9. Release scope

Release the updated My Statistics page with Day, Week, and Month views, prioritised metrics, expandable Fulfilment and OTC groups, automatic initial loading, timestamp display, responsive layouts, and required page states.

Validate the design with representative agents before implementation and monitor performance and usage after release.

## 10. Acceptance criteria

- My Statistics opens on Today without requiring Get Details.
- Day, Week, and Month views show the supported periods.
- The eight Key Performance metrics are available with clear hierarchy.
- Fulfilment and OTC retain their current metrics and expand within the page.
- Orders on Hold and Scheduled Orders remain informational.
- Last loaded time reflects the most recent successful statistics request.
- Loading, zero-activity, error, and responsive states are covered.
- Initial load does not issue per-card requests or calculate statistics from raw transactions.

## 11. Artifacts

- **Live prototype:** https://acom-mystats-redesign.netlify.app — design reference only, not production code. States reachable via URL params: `?state=loading`, `?state=empty`, `?state=error`, `?view=week`, `?view=month`, `?view=month&open=fulfilment`, `?view=month&open=otc`.
- **Design handoff bundle** (markup, `styles.css`, `app.js` derived-metric formulas, `data.sample.json` API shape, `tokens.json`, visual-QA screenshots, handoff README): https://drive.google.com/drive/folders/16eqVgYWcsvk3j-tue1DdT8PxVIaaVXKy
- **Source branch:** `github.com/apurvashetty-tm/pm-agent` @ `acom-portal-revamp` — `projects/ACOM/acom-portal-revamp/My Statistics Page/`
- **Confluence:** https://truemeds.atlassian.net/wiki/spaces/PROD/pages/2019459073/ACOM+My+Statistics+Redesign
