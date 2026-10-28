#!/usr/bin/env python3
"""Audit only the four recorded Apple-toolchain fixtures; not a Mach-O importer."""
import hashlib, html, json, pathlib, re

root=pathlib.Path(__file__).resolve().parent
evidence=root/'evidence'
def sha(b): return hashlib.sha256(b).hexdigest()
def read(name): return json.loads(name.read_text())
def field(text,key):
    value=re.search(r'^\s*'+re.escape(key)+r'\s+(\S+)',text,re.M)
    assert value, key
    return value.group(1)
def project(run):
    result=read(run/'result.json');rows=[]
    assert result['commands']==23 and all(c['exitCode']==0 for c in read(run/'commands.json'))
    for item in result['artifacts']:
        name=item['name'];assert not item['executed']
        assert sha((run/'inputs'/f'{name}.c').read_bytes())==item['sourceSha256']
        commands=(run/'streams'/f'{name}-load-commands.stdout').read_text()
        segments=[]
        for command in re.split(r'^Load command \d+\n',commands,flags=re.M)[1:]:
            if field(command,'cmd')!='LC_SEGMENT_64': continue
            header=command.split('\nSection\n')[0]
            segments.append({k:field(header,k) if k=='segname' else int(field(header,k),0) for k in ['segname','vmsize','filesize','maxprot','initprot']})
        assert [s['segname'] for s in segments]==['__PAGEZERO','__TEXT','__DATA','__LINKEDIT']
        pagezero,_,data,_=segments;assert pagezero=={'segname':'__PAGEZERO','vmsize':4294967296,'filesize':0,'maxprot':0,'initprot':0}
        assert sum(s['filesize'] for s in segments)==item['fileBytes']
        total=int(re.search(r'^total (\d+)$',(run/'streams'/f'{name}-size.stdout').read_text(),re.M).group(1))
        assert sum(s['vmsize'] for s in segments)==total
        payloadName='__common' if item['firstInitializer']==0 else '__data'
        section=next(s for s in commands.split('\nSection\n')[1:] if field(s,'sectname')==payloadName)
        sectionBytes=int(field(section,'size'),0);sectionType=int(field(section,'flags'),0)&0xff
        assert sectionBytes==item['declaredPayloadBytes']
        assert sectionType==(1 if item['firstInitializer']==0 else 0)
        assert data['filesize']==(0 if item['firstInitializer']==0 else data['vmsize'])
        permitted=sum(s['vmsize'] for s in segments if s['maxprot']!=0)
        assert total==pagezero['vmsize']+permitted
        rows.append({'name':name,'payloadBytes':sectionBytes,'firstInitializer':item['firstInitializer'],'logicalFileBytes':item['fileBytes'],'sizeMTotal':total,'permittedSegmentBytes':permitted,'payloadSection':payloadName,'sectionType':sectionType,'segments':segments,'residentMemoryBytes':None,'residentMemoryStatus':'not measured; executable was not run'})
    assert [r['name'] for r in rows]==['zero-4k','zero-1m','data-4k','data-1m']
    return rows
rows=project(evidence/'native-a');assert rows==project(evidence/'native-b')
a=read(evidence/'native-a/result.json');b=read(evidence/'native-b/result.json')
assert [(r['sha256'],r['sourceSha256']) for r in a['artifacts']]==[(r['sha256'],r['sourceSha256']) for r in b['artifacts']]
streams=list((evidence/'native-a/streams').iterdir())
assert all(p.read_bytes()==(evidence/'native-b/streams'/p.name).read_bytes() for p in streams)
sources=read(evidence/'sources.json');sourceChecks=[]
for f in sources['files']:
    data=(root/'upstream'/f['path']).read_bytes()
    blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    assert len(data)==f['bytes'] and blob==f['sha'],f['path']
    sourceChecks.append({'path':f['path'],'gitBlob':blob,'sha256':sha(data),'bytes':len(data)})
projection={'scope':'Only these four original fixtures; permitted segment bytes are static metadata, not RSS. Bloaty not executed.','cases':rows}
(evidence/'projection.json').write_text(json.dumps(projection,ensure_ascii=False,indent=2)+'\n')
artifactCheck='not run: authored artifact absent'
if (root/'candidate.explainer.json').exists():
    doc=read(root/'candidate.explainer.json');graph=read(root/'domains.architecture.json')
    assert next(b for b in doc['panels'][0]['blocks'] if b['type']=='diagram')['spec']==graph
    expected=[(x['name'],[f"{x['payloadBytes']:,}",str(x['firstInitializer']),f"{x['logicalFileBytes']:,}",f"{x['segments'][2]['vmsize']:,}",f"{x['segments'][2]['filesize']:,}"]) for x in rows]
    table=next(b for p in doc['panels'] for b in p['blocks'] if b['id']=='cases')
    assert [(x['label'],[c['text'] for c in x['cells']]) for x in table['rows']]==expected
    table=next(b for p in doc['panels'] for b in p['blocks'] if b['id']=='segments-table')
    assert [(x['label'],[c['text'] for c in x['cells']]) for x in table['rows']]==[(s['segname'],[f"{s['vmsize']:,}",f"{s['filesize']:,}",str(s['maxprot'])]) for s in rows[1]['segments']]
    labels={c['id']:c['label'] for c in graph['components']}
    assert labels['file']==f"{rows[1]['logicalFileBytes']:,} B" and labels['total']==f"{rows[1]['sizeMTotal']:,} B"
    assert labels['guard']=='4,294,967,296 B' and labels['permitted']==f"{rows[1]['permittedSegmentBytes']:,} B" and labels['resident']=='未测量'
    if (root/'explanation.html').exists():
        data=re.search(r'<script type="application/json" id="archify-explainer-prepared">(.*?)</script>',(root/'explanation.html').read_text(),re.S)
        assert json.loads(data.group(1))['document']==doc
    artifactCheck='pass: tables, graph numeric labels, unknown memory and embedded input match'
report={'pass':True,'nativeCommands':46,'pairedStreamsIdentical':len(streams),'pairedBinaryHashesIdentical':4,'sourceFilesVerified':sourceChecks,'fixtureComparisons':4,'artifactCheck':artifactCheck}
(evidence/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
esc=html.escape
sections=[]
for row in rows:
    name=row['name'];base=evidence/'native-a';size=(base/'streams'/f'{name}-size.stdout').read_text();loads=(base/'streams'/f'{name}-load-commands.stdout').read_text();code=(base/'inputs'/f'{name}.c').read_text()
    sections.append(f'<section id="{name}"><h2>{name}</h2><p>完整文件长度：{row["logicalFileBytes"]:,} B。未执行此文件。</p><pre>{esc(code)}</pre><h3>完整 size -m 输出</h3><pre>{esc(size)}</pre><details><summary>展开完整 otool -l 输出</summary><pre>{esc(loads)}</pre></details></section>')
summary='zero-1m 的文件长度是 16,888 B；size -m 的 total 为 4,296,048,640 B，其中 4 GiB 是不可访问的 PAGEZERO。剩余静态段尺寸也不等于实测驻留内存。'
raw=f'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>二进制大小 · 同源原文</title><style>body{{font:16px/1.6 system-ui;max-width:1100px;margin:32px auto;padding:0 20px;background:#f5f7fa;color:#142135}}section{{background:white;border:1px solid #d4deea;border-radius:12px;padding:20px;margin:24px 0}}pre{{white-space:pre;overflow:auto;padding:16px;background:#edf1f6;font:14px/1.5 ui-monospace,monospace}}nav{{display:flex;gap:20px;flex-wrap:wrap}}a{{color:#1466bb}}summary{{cursor:pointer}}</style><h1>文件只有 16,888 B，total 为何超过 4 GiB？</h1><p>{summary}</p><p>这是本实验的原文包装，不是 Bloaty UI。四个 C 输入为原创；实际执行 Apple clang、size、otool 和 nm，未运行 Bloaty 或生成的可执行文件。</p><nav>'+''.join(f'<a href="#{r["name"]}">{r["name"]}</a>' for r in rows)+'<a href="explanation.html">解释页</a></nav>'+''.join(sections)+'<section><h2>完整证据</h2><p><a href="evidence/native-a/commands.json">首次命令</a> · <a href="evidence/native-b/commands.json">独立重放</a> · <a href="evidence/projection.json">受限投影</a> · <a href="upstream/LICENSE">Bloaty Apache 2.0 许可</a></p><p>Bloaty 作者；源码 Copyright 2016 Google Inc. All Rights Reserved. 固定来源 f1a83e63f36beb628dcf022e1201a2eb391a22a6。仅源码研究，没有复制实现到产品。</p></section></html>'
(root/'raw-records.html').write_text(raw)
print(json.dumps(report))
