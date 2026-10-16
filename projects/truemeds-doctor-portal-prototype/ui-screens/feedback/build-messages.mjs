import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const messages = JSON.parse(readFileSync(join(here, 'messages.json'), 'utf8'));
const metadata = JSON.parse(readFileSync(join(here, 'metadata.json'), 'utf8'));
for (const id of new Set([...Object.keys(messages), ...Object.keys(metadata)])) {
  if (typeof messages[id] !== 'string' || !metadata[id]) throw new Error(`Missing feedback copy or metadata: ${id}`);
  const actual = [...messages[id].matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  const allowed = [...(metadata[id].placeholders || [])].sort();
  if (JSON.stringify(actual) !== JSON.stringify(allowed)) throw new Error(`Placeholder mismatch: ${id}`);
  for (const key of ['pattern', 'trigger', 'slot', 'next', 'clear', 'retain', 'copy']) {
    if (!metadata[id][key]) throw new Error(`Missing ${key}: ${id}`);
  }
}
const serialized = JSON.stringify(messages, null, 2);
writeFileSync(join(here, 'messages.js'), `// Generated from messages.json. Do not edit.\n(() => {\n  const messages = Object.freeze(${serialized});\n  window.TMFeedback = Object.freeze({\n    messages,\n    msg(id, values = {}) {\n      const template = messages[id];\n      if (typeof template !== 'string') throw new Error('Unknown feedback message: ' + id);\n      return template.replace(/\\{(\\w+)\\}/g, (_, key) => {\n        if (values[key] === undefined) throw new Error('Missing feedback value: ' + key);\n        return String(values[key]);\n      });\n    }\n  });\n})();\n`);
writeFileSync(join(here, '../native/messages.ts'), `// Generated from ../feedback/messages.json. Do not edit.\nexport const messages = ${serialized} as const;\nexport type FeedbackMessageId = keyof typeof messages;\nexport function message(id: FeedbackMessageId, values: Record<string, string | number> = {}): string {\n  return messages[id].replace(/\\{(\\w+)\\}/g, (_, key: string) => {\n    if (values[key] === undefined) throw new Error('Missing feedback value: ' + key);\n    return String(values[key]);\n  });\n}\n`);
