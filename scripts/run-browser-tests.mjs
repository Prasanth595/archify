#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChrome } from '../archify/bin/visual-check.mjs';
import { testRunnerOptions } from './test-runner-options.mjs';

import { browserTestFiles as testFiles } from './browser-test-inventory.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let options;
try {
  if (new Set(testFiles).size !== testFiles.length) throw new Error('Browser inventory contains duplicate files');
  options = testRunnerOptions(process.argv.slice(2), {
    repoRoot, testFiles: testFiles.map(file => path.join('test', file)), allowShards: true,
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
if (options.list) {
  console.log(options.files.join('\n'));
  process.exit(0);
}

const chrome = findChrome();
if (!chrome) {
  console.error('Browser tests require an executable Chrome/Chromium (or Microsoft Edge). Set ARCHIFY_CHROME to its path; this gate cannot skip browser coverage.');
  process.exit(1);
}

console.error(`Browser tests: ${options.files.length} files, concurrency ${options.concurrency}${options.shard ? `, shard ${options.shard.index}/${options.shard.count}` : ''}`);
const result = spawnSync(process.execPath, options.args, {
  cwd: repoRoot,
  env: { ...process.env, ARCHIFY_CHROME: chrome },
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.signal) console.error(`browser test runner terminated by ${result.signal}`);
process.exitCode = result.signal ? 1 : (result.status ?? 1);
