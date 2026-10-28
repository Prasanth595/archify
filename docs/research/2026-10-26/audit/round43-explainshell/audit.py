#!/usr/bin/env python3
"""Integrity and bounded semantic checks for archived website observations."""
import hashlib
import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse

r = Path(__file__).resolve().parent
obs = json.loads((r / "observations.json").read_text())
for prefix, record in obs.items():
    line = next(x for x in (r / "browser" / record["log"]).read_text().splitlines()
                if x.startswith(prefix + " "))
    assert json.loads(line[len(prefix) + 1:]) == record["data"]
o = {key: value["data"] for key, value in obs.items()}
fields = ("text", "helpref", "class", "title")
assert [{k: s[k] for k in fields} for s in o["HOVER"]["spans"]] == [
    {k: s[k] for k in fields} for s in o["REPLAY"]["spans"]]
assert len(o["REPLAY"]["spans"]) == 6
quoted = next(s for s in o["HOVER"]["spans"] if s["text"] == "-e '-foo'")
assert quoted["helpref"] == "help-2" and quoted["opacity"] == "1"
assert next(h for h in o["HOVER"]["help"] if h["id"] == "help-2")["opacity"] == "1"
assert all(h["opacity"] == "0.4" for h in o["HOVER"]["help"] if h["id"] != "help-2")
unknown = [s for s in o["UNKNOWN_READY"]["spans"] if "unknown" in s["class"].split()]
assert [s["text"] for s in unknown] == ["--archify-unknown", "notes.txt"]
assert all(s["title"] == "No matching help text found for this argument" for s in unknown)
missing = o["MISSING"]["spans"][0]
assert missing["text"] == "archify_missing_command notes.txt"
assert missing["title"] == "This man page seems to be missing..."
assert [s["text"] for s in o["MISSING"]["spans"][1:]] == ["|", "wc(1)", "-l"]
wc = next(s for s in o["REPLAY"]["spans"] if s["text"] == "wc(1)")
assert wc["href"] == "/explain/1/rust-wc" and wc["helpref"] == "help-3"
wc_missing = next(s for s in o["MISSING"]["spans"] if s["text"] == "wc(1)")
assert wc_missing["href"] == wc["href"] and wc_missing["helpref"] == "help-1"
assert next(s for s in o["ALTERNATIVE"]["spans"] if s["text"] == "gnuwc.1")["href"] == "/explain/1/gnuwc"
inputs = json.loads((r / "inputs.json").read_text())
for key, label in [("known", "REPLAY"), ("unknown_option", "UNKNOWN_READY"),
                   ("missing_manual", "MISSING"), ("manual_alternative", "ALTERNATIVE")]:
    assert parse_qs(urlparse(o[label]["url"]).query)["cmd"] == [inputs[key]]
for item in json.loads((r / "sources.json").read_text())["files"]:
    b = (r / "upstream" / item["path"]).read_bytes()
    assert len(b) == item["size"]
    assert hashlib.sha1(b"blob " + str(len(b)).encode() + b"\0" + b).hexdigest() == item["sha"]
    assert hashlib.sha256(b).hexdigest() == item["sha256"]
assert len(list((r / "images").glob("*.png"))) == 7
assert len(list((r / "browser").glob("*.mjs"))) == 7
actual = {str(p.relative_to(r)): hashlib.sha256(p.read_bytes()).hexdigest()
          for p in r.rglob("*") if p.is_file() and p.name != "manifest.json"}
assert actual == json.loads((r / "manifest.json").read_text())
print(f"PASS: {len(actual)} archived files; quote/help mapping, unknown scopes, manual choice and source identities agree")
