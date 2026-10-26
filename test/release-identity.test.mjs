import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const checker = path.join(repoRoot, 'scripts', 'check-release-identity.mjs');

function runCheck(root) {
  return spawnSync(process.execPath, [checker, '--root', root], {
    encoding: 'utf8',
  });
}

function fixture(t, version, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-release-identity-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const [major, minor] = version.split('.');
  const files = {
    'archify/package.json': JSON.stringify({ name: 'archify', version }),
    'archify/package-lock.json': JSON.stringify({ version, packages: { '': { version } } }),
    'archify/skill-release.json': JSON.stringify({
      schemaVersion: 1,
      skillId: 'archify',
      channel: version.includes('-dev.') ? 'development' : 'stable',
      version,
      source: { repository: 'https://github.com/tt-a1i/archify' },
      updateManifestUrl: 'https://tt-a1i.github.io/archify/skill-updates/archify/stable.json',
    }),
    'archify/SKILL.md': `---\nmetadata:\n  version: "${major}.${minor}"\n---\n`,
    'archify/assets/template.html': `<meta name="generator" content="archify ${version}">`,
    ...overrides,
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return root;
}

test('release identity passes for this repository', () => {
  const result = runCheck(repoRoot);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /release identity ok: /);
});

test('stable and development identities pass when every artifact agrees', (t) => {
  for (const version of ['2.13.0', '2.13.0-dev.4']) {
    const result = runCheck(fixture(t, version));
    assert.equal(result.status, 0, `${version}: ${result.stderr}`);
  }
});

test('unsupported package versions are rejected', (t) => {
  for (const version of ['2.13', '2.13.0-beta.1', '2.13.0+build']) {
    const result = runCheck(fixture(t, '2.13.0', {
      'archify/package.json': JSON.stringify({ name: 'archify', version }),
    }));
    assert.equal(result.status, 1, version);
    assert.match(result.stderr, /not a supported SemVer identity/, version);
  }
});

test('mismatched release artifacts are each reported', (t) => {
  const cases = [
    ['archify/package-lock.json', JSON.stringify({ version: '2.12.0', packages: { '': { version: '2.12.0' } } }), /package-lock\.json must match 2\.13\.0/],
    ['archify/SKILL.md', '---\nmetadata:\n  version: "2.12"\n---\n', /SKILL\.md metadata version 2\.12 must map to package 2\.13\.0 as 2\.13/],
    ['archify/assets/template.html', '<meta name="generator" content="archify 2.12.0">', /template\.html generator must be archify 2\.13\.0/],
    ['archify/skill-release.json', JSON.stringify({ schemaVersion: 1, skillId: 'archify', channel: 'development', version: '2.13.0' }), /skill-release\.json must identify archify 2\.13\.0 as stable/],
  ];
  for (const [file, content, expected] of cases) {
    const result = runCheck(fixture(t, '2.13.0', { [file]: content }));
    assert.equal(result.status, 1, file);
    assert.match(result.stderr, expected, file);
  }
});

test('missing release artifacts fail closed', (t) => {
  const root = fixture(t, '2.13.0');
  fs.rmSync(path.join(root, 'archify', 'SKILL.md'));
  const result = runCheck(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /archify\/SKILL\.md is missing or unreadable/);
});
