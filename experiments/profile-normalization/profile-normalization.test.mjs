import test from "node:test";
import assert from "node:assert/strict";
import { inputs, parse, arithmetic, build, goRound } from "./generate.mjs";

const sourceFiles = inputs();
const source = parse(sourceFiles[0].text, "source");
const base = parse(sourceFiles[1].text, "base");
const expectedValues = [
  [2700, 608881724],
  [100, 23992],
  [200, 179943],
  [100, 17778444],
  [100, 75976],
  [300, 63568134],
];
const expectedNormalized = [
  [771, 2755],
  [29, 0],
  [57, 1],
  [29, 80],
  [29, 0],
  [86, 288],
];
const expectedDiff = [
  [-229, -369],
  [29, 0],
  [57, 1],
  [29, 80],
  [29, 0],
  [86, 288],
];

// The complete upstream golden provides an independent location and value oracle.
test("complete pinned fixtures retain all seven raw identities, locations and maps", () => {
  assert.deepEqual(
    sourceFiles.map((f) => f.bytes),
    [1551, 821, 2025, 11358],
  );
  assert.equal(source.rows.length, 6);
  assert.equal(base.rows.length, 1);
  assert.equal(source.maps.length, 12);
  assert.deepEqual(
    base.maps.map(({ id, line, ...m }) => m),
    source.maps.map(({ id, line, ...m }) => m),
  );
  assert.deepEqual(
    source.rows.map((r) => r.locations.length),
    [13, 4, 15, 16, 16, 15],
  );
  assert.equal(base.rows[0].locations.length, 13);
  assert.deepEqual(
    source.rows.map((r) => r.line),
    [6, 7, 8, 9, 10, 11],
  );
  const golden = sourceFiles[2].text;
  const goldenRows = [...golden.matchAll(/^\s+(\d+)\s+(\d+): ([\d ]+)$/gm)];
  const goldenLocations = new Map(
    [...golden.matchAll(/^\s+(\d+): (0x[\da-f]+) M=(\d+)\s*$/gm)].map((m) => [
      Number(m[1]),
      { corrected: m[2], mapping: `M${m[3]}` },
    ]),
  );
  assert.equal(goldenRows.length, 6);
  assert.equal(goldenLocations.size, 40);
  source.rows.forEach((r, i) => {
    assert.deepEqual(r.values, goldenRows[i].slice(1, 3).map(Number));
    assert.deepEqual(r.values, expectedValues[i]);
    const locations = goldenRows[i][3]
      .trim()
      .split(/\s+/)
      .map((id) => goldenLocations.get(Number(id)));
    assert.deepEqual(
      r.locations.map(({ raw, ...l }) => l),
      locations,
    );
    r.locations.forEach((l) =>
      assert.equal(BigInt(l.raw) - BigInt(l.corrected), 1n),
    );
    assert.equal(r.literal, sourceFiles[0].text.split("\n")[r.line - 1]);
  });
  assert.deepEqual(base.rows[0].values, [1000, 3124]);
  assert.deepEqual(source.rows[0].locations, base.rows[0].locations);
});

test("each metric independently scales, rounds, subtracts and preserves zero-delay rows", () => {
  const m = arithmetic(source, base);
  assert.deepEqual(m.sourceTotal, [3500, 690508213]);
  assert.deepEqual(m.baseTotal, [1000, 3124]);
  assert.deepEqual(m.factors, [1000 / 3500, 3124 / 690508213]);
  assert.deepEqual(
    m.comparisonRows.map((r) => r.normalized),
    expectedNormalized,
  );
  assert.deepEqual(
    m.comparisonRows.map((r) => r.normalizedDiff),
    expectedDiff,
  );
  assert.deepEqual(
    m.comparisonRows.map((r) => r.absoluteDiff),
    [[1700, 608878600], ...expectedValues.slice(1)],
  );
  assert.deepEqual(
    m.comparisonRows.map((r) => r.baseId),
    ["B1", null, null, null, null, null],
  );
  assert.deepEqual(m.normalizedSourceTotal, [1001, 3124]);
  assert.deepEqual(m.netDiff, [1, 0]);
  assert.deepEqual([goRound(1.5), goRound(-1.5)], [2, -2]);
});

test("base matching uses the whole stack; shared leaf alone cannot create a match", () => {
  const altered = structuredClone(source);
  altered.rows[0].locations.at(-1).corrected = "0x7fcdc2ff214c";
  const m = arithmetic(altered, base);
  assert.equal(m.comparisonRows[0].baseId, null);
  assert.deepEqual(m.comparisonRows[0].base, [0, 0]);
  assert.deepEqual(m.comparisonRows[0].absoluteDiff, expectedValues[0]);
});

test("merge labels preserve seven diff_base records and distinct report denominators", () => {
  const m = arithmetic(source, base);
  assert.deepEqual(
    Object.values(m.modes).map((v) => v.denominators),
    [
      [2500, 690505089],
      [1000, 3124],
      [459, 738],
      [1000, 3124],
    ],
  );
  assert.equal(m.modes["normalized-base"].samples.length, 6);
  assert.equal(m.modes["normalized-diff-base"].samples.length, 7);
  assert.deepEqual(m.modes["normalized-base"].samples[0].contributors, [
    "S1",
    "B1",
  ]);
  const tagged = m.modes["normalized-diff-base"].samples.at(-1);
  assert.deepEqual(tagged.labels, { "pprof::base": ["true"] });
  assert.deepEqual(tagged.values, [-1000, -3124]);
  assert.deepEqual(m.modes["normalized-diff-base"].denominatorSamples, [
    ["B1"],
  ]);
  assert.deepEqual(
    [0, 1].map((i) =>
      m.modes["normalized-diff-base"].samples.reduce(
        (sum, r) => sum + r.values[i],
        0,
      ),
    ),
    [1, 0],
  );
});

test("native witnesses retain six total dependencies, arithmetic inputs and reachable fixed returns", () => {
  const { graphs, document } = build();
  const blocks = document.panels.flatMap((p) => p.blocks);
  const blockTargets = new Set([
    ...document.panels.map((p) => p.id),
    ...blocks.map((b) => b.id),
  ]);
  for (const name of ["count", "delay"]) {
    const g = graphs[name];
    assert.equal(g.components.length, 13);
    assert.equal(g.connections.length, 15);
    assert.deepEqual(
      g.connections.filter((f) => f.to === "source-total").map((f) => f.from),
      ["S1", "S2", "S3", "S4", "S5", "S6"],
    );
    for (const [from, to] of [
      ["source-total", "factor"],
      ["base-total", "factor"],
      ["factor", "round"],
      ["S1", "round"],
      ["round", "normalized"],
      ["B1", "normalized"],
    ])
      assert.ok(g.connections.some((f) => f.from === from && f.to === to));
    const factor = blocks.find((b) => b.id === `${name}-factor-entry`);
    assert.ok(factor.text.includes(`node:${name}-flow.factor`));
    const graph = blocks.find((b) => b.id === `${name}-flow`);
    assert.deepEqual(
      Object.keys(graph.nodeBlocks),
      g.components.map((n) => n.id),
    );
    Object.values(graph.nodeBlocks).forEach((id) =>
      assert.ok(blockTargets.has(id)),
    );
  }
  const denominator = graphs.denominators;
  for (const target of ["base-ratio", "tagged-ratio"]) {
    assert.ok(
      denominator.connections.some((f) => f.from === "numerator" && f.to === target),
    );
    assert.ok(
      denominator.connections.some((f) => f.label === "分母" && f.to === target),
    );
  }
  const numeratorBlock = blocks.find((b) => b.id === "denom-detail-numerator");
  assert.ok(numeratorBlock.text.includes("block:count-detail-normalized"));
  assert.ok(numeratorBlock.text.includes("block:delay-detail-normalized"));
  for (const b of blocks) {
    const texts = [
      b.text ?? "",
      ...(b.items ?? []).flatMap((i) => [i.text ?? "", i.detail ?? ""]),
    ];
    for (const text of texts)
      for (const match of text.matchAll(/\]\(block:([^)]+)\)/g))
        assert.ok(
          blockTargets.has(match[1]),
          `Missing real block: ${match[1]}`,
        );
  }
});
