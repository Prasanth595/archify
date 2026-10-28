#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { analyzeArchitecture, makeExplainer } from './mandatory-paths.mjs';

const [input, s, t, outputDirectory, ...extra] = process.argv.slice(2);
try {
  if (!input || !s || !t || !outputDirectory || extra.length) throw new Error('Usage: node experiments/mandatory-paths/cli.mjs <architecture.json> <s> <t> <output-directory>. Only omitted connection.direction is supported by the current native schema.');
  const bytes = fs.readFileSync(input);
  const answer = await analyzeArchitecture(bytes, { s, t }, { baseDir: path.dirname(path.resolve(input)) });
  fs.mkdirSync(outputDirectory, { recursive: true });
  const output = path.resolve(outputDirectory);
  fs.writeFileSync(path.join(output, 'input.architecture.json'), bytes);
  const cli = fileURLToPath(new URL('../../archify/bin/archify.mjs', import.meta.url));
  const nativeArgs = [cli, 'render', 'architecture', path.join(output, 'input.architecture.json'), path.join(output, 'full-native.html'), '--quality', 'standard'];
  const native = spawnSync(process.execPath, nativeArgs, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  fs.writeFileSync(path.join(output, 'native-render-command.json'), `${JSON.stringify({ executable: process.execPath, args: nativeArgs, status: native.status, error: native.error?.message }, null, 2)}\n`);
  fs.writeFileSync(path.join(output, 'native-render.stdout.log'), native.stdout || '');
  fs.writeFileSync(path.join(output, 'native-render.stderr.log'), native.stderr || '');
  if (native.error || native.status !== 0) throw new Error(`Native render failed; see ${output}/native-render.*.log`);
  fs.writeFileSync(path.join(output, 'answer.json'), `${JSON.stringify(answer, null, 2)}\n`);
  fs.writeFileSync(path.join(output, 'explainer.json'), `${JSON.stringify(makeExplainer(answer, JSON.parse(bytes)), null, 2)}\n`);
  const args = [cli, 'finalize', 'explainer', path.join(output, 'explainer.json'), path.join(output, 'explainer.html'), '--quality', 'standard', '--json'];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  fs.writeFileSync(path.join(output, 'finalize-command.json'), `${JSON.stringify({ executable: process.execPath, args, status: result.status, error: result.error?.message }, null, 2)}\n`);
  fs.writeFileSync(path.join(output, 'finalize.stdout.log'), result.stdout || '');
  fs.writeFileSync(path.join(output, 'finalize.stderr.log'), result.stderr || '');
  if (result.error || result.status !== 0) throw new Error(`Public finalize failed; see ${output}/finalize.*.log`);
  console.log(JSON.stringify({ status: 'ok', output, answerStatus: answer.status, requiredInternalNodes: answer.requiredInternalNodes, browserAcceptance: 'not-performed' }));
} catch (error) {
  console.error(JSON.stringify({ status: 'error', code: error.code || 'mandatory-paths/failure', message: error.message,
    ...(error.archifyDiagnostics ? { diagnostics: error.archifyDiagnostics } : {}) }, null, 2));
  process.exitCode = 1;
}
