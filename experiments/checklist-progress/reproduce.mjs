import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Public CLI reproduction; optional argv[2] selects a separately prepared base checkout.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '../..'));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-checklist-reproduce-'));
for (const name of ['original', 'reordered', 'prose-edited']) {
  const result = spawnSync(process.execPath, [path.join(root, 'archify/bin/archify.mjs'),
    'finalize', 'explainer', path.join(here, 'inputs', `${name}.json`),
    path.join(output, `${name}.html`), '--json'], {
    encoding: 'utf8', env: { ...process.env, ARCHIFY_UPDATE_CHECK_DISABLED: '1' },
  });
  fs.writeFileSync(path.join(output, `${name}.stdout.json`), result.stdout || '');
  fs.writeFileSync(path.join(output, `${name}.stderr.txt`), result.stderr || '');
  if (result.error || result.status !== 0) throw result.error || new Error(`${name}: CLI exit ${result.status}; see ${output}`);
}
console.log(output);
