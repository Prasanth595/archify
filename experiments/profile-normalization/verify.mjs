import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { ROOT, generate } from "./generate.mjs";

const repo = path.resolve(ROOT, "../..");
const evidence = fs.mkdtempSync(
  path.join(os.tmpdir(), "archify-profile-normalization-verify-"),
);
generate();
const commands = [
  [
    "tests",
    [
      "--test",
      "experiments/profile-normalization/profile-normalization.test.mjs",
    ],
  ],
  [
    "finalize",
    [
      "archify/bin/archify.mjs",
      "finalize",
      "explainer",
      "experiments/profile-normalization/output/candidate.explainer.json",
      "experiments/profile-normalization/output/candidate.html",
      "--out-dir",
      path.join(evidence, "finalize"),
      "--json",
    ],
  ],
  [
    "check",
    [
      "archify/bin/archify.mjs",
      "check",
      "experiments/profile-normalization/output/candidate.html",
      "--require-provenance",
      "--json",
    ],
  ],
];
const results = [];
for (const [name, args] of commands) {
  const r = spawnSync(process.execPath, args, { cwd: repo, encoding: "utf8" });
  fs.writeFileSync(path.join(evidence, `${name}.stdout`), r.stdout ?? "");
  fs.writeFileSync(path.join(evidence, `${name}.stderr`), r.stderr ?? "");
  results.push({ name, exitCode: r.status });
  console.log(`${name}: exit ${r.status}`);
}
const finalize = JSON.parse(
  fs.readFileSync(path.join(evidence, "finalize.stdout")),
);
const outputs = [
  "baseline.html",
  "candidate.html",
  "candidate.explainer.json",
  "ledger.json",
  "count.architecture.json",
  "delay.architecture.json",
  "denominators.architecture.json",
].map((file) => {
  const raw = fs.readFileSync(path.join(ROOT, "output", file));
  return {
    file,
    bytes: raw.length,
    sha256: createHash("sha256").update(raw).digest("hex"),
  };
});
fs.writeFileSync(
  path.join(ROOT, "output/verification.json"),
  JSON.stringify(
    {
      kind: "Portable derived summary; raw CLI stdout/stderr and receipts retained outside checkout",
      base: "6ca6a5c84439b57ea22e0630fe306e1d91587a6e",
      node: process.version,
      results,
      gates: finalize.gates,
      outputs,
      browser:
        "not run by this script; root owns separate real Ego acceptance and public browser gate",
      ci: "not run",
    },
    null,
    2,
  ) + "\n",
);
console.log(`Raw evidence: ${evidence}`);
if (results.some((r) => r.exitCode !== 0)) process.exitCode = 1;
