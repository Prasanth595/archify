// Deterministic first drafts from the committed observation packet; no renderer.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const prefix = 'experiments/kconfig-imply-reading/';
const revision = 'a2c5843748d3843baa21708f3ec0c51fb15c9985';
const entries = [
  ['kimply', 'Complete Kimply fixture', 'upstream/tests/Kimply', 'text'],
  ['implier', 'Native formatter: implier', 'observation/run01/output/native-info/IMPLY_DIRECT_DEPS.txt', 'text'],
  ['unmet', 'Native formatter: unmet target', 'observation/run01/output/native-info/UNMET_DIRECT_1.txt', 'text'],
  ['met', 'Native formatter: met target', 'observation/run01/output/native-info/MET_DIRECT_1.txt', 'text'],
  ['config', 'Generated config', 'observation/run01/output/generated.config', 'text'],
  ['values', 'All 26 observed symbols', 'observation/run01/output/all-symbol-values.json', 'json'],
];
const lineCount = (file) => {
  const text = fs.readFileSync(path.join(here, file), 'utf8');
  return text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length;
};
const values = JSON.parse(fs.readFileSync(path.join(here, entries[5][2]), 'utf8'));
if (values.length !== 26 || lineCount(entries[0][2]) !== 145) throw new Error('Frozen packet differs from the recorded scope');
const byName = Object.fromEntries(values.map((s) => [s.name, s]));
for (const [name, value, direct, weak] of [
  ['IMPLY_DIRECT_DEPS', 'y', 'y', 'n'],
  ['UNMET_DIRECT_1', 'n', 'n', 'y'],
  ['MET_DIRECT_1', 'y', 'y', 'y'],
]) {
  const s = byName[name];
  if (!s || s.value !== value || s.direct_dependency_value !== direct || s.weak_reverse_dependency_value !== weak || s.visibility !== 'n' || s.user_value !== null) throw new Error(`Unexpected observation: ${name}`);
}
const sources = entries.map(([id, title, file]) => `@source ${id} title="${title}" path=${prefix}${file} lines=1:${lineCount(file)}`).join('\n');
const panels = entries.map(([id, title, , language]) => `## ${title} {#panel-${id}}\n\n@code source=${id} language=${language}`).join('\n\n');
const common = `@answer scope="Kconfiglib Kimply · Python 3.15 · no user config"\n@meta locale=en repo_url=https://github.com/tt-a1i/archify repo_revision=${revision}\n${sources}`;
const baseline = `# Inspect the native Kconfig evidence {#native-reading}\n\nThis packet contains the complete fixture and native observation for the same Kconfig run.\n\n${common}\n\n${panels}\n`;
const candidate = `# Why does one imply produce two values? {#imply-comparison}\n\nBoth targets receive a weak reverse dependency of \`y\`, but their direct dependencies differ: the unmet target is \`n\` and the met target is \`y\`.[](source:values)\n\n${common}\n\n## What differs between the two targets? {#comparison}\n\n| Observation | UNMET_DIRECT_1 | MET_DIRECT_1 |\n| --- | --- | --- |\n| Same implier | IMPLY_DIRECT_DEPS = y | IMPLY_DIRECT_DEPS = y |\n| Weak reverse dependency | y | y |\n| Direct dependency | n | y |\n| Observed value | n | y |\n| Visibility | n | n |\n| User value | null | null |\n\nThe fixture explicitly gives the first target \`depends on n\`; the second has no direct restriction in its definition.[](source:kimply) The native formatter names the same implier for both.[](source:unmet)[](source:met)\n\n## Why does absence from the config not mean uncalculated? {#absence}\n\nThe generated config omits the unmet target.[](source:config) Its value \`n\` comes from the observed JSON and the native formatter, not an explicit config line.[](source:values)[](source:unmet) All three relevant symbols have visibility \`n\` and no user value in this run.[](source:values)\n\n${panels}\n`;
for (const [name, content] of [['native-baseline.archify.md', baseline], ['comparison.archify.md', candidate]]) {
  fs.writeFileSync(path.join(here, 'drafts', name), content);
  console.log(path.relative(repo, path.join(here, 'drafts', name)));
}
