import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Intercept process creation so Windows resolution is exercised on every host.
for (const [command, childEnv, entry] of [
  ['npm', { PATH: 'C:\\child' }, 'C:\\child\\node_modules\\npm\\bin\\npm-cli.js'],
  ['pnpm', { PNPM_HOME: 'C:\\child-pnpm' }, 'C:\\child-pnpm\\node_modules\\pnpm\\bin\\pnpm.cjs'],
]) {
  test(`both DSH launchers resolve ${command} from the child environment`, t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-child-env-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const preload = path.join(root, 'capture.cjs');
    fs.writeFileSync(preload, `
      Object.defineProperty(process, 'platform', { value: 'win32' });
      const fs = require('node:fs');
      fs.existsSync = p => p === ${JSON.stringify(entry)};
      const cp = require('node:child_process');
      cp.spawn = cp.spawnSync = (command, args, options) => ({command, args, options});
      require('node:module').syncBuiltinESMExports();
    `);
    const moduleUrl = new URL('../scripts/resolve-cli.mjs', import.meta.url).href;
    const result = spawnSync(process.execPath, ['--require', preload, '--input-type=module', '-e', `
      import { spawnCli, spawnCliSync } from ${JSON.stringify(moduleUrl)};
      const options = { env: ${JSON.stringify(childEnv)}, cwd: 'fixture' };
      console.log(JSON.stringify([spawnCli(${JSON.stringify(command)}, ['--version'], options),
        spawnCliSync(${JSON.stringify(command)}, ['--version'], options)]));
    `], { encoding: 'utf8', env: { ...process.env, npm_execpath: '', PATH: '', PNPM_HOME: '' } });
    assert.equal(result.status, 0, result.stderr);
    for (const call of JSON.parse(result.stdout)) {
      assert.equal(call.command, process.execPath);
      assert.deepEqual(call.args, [entry, '--version']);
      assert.deepEqual(call.options.env, childEnv);
      assert.equal(call.options.cwd, 'fixture');
    }
  });
}
