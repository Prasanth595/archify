import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const SHA = "dbd0ed30aa888a30e21ba83b9831ac0e80d41022";
const upstream = `https://github.com/google/pprof/blob/${SHA}/`;
const definitions = [
  [
    "cppbench.contention",
    "internal/driver/testdata/cppbench.contention",
    1551,
    "e0f3035db93cd3bb384590b224ca2b26d79aca41e71042a32c351a6d3e34d2d4",
  ],
  [
    "cppbench.small.contention",
    "internal/driver/testdata/cppbench.small.contention",
    821,
    "0d1f47b05eb6664827672b360eb122f13daec15765eb76eed1d77ed9e788516f",
  ],
  [
    "cppbench.contention.string",
    "profile/testdata/cppbench.contention.string",
    2025,
    "a552baca08d20d75945171f9d1ff08f5f9df12a0d7099ce88c9b894358015552",
  ],
  [
    "LICENSE-pprof",
    "LICENSE",
    11358,
    "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30",
  ],
];
export function inputs() {
  return definitions.map(([file, source, bytes, sha256]) => {
    const raw = fs.readFileSync(path.join(ROOT, "fixtures", file));
    if (
      raw.length !== bytes ||
      createHash("sha256").update(raw).digest("hex") !== sha256
    )
      throw Error(`Fixture mismatch: ${file}`);
    return {
      file,
      source,
      url: upstream + source,
      bytes,
      sha256,
      text: raw.toString("utf8"),
    };
  });
}
// Bounded legacy fixture reader, not a protobuf or general pprof importer.
export function parse(text, role) {
  const lines = text.trimEnd().split("\n"),
    hz = Number(/^cycles\/second = (\d+)$/m.exec(text)?.[1]),
    period = Number(/^sampling period = (\d+)$/m.exec(text)?.[1]);
  if (
    hz !== 3201000000 ||
    period !== 100 ||
    lines[0] !== "--- contentionz 1 ---"
  )
    throw Error("Only the pinned contention fixture contract is supported");
  const maps = lines.flatMap((literal, i) => {
    const m = /^\s+([0-9a-f]+)-([0-9a-f]+): (.+)$/.exec(literal);
    return m
      ? [
          {
            id: `M${i - lines.indexOf("--- Memory map: ---")}`,
            line: i + 1,
            start: `0x${m[1]}`,
            limit: `0x${m[2]}`,
            file: m[3],
            literal,
          },
        ]
      : [];
  });
  const rows = lines.flatMap((literal, i) => {
    const m = /^\s*(\d+)\s+(\d+) @ (.+)$/.exec(literal);
    if (!m) return [];
    const stack = m[3].split(" "),
      cycles = Number(m[1]),
      observedCount = Number(m[2]);
    return [
      {
        id: `${role === "source" ? "S" : "B"}${i - 4}`,
        role,
        line: i + 1,
        literal,
        raw: { cycles, observedCount, stack },
        locations: stack.map((address) => {
          const corrected = `0x${(BigInt(address) - 1n).toString(16)}`,
            mapping = maps.find(
              (v) =>
                BigInt(corrected) >= BigInt(v.start) &&
                BigInt(corrected) < BigInt(v.limit),
            );
          return { raw: address, corrected, mapping: mapping?.id ?? null };
        }),
        values: [
          observedCount * period,
          Math.trunc((cycles * period) / (hz / 1e9)),
        ],
        labels: {},
      },
    ];
  });
  return { role, hz, period, rows, maps, lines: lines.length };
}
export const goRound = (value) =>
  Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
const stackKey = (r) =>
  JSON.stringify(r.locations.map((l) => [l.corrected, l.mapping]));
const sum = (rows) =>
  [0, 1].map((i) => rows.reduce((n, r) => n + r.values[i], 0));
export function arithmetic(source, base) {
  const sourceTotal = sum(source.rows),
    baseTotal = sum(base.rows),
    factors = sourceTotal.map((v, i) => baseTotal[i] / v),
    baseByStack = new Map(base.rows.map((r) => [stackKey(r), r]));
  const comparisonRows = source.rows.map((r) => {
    const match = baseByStack.get(stackKey(r));
    const baseValues = match?.values ?? [0, 0],
      normalized = r.values.map((v, i) => goRound(v * factors[i]));
    return {
      id: r.id,
      sourceLine: r.line,
      baseId: match?.id ?? null,
      baseLine: match?.line ?? null,
      stackKey: stackKey(r),
      source: [...r.values],
      base: [...baseValues],
      normalized,
      absoluteDiff: r.values.map((v, i) => v - baseValues[i]),
      normalizedDiff: normalized.map((v, i) => v - baseValues[i]),
    };
  });
  const merge = (normalize, tagged) => {
    const records = [
      ...source.rows.map((r, i) => ({
        id: r.id,
        contributors: [r.id],
        stackKey: stackKey(r),
        labels: {},
        values: normalize ? comparisonRows[i].normalized : [...r.values],
      })),
      ...base.rows.map((r) => ({
        id: r.id,
        contributors: [r.id],
        stackKey: stackKey(r),
        labels: tagged ? { "pprof::base": ["true"] } : {},
        values: r.values.map((v) => -v),
      })),
    ];
    const merged = new Map();
    for (const r of records) {
      const key = JSON.stringify([r.stackKey, r.labels]);
      if (!merged.has(key)) merged.set(key, structuredClone(r));
      else {
        const old = merged.get(key);
        old.values = old.values.map((v, i) => v + r.values[i]);
        old.contributors.push(...r.contributors);
      }
    }
    return [...merged.values()];
  };
  const modes = {};
  for (const normalized of [false, true])
    for (const tagged of [false, true]) {
      const id = `${normalized ? "normalized" : "absolute"}-${tagged ? "diff-base" : "base"}`,
        samples = merge(normalized, tagged),
        denominatorSamples = tagged
          ? samples.filter((r) => r.labels["pprof::base"])
          : samples;
      modes[id] = {
        samples,
        denominatorSamples: denominatorSamples.map((r) => r.contributors),
        denominators: [0, 1].map((i) =>
          denominatorSamples.reduce((n, r) => n + Math.abs(r.values[i]), 0),
        ),
      };
    }
  return {
    sourceTotal,
    baseTotal,
    factors,
    comparisonRows,
    modes,
    normalizedSourceTotal: [0, 1].map((i) =>
      comparisonRows.reduce((n, r) => n + r.normalized[i], 0),
    ),
    netDiff: [0, 1].map((i) =>
      comparisonRows.reduce((n, r) => n + r.normalizedDiff[i], 0),
    ),
    scope:
      "non-mean; no focus/ignore; no extra divide_by; report.New computes totals before address aggregation",
  };
}
const prose = (id, text) => ({ id, type: "prose", text });
const link = (label, id) => `[${label}](block:${id})`;
const table = (id, labelColumn, columns, rows) => ({
  id,
  type: "comparison",
  labelColumn,
  columns,
  rows: rows.map(([id, label, ...cells]) => ({
    id,
    label,
    cells: cells.map((text) => ({ text: String(text) })),
  })),
});
const panel = (id, title, blocks) => ({ id, title, span: 12, blocks });
function witness(model, metric) {
  const unit = metric === 0 ? "count" : "ns";
  const prefix = metric === 0 ? "count" : "delay";
  const node = (id, label, pos) => ({ id, type: "backend", label, pos, size: [120, 50] });
  const flow = (from, to, label) => ({ id: `${prefix}-${from}-${to}`, from, to, label });
  const r = model.comparisonRows[0];
  return {
    schema_version: 1,
    diagram_type: "architecture",
    meta: { title: `${unit} · 六条 source 如何改变 S1`, locale: "zh-CN", output: `${prefix}.html`, quality_profile: "showcase", legend: { entries: { backend: { label: "算术输入与运算" } } } },
    components: [
      ...model.comparisonRows.map((r, i) => node(r.id, `${r.id}: ${r.source[metric]}`, [20, 60 + i * 70])),
      node("B1", `B1: ${model.baseTotal[metric]}`, [20, 500]),
      node("source-total", `Σs ${model.sourceTotal[metric]}`, [205, 235]),
      node("base-total", `Σb ${model.baseTotal[metric]}`, [205, 500]),
      node("factor", `${model.baseTotal[metric]}/${model.sourceTotal[metric]}`, [390, 320]),
      node("round", `round ${r.normalized[metric]}`, [575, 235]),
      node("absolute", `绝对差 ${r.absoluteDiff[metric]}`, [760, 60]),
      node("normalized", `归一化差 ${r.normalizedDiff[metric]}`, [760, 500]),
    ],
    connections: [
      ...model.comparisonRows.map((r) => flow(r.id, "source-total", "贡献")),
      flow("B1", "base-total", "贡献"),
      flow("source-total", "factor", "分母"),
      flow("base-total", "factor", "分子"),
      flow("factor", "round", "乘数"),
      flow("S1", "round", "被乘数"),
      flow("S1", "absolute", "被减数"),
      flow("B1", "absolute", "减数"),
      flow("round", "normalized", "被减数"),
      flow("B1", "normalized", "减数"),
    ],
  };
}
function denominatorGraph(model) {
  const baseDenom = model.modes["normalized-base"].denominators;
  const taggedDenom = model.modes["normalized-diff-base"].denominators;
  const numerator = model.comparisonRows[0].normalizedDiff;
  const node = (id, label, column, y) => ({ id, type: "backend", label, pos: [20 + column * 185, y], size: [120, 50] });
  return {
    schema_version: 1,
    diagram_type: "architecture",
    meta: { title: "相同差值，报告分母来自不同样本集合", locale: "zh-CN", output: "denominators.html", quality_profile: "showcase", legend: { entries: { backend: { label: "算术输入与运算" } } } },
    components: [
      node("base-records", "-base · 6条", 0, 60),
      node("tagged-records", "-diff_base · 7条", 0, 360),
      node("numerator", `S1 ${numerator.join(" / ")}`, 1, 210),
      node("all-abs", "全部 signed abs", 1, 60),
      node("tagged-abs", "仅 base 标签 abs", 1, 360),
      node("base-denom", baseDenom.join(" / "), 2, 60),
      node("tagged-denom", taggedDenom.join(" / "), 2, 360),
      node("base-ratio", "S1 ÷ -base 分母", 3, 60),
      node("tagged-ratio", "S1 ÷ 标签分母", 3, 360),
    ],
    connections: [
      ["base-records", "all-abs", "无标签"],
      ["tagged-records", "tagged-abs", "取 base"],
      ["all-abs", "base-denom", "sum abs"],
      ["tagged-abs", "tagged-denom", "sum abs"],
      ["base-denom", "base-ratio", "分母"],
      ["tagged-denom", "tagged-ratio", "分母"],
      ["numerator", "base-ratio", "分子"],
      ["numerator", "tagged-ratio", "分子"],
    ].map(([from, to, label], i) => ({ id: `denom-edge-${i}`, from, to, label })),
  };
}
export function build() {
  const sourceFiles = inputs(),
    source = parse(sourceFiles[0].text, "source"),
    base = parse(sourceFiles[1].text, "base"),
    model = arithmetic(source, base),
    graphs = {
      count: witness(model, 0),
      delay: witness(model, 1),
      denominators: denominatorGraph(model),
    };
  const ledger = {
    provenance: {
      upstreamSHA: SHA,
      method:
        "Independent offline arithmetic from complete fixed fixtures; upstream not executed",
      sources: sourceFiles.map(({ text, ...s }) => s),
    },
    source,
    base,
    ...model,
  };
  const sources = sourceFiles.map((s, i) => ({
    id: `source-${i}`,
    title: `完整 ${s.source} · 固定 SHA（URL-only）`,
    url: s.url,
  }));
  for (const [id, title, file, lines] of [
    ["parse-rule", "raw → unsampled", "profile/legacy_profile.go", "L680-L838"],
    [
      "scale-rule",
      "每类型 Normalize 与完整 stack 合并",
      "profile/merge.go",
      "L91-L123",
    ],
    ["round-rule", "ScaleN 的 math.Round", "profile/profile.go", "L780-L825"],
    [
      "fetch-rule",
      "先 Normalize，再负 base 合并",
      "internal/driver/fetch.go",
      "L60-L105",
    ],
    [
      "report-rule",
      "computeTotal 的 abs 样本集合",
      "internal/report/report.go",
      "L1319-L1352",
    ],
    [
      "order-rule",
      "report.New 在 aggregate 前",
      "internal/driver/driver.go",
      "L79-L109",
    ],
    [
      "oracle-rule",
      "上游完整双 expected",
      "internal/driver/fetch_test.go",
      "L327-L416",
    ],
  ])
    sources.push({ id, title, url: upstream + file + "#" + lines });
  const document = {
    schema_version: 1,
    diagram_type: "explainer",
    meta: {
      id: "profile-normalization",
      title: "S1 绝对量增加，归一化后为什么是负数？",
      locale: "zh-CN",
      style: "clean",
    },
    answer: {
      summary:
        "先把整个 source 缩到 base 总量，再减同栈 B1：S1 从 +1700 count / +608878600 ns，变成 −229 count / −369 ns。六条 source 都进入缩放分母。",
      reasons: [
        "归一化先逐类型求比例，再逐样本 round；最后才相减。",
        "count 用 1000/3500；delay 用 3124/690508213，单位不能混用。",
        "缩放分母、净差、报告百分比分母是三件不同的事。",
      ],
      scope:
        "固定 legacy contention fixture；非性能结论；无 focus/mean/divide_by",
    },
    sources,
    panels: [],
  };
  const p = document.panels;
  p.push(
    panel("reading", "读图任务：从负数追回全局分母", [
      prose(
        "legend",
        "箭头只表示算术值依赖，不是程序调用、执行顺序或测得 trace。两张图分别固定 count 和 ns；图内解释 S1，一旁六行账目保留全部结果。",
      ),
      prose(
        "navigation",
        `${link("count 依赖", "count-view")} · ${link("delay 依赖", "delay-view")} · ${link("六行结果", "results")} · ${link("报告分母", "denominators-view")} · ${link("完整原件", "originals")}。focus / hover 图节点后，“阅读这段”进入其真实详情；每段有固定 native 入口。`,
      ),
    ]),
  );
  for (const [name, metric] of [
    ["count", 0],
    ["delay", 1],
  ]) {
    const g = graphs[name],
      unit = metric === 0 ? "count" : "ns",
      r = model.comparisonRows[0];
    const details = {
      "source-total": `全部 source 贡献：${model.comparisonRows.map((r) => `${link(r.id, `raw-${r.id.toLowerCase()}`)} ${r.source[metric]}`).join(" + ")} = ${model.sourceTotal[metric]} ${unit}。即使 S2 与 S1 不同完整栈，S2 仍改变 S1 的缩放分母。`,
      "base-total": `base 只有 ${link("B1", "raw-b1")}：${model.baseTotal[metric]} ${unit}。base 不被 Normalize；合并前才乘 −1。`,
      factor: `比例 = baseTotal/sourceTotal = ${model.baseTotal[metric]}/${model.sourceTotal[metric]}。分子来自 B1，分母来自完整六条 source；不是从 S1 单独求比例。${link("全部六项与求和", `${name}-detail-source-total`)}。`,
      round: `S1 ${r.source[metric]} × (${model.baseTotal[metric]}/${model.sourceTotal[metric]}) → round = ${r.normalized[metric]} ${unit}。[每类型独立 scale](source:scale-rule) 与 [math.Round](source:round-rule)。${link("比例依据", `${name}-detail-factor`)}。`,
      absolute: `S1 ${r.source[metric]} − B1 ${r.base[metric]} = ${r.absoluteDiff[metric]} ${unit}。完整 location 序列和 labels 匹配，不是按公共叶地址匹配。${link("S1/B1 原始身份", "raw-s1")}。`,
      normalized: `round(S1 × factor) ${r.normalized[metric]} − 同完整栈 B1 ${r.base[metric]} = ${r.normalizedDiff[metric]} ${unit}。符号变了，因为比较问题变了；不能据此说绝对量下降。${link("舍入依据", `${name}-detail-round`)} · ${link("比例依据", `${name}-detail-factor`)} · ${link("同栈 B1", "raw-b1")}。`,
    };
    for (const row of [...source.rows, ...base.rows])
      details[row.id] =
        `${row.id} 是 ${row.role} 原件第 ${row.line} 行，unsampled ${row.values[metric]} ${unit}。${link("完整原行、全部地址与 map", `raw-${row.id.toLowerCase()}`)}。`;
    p.push(
      panel(
        `${name}-view`,
        `${metric === 0 ? "01" : "02"} · ${unit}：六条输入决定 S1 的符号`,
        [
          prose(
            `${name}-factor-entry`,
            `固定比例入口：[打开此精确 factor 节点](node:${name}-flow.factor)。${link("比例算式", `${name}-detail-factor`)}。`,
          ),
          {
            id: `${name}-flow`,
            type: "diagram",
            diagramType: "architecture",
            spec: g,
            nodeBlocks: Object.fromEntries(
              g.components.map((n) => [n.id, `${name}-detail-${n.id}`]),
            ),
          },
          prose(
            `${name}-coverage`,
            "Σs 是全部 source 总量，Σb 是全部 base 总量；所有节点数值单位见图标题。图保留 S1…S6 与 B1 共7个完整输入身份；15条依赖只见证 S1 两种差值。其余5条输出在完整六行表中；图没有声称求值全部输出。",
          ),
          {
            id: `${name}-entries`,
            type: "steps",
            items: [
              ["normalized", "归一化差"],
              ["factor", "归一化比例"],
              ["source-total", "source 总量"],
              ["S2", "S2"],
              ["round", "S1 舍入"],
            ].map(([node, text]) => ({
              id: `${name}-entry-${node}`,
              text,
              target: { diagram: `${name}-flow`, node },
              detail: link("核对依据", `${name}-detail-${node}`),
            })),
          },
        ],
      ),
    );
    p.push(
      panel(
        `${name}-arithmetic`,
        `${unit} · 每个节点的算术与固定返回`,
        g.components.map((n) =>
          prose(
            `${name}-detail-${n.id}`,
            `${details[n.id]} [打开此精确节点](node:${name}-flow.${n.id})。${link("回到本图入口", `${name}-view`)}。`,
          ),
        ),
      ),
    );
  }
  p.push(
    panel("results", "03 · 完整六行：按完整栈对齐的算术投影", [
      prose(
        "projection",
        "下表是忽略 base 角色标签后的完整 stack 对齐投影；不是 -diff_base 的7条内部记录。S2…S6 在这个 base 输入里缺失，贡献补0，不表示现实中从未执行。所有值单位按列分开。",
      ),
      table(
        "result-table",
        "输入 / source原行",
        [
          "source count / ns",
          "base count / ns",
          "scaled+round count / ns",
          "绝对差 count / ns",
          "归一化差 count / ns",
        ],
        model.comparisonRows.map((r) => [
          `result-${r.id.toLowerCase()}`,
          `${r.id} / L${r.sourceLine}`,
          r.source.join(" / "),
          r.base.join(" / "),
          r.normalized.join(" / "),
          r.absoluteDiff.join(" / "),
          r.normalizedDiff.join(" / "),
        ]),
      ),
      prose(
        "zero-records",
        `S2、S5 的归一化 delay=0 ns，但 count=29，两条身份都保留。${link("S2 原件", "raw-s2")} · ${link("S5 原件", "raw-s5")}。scaled source 总计 ${model.normalizedSourceTotal.join(" count / ")} ns；净差 ${model.netDiff[0]} count / ${model.netDiff[1]} ns，是逐样本 round 的结果，不是报告百分比分母。`,
      ),
      prose(
        "rounding",
        "raw → unsampled 用截断：count=observedCount×100，delay=int(cycles×100/(3201000000/1e9)) ns。Normalize 用逐值 math.Round；这两道舍入不可混成一步。[producer](source:parse-rule) · [上游双 expected](source:oracle-rule)。",
      ),
    ]),
  );
  const dg = graphs.denominators;
  const denomDetails = {
    numerator: `S1 完整栈投影分子为 ${model.comparisonRows[0].normalizedDiff[0]} count / ${model.comparisonRows[0].normalizedDiff[1]} ns。${link("count 差值算式", "count-detail-normalized")} · ${link("delay 差值算式", "delay-detail-normalized")}；除法的另一输入是各自报告分母。`,
    "base-records":
      "-base：S1 与负 B1 的完整 location 序列、labels 均匹配，先合并为一个 signed 样本；其余5条不同栈，所以一共6条。",
    "tagged-records":
      "-diff_base：负 B1 保留 pprof::base=true。S1 无该标签，不能先合并；内部保留6 source + 1负base，共7条。",
    "all-abs": `normalized -base 的集合：count abs(${model.comparisonRows.map((r) => r.normalizedDiff[0]).join(", ")})；ns abs(${model.comparisonRows.map((r) => r.normalizedDiff[1]).join(", ")})。逐样本取绝对值后求和。`,
    "tagged-abs":
      "normalized -diff_base：只选带 pprof::base=true 的负 B1。count abs(−1000)，ns abs(−3124)。不能对6行差值表重新标一个base标签冒充此集合。",
    "base-denom":
      "normalized -base：229+29+57+29+29+86=459 count；369+0+1+80+0+288=738 ns。",
    "tagged-denom":
      "normalized -diff_base：负 B1 的绝对值总量=1000 count / 3124 ns。",
    "base-ratio":
      "S1 投影行相同分子 −229 count / −369 ns；normalized -base 比率为 −229/459 与 −369/738。这里展示算式，不冒充 pprof 格式化 UI。",
    "tagged-ratio":
      "同一 S1 投影分子，normalized -diff_base 比率为 −229/1000 与 −369/3124。图中分母输入不改变分子；标签/合并身份变化见左侧分支。",
  };
  p.push(
    panel("denominators-view", "04 · 同样的负差，百分比为什么不同？", [
      {
        id: "denominator-flow",
        type: "diagram",
        diagramType: "architecture",
        spec: dg,
        nodeBlocks: Object.fromEntries(
          dg.components.map((n) => [n.id, `denom-detail-${n.id}`]),
        ),
      },
      prose(
        "denom-order",
        "图内成对数字顺序均为 count / ns，除法完整算式见节点详情。report.New 在 aggregate 前 computeTotal；-base 取 merged signed 样本的 abs 总和，-diff_base 取 base 标签子集。无 focus/ignore/mean/额外 divide_by。[computeTotal](source:report-rule) · [调用顺序](source:order-rule)。",
      ),
      {
        id: "denominator-entries",
        type: "steps",
        items: [
          ["all-abs", "全部 signed 样本"],
          ["tagged-abs", "仅 base 标签"],
        ].map(([node, text]) => ({
          id: `denom-entry-${node}`,
          text,
          target: { diagram: "denominator-flow", node },
          detail: link("完整集合", `denom-detail-${node}`),
        })),
      },
      table(
        "all-denominators",
        "模式",
        ["count denominator", "ns denominator"],
        Object.entries(model.modes).map(([id, m]) => [
          `mode-${id}`,
          id,
          ...m.denominators,
        ]),
      ),
    ]),
  );
  p.push(
    panel(
      "denominator-details",
      "报告分母：身份、集合、算式",
      dg.components.map((n) =>
        prose(
          `denom-detail-${n.id}`,
          `${denomDetails[n.id]} [打开精确节点](node:denominator-flow.${n.id})。${link("返回分母图", "denominators-view")}。`,
        ),
      ),
    ),
  );
  p.push(
    panel("aggregation-limit", "公共地址不能代替完整栈", [
      prose(
        "leaf-cancellation",
        "全部6条 source 与 B1 都有同一个 raw leaf 0xbccc97，pprof 修正地址为 0xbccc96。若再按 leaf 地址 flat 聚合，signed count 相消为1、ns相消为0；S1 的负值被其他栈正值抵消。那不是六条完整 stack 的差分图，不能据此造函数热点。",
      ),
      prose(
        "identity",
        "这里原始顺序是 leaf→caller；没有函数符号。地址减1保存为独立 corrected 列，完整12条 map 随两份原件保留。匹配只在这一对相同映射的固定输入内成立，不把地址当跨版本函数身份。",
      ),
    ]),
  );
  p.push(
    panel(
      "raw-details",
      "05 · 七条原始记录：完整栈、位置与固定入口",
      [...source.rows, ...base.rows].flatMap((r) => [
        prose(
          `raw-${r.id.toLowerCase()}`,
          `${r.id} · ${r.role} 原件第${r.line}行。raw cycles=${r.raw.cycles}，observed count=${r.raw.observedCount}；unsampled=${r.values[0]} count / ${r.values[1]} ns。${r.id === "S1" || r.id === "B1" ? "S1/B1 全栈和 map 匹配，只有此对相减。" : "base 没有该完整栈，算术贡献补0。"} ${link("完整含 maps 原件", r.role === "source" ? "original-source" : "original-base")} · ${link("返回 count 比例入口", "count-factor-entry")} · ${link("返回 delay 比例入口", "delay-factor-entry")}。`,
        ),
        {
          id: `literal-${r.id.toLowerCase()}`,
          type: "snippet",
          title: `${r.id} 完整原行（leaf → caller）`,
          text: r.literal,
        },
        {
          id: `locations-${r.id.toLowerCase()}`,
          type: "snippet",
          title: `${r.id} 全部 raw → corrected / mapping`,
          text: r.locations
            .map(
              (l) => `${l.raw} → ${l.corrected} / ${l.mapping ?? "unmapped"}`,
            )
            .join("\n"),
        },
      ]),
    ),
  );
  p.push(
    panel(
      "originals",
      "06 · 完整原件、golden 与许可",
      sourceFiles.flatMap((s, i) => [
        prose(
          `original-meta-${i}`,
          `${s.source} · ${s.bytes} bytes · SHA-256 \`${s.sha256}\`。[固定原件](source:source-${i})。下方为完整原 bytes 的文本展示；URL-only 来源不等于 Git excerpt 验证。`,
        ),
        {
          id: [
            "original-source",
            "original-base",
            "original-golden",
            "original-license",
          ][i],
          type: "snippet",
          title: `完整 ${s.file}`,
          text: s.text,
        },
      ]),
    ),
  );
  p.push(
    panel("boundaries", "实验边界", [
      prose(
        "limits",
        "只读取固定两份 legacy fixture 并独立核算，没有运行 pprof 或采集 workload。数据依赖图不描述程序执行。没有通用 importer、新 schema 或动态 metric 切换。完整原件+同账目基线可解同样问题；尚无读者计时/正确率实测，不能宣称理解提速。普通 block 回链只回固定入口，不保存任意旧 DOM focus；Viewer 内改选不联动父页。",
      ),
    ]),
  );
  // Keep complete arithmetic graphs full-width. Native steps beside a diagram
  // otherwise reserve a text column and make its edge labels too small.
  for (const [viewId, detailId] of [
    ["count-view", "count-arithmetic"],
    ["delay-view", "delay-arithmetic"],
    ["denominators-view", "denominator-details"],
  ]) {
    const view = p.find((panel) => panel.id === viewId);
    const details = p.find((panel) => panel.id === detailId);
    const stepIndex = view.blocks.findIndex((block) => block.type === "steps");
    details.blocks.unshift(...view.blocks.splice(stepIndex, 1));
  }
  return { sourceFiles, ledger, document, graphs };
}
const escape = (s) =>
  s.replace(
    /[&<>\"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
export function generate() {
  const b = build();
  const out = path.join(ROOT, "output");
  fs.mkdirSync(out, { recursive: true });
  const write = (name, value) =>
    fs.writeFileSync(
      path.join(out, name),
      typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n",
    );
  write("ledger.json", b.ledger);
  write("candidate.explainer.json", b.document);
  for (const [name, spec] of Object.entries(b.graphs))
    write(`${name}.architecture.json`, spec);
  write(
    "baseline.html",
    `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Profile normalization · 完整文字基线</title><style>body{font:17px/1.6 system-ui;max-width:1100px;margin:40px auto;padding:20px;color:#182236;background:#fafbfd}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eef1f5;padding:20px}a{color:#124ec5}</style><h1>同一完整事实的文字与账目基线</h1><p>先按每个metric将source缩到base总量，逐样本round，再减同栈base。全部6source都改变分母。S1绝对差为1700 count / 608878600 ns；归一化差−229 count / −369 ns。不是性能结论。</p><h2>相同解释文字</h2>${b.document.panels.flatMap((p) => p.blocks.filter((v) => v.type === "prose").map((v) => `<p>${escape(v.text)}</p>`)).join("")}<h2>完整派生账目（同一ledger）</h2><pre>${escape(JSON.stringify(b.ledger, null, 2))}</pre>${b.sourceFiles.map((s) => `<h2>${escape(s.source)}</h2><p>${s.bytes} bytes · SHA-256 ${s.sha256} · <a href="${s.url}">固定来源</a></p><pre>${escape(s.text)}</pre>`).join("")}</html>`,
  );
  write("manifest.json", {
    upstreamSHA: SHA,
    inputs: b.sourceFiles.map(({ text, ...s }) => s),
    generatedBy: "generate.mjs",
    scope:
      "complete fixtures + original bounded arithmetic; no upstream execution",
  });
  return b;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generate();
  console.log(
    "Generated complete input ledger, native arithmetic witnesses, denominator graph, candidate and full-fact baseline.",
  );
}
