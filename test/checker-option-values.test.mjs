import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const script of ['check-community-packages','check-release-identity','check-stable-update-manifest']) {
 test(`${script} rejects missing root instead of checking the current directory`,()=>{
  for(const args of [['--root'],['--root','--archive','unused.zip']]) {
   const run=spawnSync(process.execPath,[`${root}/scripts/${script}.mjs`,...args],{cwd:root,encoding:'utf8'});
   assert.notEqual(run.status,0);
   assert.match(run.stderr,/--root requires a value/);
  }
 });
}
