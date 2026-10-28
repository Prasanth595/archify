#!/usr/bin/env node
// Offline consumer only: no detector, network access, or source-file reads.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(`refactoring-records: ${message}`); };
const object = x => x && typeof x === 'object' && !Array.isArray(x);
function text(x, at) { if (typeof x !== 'string' || !x.length) fail(`${at} must be a nonempty string`); }
function parse(bytes, label) { try { return JSON.parse(bytes.toString('utf8')); } catch (e) { fail(`${label}: invalid JSON (${e.message})`); } }
const literal = value => '`' + String(value).replaceAll('`', "'").replaceAll('\n', ' ') + '`';
function location(loc, at) {
  if (!object(loc)) fail(`${at} must be an object`);
  for (const k of ['filePath','codeElementType','description','codeElement']) text(loc[k], `${at}.${k}`);
  for (const k of ['startLine','endLine','startColumn','endColumn']) if (!Number.isInteger(loc[k]) || loc[k] < 1) fail(`${at}.${k} must be a positive integer`);
  if (loc.endLine < loc.startLine || (loc.startLine === loc.endLine && loc.endColumn < loc.startColumn)) fail(`${at}: reversed range`);
}
export function project(bytes, manifest) {
  const report = parse(bytes, 'input');
  if (!object(report) || !Array.isArray(report.commits)) fail('input.commits must be an array');
  report.commits.forEach((commit, ci) => {
    if (!object(commit)) fail(`commits[${ci}] must be an object`);
    for (const k of ['repository','sha1','url']) text(commit[k], `commits[${ci}].${k}`);
    if (!Array.isArray(commit.refactorings)) fail(`commits[${ci}].refactorings must be an array`);
    commit.refactorings.forEach((r, ri) => {
      if (!object(r)) fail(`record ${ci}/${ri} must be an object`);
      for (const k of ['type','description']) text(r[k], `record ${ci}/${ri}.${k}`);
      for (const side of ['leftSideLocations','rightSideLocations']) {
        if (!Array.isArray(r[side])) fail(`record ${ci}/${ri}.${side} must be an array`);
        r[side].forEach((l, li) => location(l, `record ${ci}/${ri}.${side}[${li}]`));
      }
    });
  });
  const source = { sha256: hash(bytes), bytes: bytes.length };
  let base = null;
  if (manifest !== undefined) {
    if (!object(manifest) || manifest.schemaVersion !== 1) fail('manifest.schemaVersion must be 1');
    if (report.commits.length !== 1) fail('identity manifest requires exactly one commit');
    const c = report.commits[0];
    for (const [k, expected] of Object.entries({inputSha256:source.sha256, repository:c.repository, head:c.sha1})) if (manifest[k] !== expected) fail(`manifest.${k} does not match input`);
    if (manifest.base !== null && !/^[a-f0-9]{40}$/.test(manifest.base ?? '')) fail('manifest.base must be a full SHA or null');
    if (manifest.base !== null && (!object(manifest.baseEvidence) || !/^https:\/\//.test(manifest.baseEvidence.url ?? '') || typeof manifest.baseEvidence.note !== 'string')) fail('manifest.baseEvidence must identify the independent base source');
    base = manifest.base;
  }
  const nodes = [], edges = [], records = [], sources = [], endpointIds = new Map();
  function endpoint(loc, side, commit) {
    const revision = side === 'before' ? base : commit.sha1;
    const identity = [side, revision ?? 'explicit-unknown-before', loc.filePath, loc.startLine, loc.endLine, loc.startColumn, loc.endColumn, loc.codeElementType];
    const key = JSON.stringify(identity);
    if (endpointIds.has(key)) return endpointIds.get(key);
    const id = `endpoint-${nodes.length}`;
    const node = {id, side, revision, location:loc}; nodes.push(node); endpointIds.set(key,id);
    const github = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/.exec(commit.repository);
    if (github && revision && /^[a-f0-9]{40}$/.test(revision)) {
      node.sourceId = `source-${id}`;
      const filePath = loc.filePath.split('/').map(encodeURIComponent).join('/');
      sources.push({id:node.sourceId, title:`${side} · ${loc.filePath} · ${revision.slice(0,7)}`, url:`https://github.com/${github[1]}/${github[2]}/blob/${revision}/${filePath}#L${loc.startLine}-L${loc.endLine}`});
    }
    return id;
  }
  report.commits.forEach((commit, ci) => commit.refactorings.forEach((raw, ri) => {
    const index = records.length, id = `record-${index}`, reasons = [];
    if (report.commits.length !== 1) reasons.push('multiple commits are not projected');
    if (!['Pull Up Method','Pull Up Attribute'].includes(raw.type)) reasons.push('unsupported type');
    if (raw.leftSideLocations.length !== 1 || raw.rightSideLocations.length !== 1) reasons.push('requires exactly one left and one right location');
    const record = {id, index, commitIndex:ci, recordIndex:ri, status:reasons.length ? 'unsupported' : 'projected', reasons, raw};
    records.push(record);
    if (!reasons.length) {
      const from = endpoint(raw.leftSideLocations[0], 'before', commit), to = endpoint(raw.rightSideLocations[0], 'after', commit);
      edges.push({id, from, to, label:`R${index}`}); record.endpoints = [from,to];
    }
  }));
  const count = {commits:report.commits.length, records:records.length, locations:records.reduce((n,r)=>n+r.raw.leftSideLocations.length+r.raw.rightSideLocations.length,0), projected:edges.length, unsupported:records.length-edges.length, before:nodes.filter(n=>n.side==='before').length, after:nodes.filter(n=>n.side==='after').length};
  const ledger = {format:'archify-offline-record-ledger-v1', source, identityManifest:manifest ?? null, count, records, endpoints:nodes, edges, originalReport:report};
  const detail = record => {
    const descriptions = [`报告描述：${literal(record.raw.description)}`];
    for (const [key, side] of [['leftSideLocations','before'],['rightSideLocations','after']]) for (const loc of record.raw[key]) {
      const node = record.endpoints ? nodes.find(n=>n.id===record.endpoints[side==='before'?0:1]) : undefined;
      descriptions.push(`${side} · ${side==='before' ? (base ? base.slice(0,7) : '版本未知') : report.commits[record.commitIndex].sha1.slice(0,7)} · ${literal(loc.description)} · ${literal(loc.filePath)} · L${loc.startLine}–${loc.endLine} C${loc.startColumn}–${loc.endColumn} · ${literal(loc.codeElementType)} · ${literal(loc.codeElement)}${node?.sourceId ? ` [](source:${node.sourceId})` : ''}`);
    }
    if (record.reasons.length) descriptions.push(`未投影：${record.reasons.join('; ')}。完整记录保留于旁置 ledger.json 和 input.json。`);
    return descriptions.join('\n\n');
  };
  if (manifest?.inputEvidence?.url && /^https:\/\//.test(manifest.inputEvidence.url)) sources.push({id:'input-evidence',title:'上游完整输入来源（非本轮检测）',url:manifest.inputEvidence.url});
  const blocks = [];
  if (edges.length) {
    const before = nodes.filter(n=>n.side==='before'), after = nodes.filter(n=>n.side==='after');
    const components = nodes.map(n=>({id:n.id,type:n.side==='before'?'external':'backend',label:`${n.side} · ${path.posix.basename(n.location.filePath)}`,sublabel:`${({METHOD_DECLARATION:'method',FIELD_DECLARATION:'attribute'}[n.location.codeElementType] ?? n.location.codeElementType)} · L${n.location.startLine}–${n.location.endLine}`,tag:n.revision?n.revision.slice(0,7):'版本未知',pos:[n.side==='before'?40:620,60+(n.side==='before'?before:after).indexOf(n)*150],size:[300,100]}));
    blocks.push({id:'refactoring-map',type:'diagram',diagramType:'architecture',spec:{schema_version:1,diagram_type:'architecture',meta:{title:'报告声明：before → after',output:'refactoring-map.html',quality_profile:'standard',legend:{entries:{external:{label:'before 声明'},backend:{label:'after 声明'}}}},components,connections:edges.map(e=>({...e,fromSide:'right',toSide:'left'}))}});
  }
  if (records.length) blocks.push({id:'records',type:'steps',items:records.map(r=>({id:`step-${r.id}`,text:`R${r.index} · ${r.raw.type}${r.status==='unsupported'?' · 未投影':''}`,detail:detail(r),...(r.status==='projected'?{target:{diagram:'refactoring-map',edges:[r.id]}}:{})}))});
  if (!records.length) blocks.push({id:'empty-records',type:'prose',text:'输入没有记录；保留完整输入与账目，不创建空图。'});
  const summary = `${count.records} 条原记录，${count.locations} 个位置；${count.projected} 条已投影，${count.unsupported} 条未投影。图中保留 ${count.before} 个 before、${count.after} 个 after 端点。`;
  const document = {schema_version:1,diagram_type:'explainer',meta:{id:'refactoring-records',title:'结构变更记录：逐条读取报告声明',locale:'zh-CN',quality_profile:'standard'},answer:{summary,scope:'离线读取上游明确记录；R 编号表示报告声明关系，不代表调用、执行或行为等价。缺少 base 时保留 before 坐标并标注版本未知。'},panels:[{id:'reading',title:edges.length?'逐条读取报告声明':'完整保留，当前输入未作图',blocks},{id:'provenance',title:'输入与阅读边界',blocks:[{id:'provenance-note',type:'list',items:[`完整输入：input.json（${source.bytes} bytes）；原账目：ledger.json；原文阅读基线：baseline.html。`,`原始顺序与重复记录均保留；只投影单 commit、每侧一个位置的 Pull Up Method / Attribute。`,`source 卡只提供固定版本外链，不是已核验代码摘录。`,...(manifest?.inputEvidence ? [`输入身份：${literal(manifest.inputEvidence.kind)} [](source:input-evidence)`] : ['上游 JSON 不证明本轮运行检测器；本离线 CLI 没有运行检测器。'])]},{id:'interaction-note',type:'prose',text:'点击记录标题，原生 Viewer 选择该声明边与两端；关闭或 Escape 返回发起记录。任意图节点/边直接跳回记录不在本实验范围。'}]}],sources};
  return {ledger,document,summary};
}
export function writeProjection(input, output, manifestPath) {
  const bytes = fs.readFileSync(input), manifest = manifestPath ? parse(fs.readFileSync(manifestPath),'manifest') : undefined;
  const result = project(bytes, manifest); fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'input.json'),bytes);
  for (const [name,value] of [['ledger.json',result.ledger],['explainer.json',result.document]]) fs.writeFileSync(path.join(output,name),JSON.stringify(value,null,2)+'\n');
  const escaped = bytes.toString('utf8').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  fs.writeFileSync(path.join(output,'baseline.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>完整 JSON 阅读基线</title><style>body{font:16px system-ui;margin:24px;max-width:1100px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 monospace}a{color:#1762a4}</style><h1>完整 JSON 阅读基线</h1><p>${bytes.length} bytes · 完整上游输入（离线 CLI 不运行检测器）。<a href="input.json">原始字节</a> · <a href="ledger.json">完整派生账目</a> · <a href="index.html">原生关系阅读页</a></p><pre>${escaped}</pre></html>`);
  fs.writeFileSync(path.join(output,'summary.txt'),result.summary+'\n原始字节 input.json；派生账目 ledger.json；阅读基线 baseline.html。\n');
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [input, output, manifest, ...extra] = process.argv.slice(2);
    if (!input || !output || extra.length) fail('usage: node project.mjs INPUT_JSON OUTPUT_DIR [IDENTITY_MANIFEST]');
    console.log(writeProjection(input,output,manifest).summary);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
