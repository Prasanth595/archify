import fs from 'node:fs';

const css = fs.readFileSync(new URL('./lumen.css', import.meta.url), 'utf8') + fs.readFileSync(new URL('./structures.css', import.meta.url), 'utf8');
const data = fs.readFileSync(new URL('./document-data.js', import.meta.url), 'utf8');
const graph = fs.readFileSync(new URL('./graph.js', import.meta.url), 'utf8');
const logo = fs.readFileSync(new URL('../../../../docs/assets/archify-lockup-light.svg', import.meta.url), 'utf8')
  .replaceAll('#111827', 'currentColor').replace('id="title"', '').replace('role="img" aria-labelledby="title"', 'aria-hidden="true"');
const chapters = [1,2,3].map(index => `<section class="source-chapter"><h2 id="chapter-${index}">章节${index}</h2><div class="source-body"><p>章节内容</p></div></section>`).join('\n');
const designs = [
  {name:'decision',title:'决策简报',label:'DECISION BRIEF'},
  {name:'analysis',title:'分析札记',label:'ANALYSIS NOTES'},
  {name:'review',title:'进展复盘',label:'RETROSPECTIVE'},
];
for(const design of designs){
  const script = data + (design.name === 'decision' ? '' : graph) + fs.readFileSync(new URL('./' + (design.name==='review'?'lumen':design.name) + '.js', import.meta.url), 'utf8');
  const html = `<!doctype html><html lang="zh" data-design="${design.name}" ${design.name==='review'?'data-start="comparison"':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Archify · ${design.title}</title><style>${css}</style></head><body><div class="ambient" aria-hidden="true"><i></i><i></i><i></i></div><header class="masthead"><a class="brand" href="#" aria-label="Archify">${logo}</a><span class="study-label">${design.label} / DYNAMIC EDITION</span><span class="edition-label">${design.title} · 动态</span></header><main><header class="hero"><div class="eyebrow">${design.label} / ${design.title}</div><h1>文档标题</h1><p>文档引言</p></header><div class="source-reading" id="source-reading">${chapters}</div></main><footer><span>Archify · ${design.title}</span><span>观点 · 证据 · 下一步</span></footer><script>${script}</script></body></html>\n`;
  fs.writeFileSync(new URL('./'+design.name+'.html', import.meta.url), html);
}
console.log('Built the three dynamic designs: decision, analysis and review.');
