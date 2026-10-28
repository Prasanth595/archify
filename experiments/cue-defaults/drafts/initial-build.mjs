import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const read = p => fs.readFileSync(path.join(dir, p), 'utf8').trimEnd();
const observation = JSON.parse(read('native/observation.json'));
const context = JSON.parse(read('native/source-context.json'));
if (observation.inputSha256 !== '3d378446b37f35eb300218ccb695c91404a71b81beefa2e79d95ac58fb93629d' || !['def', 'eval', 'export'].every(k => observation.modes[k].completeDomLinesCaptured)) throw new Error('Incomplete native packet');
const source = read('input/reader-modes.cue');
const outputs = Object.fromEntries(['def', 'eval', 'export'].map(k => [k, read(`native/${k}.txt`)]));
const sources = context.sources.map(s => `@source ${s.id} title=${JSON.stringify(s.label)} url=${s.url}`).join('\n');
const contextPanel = `## Official context and boundaries {#context}\n\n${context.sources.map(s => `${s.text}[](source:${s.id})`).join('\n\n')}\n\nThe fixture is authored for teaching, distinct from issue 1449. The Playground label is v0.17.0; its WASM bytes were not independently identified. The observations are Go API output, not CLI execution or an exit status. No human comprehension benefit has been measured.\n`;
const evidence = `## Complete authored input {#input}\n\n\`\`\`cue title="reader-modes.cue"\n${source}\n\`\`\`\n\n## Complete Playground output {#output}\n\nThe Playground displayed these results for the same input. Export shows two incomplete-value diagnostics; this is not a CLI exit status.[](source:playground)\n\n${['def', 'eval', 'export'].map(k => `\`\`\`cue title="${k}"\n${outputs[k]}\n\`\`\``).join('\n\n')}\n`;
const explanation = `## Why does the reference lack a usable default? {#reference}\n\nThe two input preferences disagree. Their default component has no usable result, while the allowed-value domain remains \`string\`. This is not a conflict that removes all valid values. The displayed disjunction is not a set of surviving defaults.[](source:spec)\n\n## Why does interpolation resolve here? {#interpolation}\n\nInterpolation requires a concrete expression result. In this fixture, the preference for \`detail\` supplies that result, producing a concrete string compatible with the reader constraint. This is a different expression, not a general override rule.[](source:spec)\n\n## Is audit valid, and does order choose a winner? {#controls}\n\n| Question | Observed result | Meaning |\n| --- | --- | --- |\n| Is \`audit\` valid? | \`explicitValue.mode: "audit"\` | Yes: an explicit string narrows the remaining domain. |\n| Does reversing operands pick a winner? | Both references show the same unresolved disjunction. | No winner is selected by operand order in this example. |\n\nUnification is commutative; the result is composition rather than last-writer precedence.[](source:spec)\n`;
const front = `# Why does a CUE reference lose its default? {#cue-defaults}\n\nThe reference has no usable default after the two preferences meet, but the field still accepts strings. Interpolation resolves to a concrete value in this fixture.[](source:spec)\n\n@answer scope="Authored teaching fixture · Playground v0.17.0 label · Go API"\n@meta locale=en\n${sources}\n\n`;
const drafts = { baseline: front + evidence + contextPanel + explanation, comparison: front + explanation + evidence + contextPanel };
fs.mkdirSync(path.join(dir, 'drafts'), {recursive:true}); fs.mkdirSync(path.join(dir, 'artifacts'), {recursive:true});
let failed = false;
for (const [name, text] of Object.entries(drafts)) {
  const draft = path.join(dir, 'drafts', `${name}.archify.md`);
  const artifact = path.join(dir, 'artifacts', `${name}.html`);
  fs.writeFileSync(draft, text);
  const result = spawnSync(process.execPath, [path.join(root, 'archify/bin/archify.mjs'), 'finalize', 'explainer', draft, artifact, '--json'], {cwd:root, encoding:'utf8'});
  fs.writeFileSync(path.join(dir, 'drafts', `${name}.stdout.json`), result.stdout);
  fs.writeFileSync(path.join(dir, 'drafts', `${name}.stderr.txt`), result.stderr);
  fs.writeFileSync(path.join(dir, 'drafts', `${name}.exit.txt`), String(result.status) + '\n');
  if (result.status !== 0) failed = true;
}
if (failed) process.exitCode = 1;
