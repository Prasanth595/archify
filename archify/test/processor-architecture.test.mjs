import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin/archify.mjs');
const fixture = path.join(root, 'examples/processor-architecture.architecture.json');

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('processor architecture facts validate and render as semantic SVG attributes', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-processor-'));
  const output = path.join(outputDir, 'processor.html');
  const result = run(['render', 'architecture', fixture, output]);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(output, 'utf8');
  assert.match(html, /data-processor-architecture="arm64"/);
  assert.match(html, /data-processor-cores="8"/);
  assert.match(html, /data-semantic-sigil="processor"/);
  assert.match(html, /3\.2 GHz/);
  fs.rmSync(outputDir, { recursive: true, force: true });
});

test('processor schema rejects invalid capacity facts', () => {
  const input = JSON.parse(fs.readFileSync(fixture, 'utf8'));
  input.components.find((component) => component.id === 'cpu').cores = 0;
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-processor-invalid-'));
  const inputPath = path.join(outputDir, 'invalid.json');
  fs.writeFileSync(inputPath, JSON.stringify(input));
  const result = run(['validate', 'architecture', inputPath, '--json']);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /\/components\/1\/cores/);
  fs.rmSync(outputDir, { recursive: true, force: true });
});

test('authored processor sublabel remains authoritative', () => {
  const input = JSON.parse(fs.readFileSync(fixture, 'utf8'));
  const cpu = input.components.find((component) => component.id === 'cpu');
  cpu.sublabel = 'custom runtime label';
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-processor-label-'));
  const inputPath = path.join(outputDir, 'input.json');
  const outputPath = path.join(outputDir, 'output.html');
  fs.writeFileSync(inputPath, JSON.stringify(input));
  const result = run(['render', 'architecture', inputPath, outputPath]);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(outputPath, 'utf8');
  assert.match(html, />custom runtime label</);
  assert.doesNotMatch(html, />8 cores ·/);
  fs.rmSync(outputDir, { recursive: true, force: true });
});

