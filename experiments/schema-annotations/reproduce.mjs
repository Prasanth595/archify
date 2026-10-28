import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(process.argv[2] || path.join(root, '../../package.json')));
const Ajv = require('ajv/dist/2020.js');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const source = fs.readFileSync(path.join(root, 'upstream/unevaluatedProperties.json'));
const groups = JSON.parse(source);
const index = groups.findIndex(g => g.description === 'unevaluatedProperties with anyOf');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'fixture.json')));
assert.deepEqual(fixture, groups[index], 'complete upstream group, including all four contrasting cases');
assert.equal(fixture.tests.length, 4);
const before = JSON.stringify(fixture);
const runs = [];
for (const allErrors of [false, true]) {
  const ajv = new Ajv({ strict:false, allErrors });
  const main = ajv.compile(fixture.schema);
  const anyOf = ajv.compile({ $schema:fixture.schema.$schema, anyOf:fixture.schema.anyOf });
  const rootProperties = ajv.compile({ $schema:fixture.schema.$schema, properties:fixture.schema.properties });
  const branches = fixture.schema.anyOf.map(s => ajv.compile(s));
  for (const [caseIndex, test] of fixture.tests.entries()) {
    const valid = main(test.data);
    const errors = structuredClone(main.errors);
    assert.equal(valid, test.valid);
    const independentBranchChecks = branches.map((check, i) => ({
      schemaPointer:`#/anyOf/${i}`, valid:check(test.data), errors:structuredClone(check.errors),
    }));
    const anyOfValid = anyOf(test.data);
    const rootValid = rootProperties(test.data);
    assert.equal(anyOfValid, true); assert.equal(rootValid, true);
    // This projection is deliberately limited to this fixed upstream group.
    // It is not an Ajv execution trace or a general annotation evaluator.
    const coveredProperties = [...new Set([
      ...Object.keys(fixture.schema.properties),
      ...independentBranchChecks.flatMap((b, i) => b.valid ? Object.keys(fixture.schema.anyOf[i].properties) : []),
    ])].filter(k => Object.hasOwn(test.data, k)).sort();
    const remainingProperties = Object.keys(test.data).filter(k => !coveredProperties.includes(k)).sort();
    assert.deepEqual(remainingProperties, (errors || []).filter(e => e.keyword === 'unevaluatedProperties').map(e => e.params.unevaluatedProperty).sort());
    runs.push({ caseIndex, allErrors, description:test.description, data:test.data, expected:test.valid,
      valid, errors, independentAnyOfValid:anyOfValid, independentRootPropertiesValid:rootValid,
      independentBranchChecks, derived:{ coveredProperties, remainingProperties,
        method:'fixed-fixture projection from independent checks and the 2020-12 rule; not native annotations' } });
  }
}
assert.equal(JSON.stringify(fixture), before, 'validation must not mutate the input');
const result = { toolchain:{ node:process.versions.node, ajv:require('ajv/package.json').version },
  source:{ repository:'json-schema-org/JSON-Schema-Test-Suite', revision:'89e83a74014617ffbe79a56d83d14d054cd11417',
    path:'tests/draft2020-12/unevaluatedProperties.json', groupPointer:`/${index}`, sha256:digest(source) },
  options:{ strict:false, allErrors:[false,true], defaults:'remaining Ajv defaults; no data coercion' }, runs };
fs.mkdirSync(path.join(root,'evidence'),{ recursive:true });
fs.writeFileSync(path.join(root,'evidence/observations.json'), JSON.stringify(result,null,2)+'\n');
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sections = fixture.tests.map((test,i) => `<section id="case-${i+1}"><h2>案例 ${i+1}：${escape(test.description)}</h2><h3>完整输入</h3><pre>${escape(JSON.stringify(test.data,null,2))}</pre><h3>完整记录：主校验、独立检查、有限集合推导</h3><pre>${escape(JSON.stringify(runs.filter(r=>r.caseIndex===i),null,2))}</pre></section>`).join('\n');
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Schema annotations · 同源原文视图</title><style>body{font:16px/1.6 system-ui;margin:32px auto;padding:0 20px;max-width:1100px;color:#142135;background:#f5f7fa}h1{font-size:30px}a{color:#1466bb}nav{display:flex;gap:18px;flex-wrap:wrap}section{margin:24px 0;padding:20px;background:white;border:1px solid #d4deea;border-radius:12px;min-width:0}pre{overflow:auto;white-space:pre;font:14px/1.5 ui-monospace,monospace;padding:16px;background:#edf1f6;border-radius:8px}code{font-family:ui-monospace,monospace}</style><h1>baz 写进 schema，为什么仍被拒绝？</h1><p>案例 2 中，baz 分支失败，不能贡献属性覆盖。anyOf 成功，但 baz 仍未覆盖，整体校验失败。</p><p>这是原文材料的阅读包装，不是 Ajv 官方界面。与解释页使用同一完整 schema、四个官方案例和本机记录；分支检查不是执行轨迹。</p><nav><a href="#schema">完整 schema</a>${fixture.tests.map((_,i)=>`<a href="#case-${i+1}">案例 ${i+1}</a>`).join('')}<a href="explanation.html">解释页</a></nav><section id="schema"><h2>完整 schema</h2><pre>${escape(JSON.stringify(fixture.schema,null,2))}</pre></section>${sections}<section><h2>来源与许可</h2><p>JSON-Schema-Test-Suite · Julian Berman · MIT；固定 revision ${result.source.revision}，group ${result.source.groupPointer}。</p><p><a href="https://github.com/json-schema-org/JSON-Schema-Test-Suite/blob/${result.source.revision}/${result.source.path}">官方原件</a> · <a href="upstream/LICENSE">许可全文</a> · <a href="evidence/observations.json">完整本机记录</a></p><pre>${escape(JSON.stringify(result.toolchain,null,2))}</pre></section></html>`;
fs.writeFileSync(path.join(root,'raw-records.html'),html);
console.log(JSON.stringify({ pass:true,wholeValidations:runs.length,independentBranchChecks:runs.length*fixture.schema.anyOf.length,schemaGroup:result.source.groupPointer,toolchain:result.toolchain }));
