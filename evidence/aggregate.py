#!/usr/bin/env python3
"""Aggregate the per-project report.json files into the comparison table."""
import json
import os
import sys

ROOT = "/tmp/archify-960/evidence/projects"

rows = []
for name in sorted(os.listdir(ROOT)):
    report = os.path.join(ROOT, name, "report.json")
    if not os.path.isfile(report):
        continue
    try:
        with open(report) as handle:
            data = json.load(handle)
    except Exception as error:  # noqa: BLE001
        print(f"skip {name}: {error}", file=sys.stderr)
        continue
    base = data.get("base", {})
    cand = data.get("candidate", {})
    rows.append({
        "project": data.get("project", name),
        "repo": data.get("repo", ""),
        "revision": (data.get("revision") or "")[:12],
        "base_rounds": base.get("repairRounds"),
        "base_invocations": base.get("finalizeInvocations"),
        "base_delivered": base.get("delivered"),
        "base_cli_sec": base.get("cliExecSec"),
        "base_total_sec": base.get("totalElapsedSec"),
        "cand_rounds": cand.get("repairRounds"),
        "cand_invocations": cand.get("finalizeInvocations"),
        "cand_delivered": cand.get("delivered"),
        "cand_cli_sec": cand.get("cliExecSec"),
        "cand_total_sec": cand.get("totalElapsedSec"),
    })


def num(value):
    if isinstance(value, (int, float)):
        return value
    return "—"


def yn(value):
    if value is True:
        return "yes"
    if value is False:
        return "no"
    return "—"


header = (
    "| Project | Revision | base repairs | base finalize | base delivered | "
    "base CLI s | candidate repairs | candidate finalize | candidate delivered | candidate CLI s |"
)
divider = "|---|---|---|---|---|---|---|---|---|---|"

lines = [header, divider]
for row in rows:
    lines.append(
        f"| {row['project']} | `{row['revision']}` | {num(row['base_rounds'])} | "
        f"{num(row['base_invocations'])} | {yn(row['base_delivered'])} | {num(row['base_cli_sec'])} | "
        f"{num(row['cand_rounds'])} | {num(row['cand_invocations'])} | {yn(row['cand_delivered'])} | "
        f"{num(row['cand_cli_sec'])} |"
    )

totals = {
    "base_rounds": sum(r["base_rounds"] for r in rows if isinstance(r["base_rounds"], int)),
    "cand_rounds": sum(r["cand_rounds"] for r in rows if isinstance(r["cand_rounds"], int)),
    "base_delivered": sum(1 for r in rows if r["base_delivered"] is True),
    "cand_delivered": sum(1 for r in rows if r["cand_delivered"] is True),
    "base_cli": round(sum(r["base_cli_sec"] for r in rows if isinstance(r["base_cli_sec"], (int, float))), 2),
    "cand_cli": round(sum(r["cand_cli_sec"] for r in rows if isinstance(r["cand_cli_sec"], (int, float))), 2),
    "base_total": round(sum(r["base_total_sec"] for r in rows if isinstance(r["base_total_sec"], (int, float))), 1),
    "cand_total": round(sum(r["cand_total_sec"] for r in rows if isinstance(r["cand_total_sec"], (int, float))), 1),
}

lines.append(
    f"| **total ({len(rows)} projects)** | | **{totals['base_rounds']}** | | "
    f"**{totals['base_delivered']}/{len(rows)}** | **{totals['base_cli']}** | "
    f"**{totals['cand_rounds']}** | | **{totals['cand_delivered']}/{len(rows)}** | **{totals['cand_cli']}** |"
)

print("\n".join(lines))
print()
print("wall-clock authoring totals (base -> candidate): "
      f"{totals['base_total']}s -> {totals['cand_total']}s")
