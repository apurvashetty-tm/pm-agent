const fs = require('fs');
const vm = require('vm');
const sharp = require('/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source = fs.readFileSync('/Users/mac/src/pm-agent/design-system/icons/icons.js', 'utf8');
const context = { window: {}, document: { readyState: 'loading', addEventListener() {} }, console };
vm.runInNewContext(source, context);
async function run() {
  const items = [
    ['bell', '#5B616E'], ['help-circle', '#5B616E'], ['user-circle', '#5B616E'],
    ['clock', '#5B616E'], ['prescription', '#5B616E']
  ];
  for (const [name, color] of items) {
    const svg = context.window.TMIcons.svg(name).replace('currentColor', color);
    await sharp(Buffer.from(svg)).resize(48, 48).png().toFile(`/private/tmp/home-${name}.png`);
  }
  await sharp('/Users/mac/src/pm-agent/projects/truemeds-doctor-portal-prototype/brand/truemeds-for-doctors.svg')
    .resize({ width: 298 }).png().toFile('/private/tmp/home-logo.png');
}
run().catch(error => { console.error(error); process.exit(1); });
