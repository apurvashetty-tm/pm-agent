// Run B dispute check (test-disputes.md #1): Codex's B-play-* cases, unchanged except the link is read with textContent (the
// Test on phone row is folded once another panel row opens: the rows are one exclusive accordion, D-97 / A0), so innerText is "".
// Run from the project folder: node docs/renders/2026-11-09-build-fast/run-B/tools/b-play-textcontent.mjs
import { run, assert, ms } from '../../../../../tests/codex/run-A/harness.mjs';
const cases = [];
for (const scenario of ['cat4', 'pilot_ha_free', 'pilot_no_ha_free', 'pilot_ha_skipped_customer', 'pilot_ha_skipped_system']) cases.push({
  id: 'B-play-' + scenario + '-textContent', name: 'desktop and phone play-link route parity (link read with textContent)', state: 't01-ready',
  source: 'tests/codex/run-B/journeys.mjs B-play-*', fields: { scenario },
  test: async (d, app) => {
    await d.choose('start', 'case'); const link = await d.p.locator('#rp-link').textContent();   // the only change
    const phone = await app.open('', {}, 390);
    try {
      await phone.p.goto(link.replace(/^https?:\/\/[^/]+\//, d.base)); await phone.p.waitForTimeout(200);
      for (const x of [d, phone]) {
        for (let i = 0; i < 20; i++) { const pending = x.root().locator('#medicines-list .tm-row').filter({ hasText: 'Pending' }); if (!await pending.count()) break; await pending.first().click(); await x.click('Prescribe'); await x.settle(); }
        await x.click('Call patient'); await x.ff(ms('gate') + ms('pollingInterval') * 3);
        if (scenario === 'pilot_ha_free' || scenario === 'pilot_no_ha_free') await x.buttons(['Confirm prescription', 'Skip HA']);
        else { await x.ff(ms('gate')); await x.buttons(['Confirm prescription'], ['Skip HA']); }
      }
      assert.equal(await phone.p.locator('#review-panel').isVisible(), false, 'Phone panel must not overlay app'); await phone.clean();
    } finally { await phone.close(); }
  },
});
await run(cases);
