// 标注 → 源字节范围。
//
// 这是整条链的收口：读者在产物上点/选 → 拿到 (身份, 渲染偏移, 长度) →
// 在这里查源映射 → 得到源稿里的一段 → 只改那一段。
//
// 分两种粒度：
//   块级：位置直接就是块的范围。
//   行内：块的 textBase 是正文起点，锚表给出"哪里渲染长度和源长度不一样"，
//         锚之间的纯文本 1:1，落在锚里就返回整个锚（因为 &amp; 五个字节出一个字，
//         字内偏移对不回字节偏移——返回整个构造才是精确答案）。

// 把块内的渲染偏移换算成源偏移。
export function locateAt(entry, at) {
  let src = entry.textBase === undefined ? entry.start : entry.textBase;
  let ren = 0;
  for (const a of entry.inline || []) {
    if (at < a.at) break;
    const gap = a.at - ren;
    src += gap; ren += gap;
    if (at < ren + a.len) return { src: a.start, end: a.end, inAnchor: a };
    src += a.end - a.start; ren += a.len;
  }
  return { src: src + (at - ren), end: src + (at - ren) + 1, inAnchor: null };
}

// note = { src: 身份, at: 渲染偏移或 null, len: 渲染长度 }
export function resolve(map, note) {
  const entry = map[note.src];
  if (!entry) return { ok: false, reason: '身份不在映射里: ' + note.src };
  // 单元格：视觉结构可能已经变过（表格排成了卡片），所以这里指的不是块内偏移，
  // 而是"第几行第几列"。位置换了形状，来源没换。
  if (note.cell) {
    const [row, col] = note.cell;
    const cell = entry.cells?.[row]?.[col];
    if (!cell) return { ok: false, reason: '这一块里没有第 ' + row + ' 行第 ' + col + ' 列' };
    return { ok: true, start: cell.start, end: cell.end, construct: 'tableCell', span: 'cell' };
  }
  if (note.at === null || note.at === undefined) {
    return { ok: true, start: entry.start, end: entry.end, construct: entry.construct, span: 'block' };
  }
  const a = locateAt(entry, note.at);
  if (a.inAnchor) {
    return { ok: true, start: a.end >= a.src ? a.src : a.src, end: a.end, construct: a.inAnchor.construct, span: 'inline' };
  }
  const len = Math.max(1, note.len || 1);
  const b = locateAt(entry, note.at + len - 1);
  return { ok: true, start: a.src, end: Math.max(a.src + 1, b.end), construct: entry.construct, span: 'text' };
}

// 最小改：把源稿里 [start, end) 换成 replacement，别处一个字节不动。
export function patch(source, range, replacement) {
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

// 读回产物里的源稿和映射（产物是自足的，不需要原始 md 文件）。
export function readArtifact(html) {
  const grab = (id) => {
    const m = html.match(new RegExp('<script id="' + id + '"[^>]*>([\\s\\S]*?)</script>'));
    return m ? m[1] : null;
  };
  const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return {
    source: unesc(grab('arc-source') || ''),
    map: JSON.parse(unesc(grab('arc-map') || '{}')),
    derived: JSON.parse(unesc(grab('arc-derived') || '[]')),
    untouchable: JSON.parse(unesc(grab('arc-untouchable') || '[]')),
  };
}
