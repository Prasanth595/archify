// 内容到设计的接合。
//
// 一个设计声明四样：
//   slots    它有哪些容器
//   roles    它把哪个槽当作默认的块级、行内、不产出用（不写就是同名的那三个）
//   mapping  只写与默认不同的地方（可以按块决定，比如标题按级别分流）
//   accepts  每个槽要求哪些字段
//   binds    某个构造填进某个槽时，怎么把内容拆成那些字段（不写就是整块搬过去）
//
// 同一构造可以使用多个槽；缺失字段会报告给调用方。

import { TABLE } from "../compile.mjs";

// 默认落点从构造表推：块级的落块级，行内的落行内，不产出的不落。
// 不必另写一份 —— 那份迟早和表漂开，而且没有东西会提醒。
export function roleOf(construct) {
  const row = TABLE[construct];
  if (!row) return null;
  if (row.anchor === 'none') return 'drop';
  return row.block ? 'block' : 'inline';
}

// 设计只声明偏离。没声明的一律走默认 —— 于是"这个设计做了什么决定"读起来就是它写下的那几行。
export function slotFor(design, block) {
  const entry = design.mapping?.[block.construct];
  if (entry !== undefined) return typeof entry === 'function' ? entry(block) : entry;
  const role = roleOf(block.construct);
  if (role === null) return null;
  if (role === 'drop') return 'drop';
  return design.roles?.[role] ?? role;
}

// 一个字段算不算填上了：空串和 null 都不算，因为它们和"没有"读起来一样。
const present = (v) => v !== undefined && v !== null && String(v).trim() !== '';

export function connect(design, blocks) {
  const filled = [];
  const unmet = [];
  for (const block of blocks) {
    const slot = slotFor(design, block);
    if (!slot || slot === 'drop') continue;
    const bind = (design.binds || []).find((b) => b.slot === slot && b.construct === block.construct);
    if (!bind) {
      filled.push({ slot, construct: block.construct, html: block.html, at: block.id });
      continue;
    }
    const needs = design.accepts?.[slot] || [];
    const parts = bind.fill(block) || [];
    if (!parts.length) {
      unmet.push({ slot, construct: block.construct, missing: needs, at: block.id });
      continue;
    }
    for (const part of parts) {
      const missing = needs.filter((name) => !present(part[name]));
      // 缺字段的连同已经拿到的内容一起报，调用方才有得选：隐藏这个组件、换一种变体，
      // 还是要求补数据。只报"缺什么"是不够的。
      if (missing.length) unmet.push({ slot, construct: block.construct, missing, got: part, at: block.id });
      else filled.push({ slot, construct: block.construct, part, at: block.id });
    }
  }
  return { filled, unmet };
}

// 「接上了」的可检验定义：表盖住全部构造，且每个落点都是这个设计真有的槽。
export function checkMapping(design, table) {
  const problems = [];
  if (!design.slots) problems.push('设计没有声明它有哪些槽');
  if (problems.length) return problems;
  for (const construct of Object.keys(table)) {
    const slot = slotFor(design, { construct, html: '<h2 data-src="x">t</h2>' });
    if (!slot) { problems.push('构造没有落点: ' + construct); continue; };
    if (!design.slots.includes(slot)) problems.push('设计 ' + design.name + ' 没有槽 "' + slot + '"（构造 ' + construct + '）');
  }
  return problems;
}
