// 从一份 HTML 设计里读出它对内容的要求。
//
// 两步，可信度不同：
//   结构   标签、嵌套、属性、占位内容 —— 读得出来就是读得出来
//   语义   那个位置到底要什么 —— 只能给候选，可能不止一个
//
// 所以输出是三样：确定的约束、有依据的候选接受关系、读不出来的残差。
// 不猜。猜错的表现是把来源说明填进增长率的位置 —— 那不会报错，只会静默读错。

// 解释协议。命名有约束力这件事不是 HTML 给的 —— class 本来是样式标识，没有语义权威。
// 是我们在这里声明：凡命中下表的名字，按这个角色看待，并且只按这个角色看待。
// 换个协议（比如忽略类名，只看 data-role）只换这张表，其余不动。
export const PROTOCOL = {
  name: 'class-and-data-role',
  description: '命名优先于形状：命中的位置只接那一个角色，未命中的按占位形状给候选',
  attribute: 'class,data-role',
};

const ROLE_BY_NAME = [
  ['label', /label|name|title|key|名称|标签/i],
  ['value', /value|number|metric|amount|score|数值|值/i],
  ['growth', /growth|delta|change|trend|同比|环比|增长|变化/i],
  ['unit', /unit|suffix|单位/i],
  ['source', /source|ref|cite|来源|出处/i],
  ['note', /note|hint|caption|desc|说明|备注|注释/i],
];

// 一个位置能显示什么形状，决定了它能接哪些角色。
// 反过来不成立：能显示文本不等于可以当增长率 —— 类名说它是增长率时，它就是增长率。
const SHAPE_BY_PLACEHOLDER = [
  ['signed-number', (t) => /^[+\-\u2212]\s*[\d.]/.test(t)],
  ['number', (t) => /^[\d.,]+\s*[%\u4e07\u4ebf]?$/.test(t)],
  ['word', (t) => t.length > 0 && !/\d/.test(t)],
  ['text', () => true],
];

const ROLES_BY_SHAPE = {
  'signed-number': ['growth', 'value', 'unit'],
  number: ['value', 'unit'],
  word: ['label', 'source', 'note'],
  text: ['label', 'value', 'growth', 'unit', 'source', 'note'],
};

const shapeOf = (text) => SHAPE_BY_PLACEHOLDER.find(([, test]) => test(text))[0];

// 极小的标签扫描器。读到结构就够了，不追求成为 HTML 解析器。
function scan(html) {
  const root = { tag: '#root', attrs: {}, children: [], text: '' };
  const stack = [root];
  // 收尾标签必须有自己的分支。少了它，</span> 匹配不上任何一条，
  // 正则引擎会逐字符后退，最后把 "/span>" 当成文字读进去。
  const re = /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>|<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*?)?)\/?>|<!--[\s\S]*?-->|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] !== undefined) { if (stack.length > 1) stack.pop(); continue; }
    if (m[4] !== undefined) {
      const text = m[4].trim();
      if (text) stack[stack.length - 1].text += (stack[stack.length - 1].text ? ' ' : '') + text;
      continue;
    }
    if (m[2] === undefined) continue; // 注释
    const node = { tag: m[2].toLowerCase(), attrs: {}, children: [], text: '' };
    for (const a of (m[3] || '').matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g)) node.attrs[a[1].toLowerCase()] = a[2] ?? '';
    const selfClosing = m[0].endsWith('/>') || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(node.tag);
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return root;
}

const classesOf = (node) => (node.attrs.class || '').split(/\s+/).filter(Boolean);
const walk = (node, path, out) => {
  node.children.forEach((child, i) => {
    const at = path + '/' + child.tag + '[' + i + ']';
    out.push({ node: child, path: at, parent: node });
    walk(child, at, out);
  });
  return out;
};

export function readDesign(html) {
  const root = scan(html);
  const all = walk(root, '', []);
  // 位置 = 直接承载文字的叶子元素
  const positions = all
    .filter(({ node }) => node.text && !node.children.some((c) => c.text))
    .map(({ node, path }) => {
      const classes = classesOf(node);
      const placeholder = node.text;
      const shape = shapeOf(placeholder);
      const named = ROLE_BY_NAME.find(([, re]) => re.test(classes.join(' ') + ' ' + (node.attrs['data-role'] || '')));
      return {
        path, tag: node.tag, classes, placeholder, shape,
        // 命中命名就是钉住了角色；没命中才轮到形状收窄。这个先后是协议的声明，不是从 HTML 读出来的。
        requires: named ? named[0] : null,
        admits: named ? [named[0]] : ROLES_BY_SHAPE[shape],
      };
    });

  // 容器 = 含两个以上位置的最近公共父元素；同形兄弟算可重复
  const containers = [];
  for (const { node, path } of all) {
    const inside = positions.filter((p) => p.path.startsWith(path + '/'));
    if (inside.length < 2) continue;
    if (inside.some((p) => positions.some((q) => q !== p && q.path.startsWith(p.path + '/')))) continue;
    const classes = classesOf(node);
    const siblings = (node.parent?.children || []).filter((c) => c.tag === node.tag && classesOf(c).join(' ') === classes.join(' '));
    containers.push({ path, classes, positions: inside.map((p) => p.path), repeats: siblings.length > 1 });
  }

  // 候选接受关系：被命名的位置是硬要求；没命名的位置按形状给出可接的角色。
  const pinned = positions.filter((p) => p.requires).map((p) => p.requires);
  const open = positions.filter((p) => !p.requires);
  // 不铺开候选。
  //
  // 候选是一个关系，不是一张表：未命名位置各有自己能接的角色，接法就是给每个位置挑一个。
  // 铺开是叉积，k 个位置就是 (admits+1) 的 k 次方 —— 十二个未命名位置是 138 亿。
  // 而铺开出来的东西本来也没人要：调用方问的是"这个接法合不合法""给我一个不用补数据的接法"，
  // 这两问一次查找、一次搜索就能答，不需要把答案全列出来。
  const capacity = open.reduce((n, p) => n * (p.admits.length + 1), 1);

  // 解释残差 = 名字没钉住角色的位置。形状只收窄候选，钉不住角色：
  // 一个只能显示数字的位置仍可能是数值、单位或增长率。
  const undetermined = open.map((p) => ({
    path: p.path,
    admits: p.admits,
    why: '没有名字提示，占位内容是「' + p.placeholder + '」（' + p.shape + '），' + p.admits.join('、') + ' 都说得通',
  }));

  return {
    protocol: PROTOCOL,
    positions, containers,
    requires: [...new Set(pinned)].sort(),
    open,
    // 关系的大小。报数，不铺。
    capacity,
    undetermined,
  };
}

// 一个接法合不合法：命名的位置必须拿到它那一个角色，未命名的位置只能拿它能接的。
export function isLegal(design, assign) {
  for (const [path, chosen] of Object.entries(assign || {})) {
    const position = design.positions.find((p) => p.path === path);
    if (!position) return { ok: false, reason: '没有这个位置: ' + path };
    if (!chosen) continue;
    // 名字钉住角色时，给别的角色要**拒绝**，不能静默忽略 —— 忽略了就等于放行。
    if (position.requires && position.requires !== chosen) {
      return { ok: false, reason: position.path + ' 的角色由名字钉住（' + position.requires + '），接不了 ' + chosen };
    }
    if (!position.admits.includes(chosen)) return { ok: false, reason: position.path + ' 接不了 ' + chosen };
  }
  return { ok: true };
}

// 按要填的字段找一个合法接法。找到就停，不列全部。
// fields 里没有的角色一律留空 —— 宁可不填，也不拿别的角色顶上去。
export function bindingFor(design, fields) {
  const assign = {};
  for (const position of design.positions) {
    if (position.requires) {
      if (!fields.includes(position.requires)) return null;
      continue;
    }
    const role = position.admits.find((r) => fields.includes(r) && !Object.values(assign).includes(r));
    assign[position.path] = role || null;
  }
  return { assign, fields: [...new Set([...design.requires, ...Object.values(assign).filter(Boolean)])].sort() };
}

// 一个接法用到了设计的哪些位置、又空下了哪些。
// 「空下」和「缺字段」是两回事：前者是设计给了没用（代价在表达上），后者是设计要求而内容没有（代价在数据上）。
export function usage(design, candidate) {
  const used = [];
  const declined = [];
  for (const position of design.positions) {
    const role = position.requires || candidate.assign?.[position.path] || null;
    if (role) used.push({ path: position.path, role, pinned: Boolean(position.requires) });
    else declined.push({ path: position.path, admits: position.admits, placeholder: position.placeholder });
  }
  return { used, declined, offered: design.positions.length, taken: used.length };
}
