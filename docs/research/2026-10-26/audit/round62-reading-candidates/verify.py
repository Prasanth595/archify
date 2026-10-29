#!/usr/bin/env python3
"""Check archived source bytes and summarize public fixtures; no upstream execution."""
import hashlib,json
from pathlib import Path
P=Path(__file__).resolve().parent
manifest=json.loads((P/"sources.json").read_text())
for row in manifest["files"]:
    b=(P/row["localPath"]).read_bytes()
    assert len(b)==row["bytes"] and hashlib.sha256(b).hexdigest()==row["sha256"],row["localPath"]
    assert hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()==row["computedGitBlob"]
fixtures={}
for name in ["completed","running"]:
    f=P/f"temporal/sources/src/fixtures/raw-events.ascending.{name}.json"
    data=json.loads(f.read_text());events=data["history"]["events"]
    fixtures[name]={"events":len(events),"nextPageToken":data.get("nextPageToken"),
       "completedEvents":[{"id":e["eventId"],"type":e["eventType"]} for e in events if e["eventType"].endswith("Completed")],
       "last":{"id":events[-1]["eventId"],"type":events[-1]["eventType"]},
       "activityAttempts":[e["activityTaskStartedEventAttributes"]["attempt"] for e in events if e["eventType"]=="ActivityTaskStarted"]}
assert fixtures["completed"]["events"]==18 and fixtures["running"]["events"]==13
assert [x["id"] for x in fixtures["completed"]["completedEvents"]]==["4","11","14","17","18"]
pending=json.loads((P/"temporal/sources/src/fixtures/workflow.pending-activities.json").read_text())
activities=pending["pendingActivities"]
assert activities and all(a["attempt"]==1 and a.get("lastFailure") is None for a in activities)
html=(P/"shiki/sources/packages/twoslash/test/out/rich/line-query.html").read_text()
assert "Cannot assign to" in html and "read-only property" in html
result={"sourceFilesVerified":len(manifest["files"]),"fixtureSummary":fixtures,
        "pendingActivities":{"count":len(activities),"attempts":[a["attempt"] for a in activities],"allLastFailuresNull":True},
        "shikiCommittedSnapshotContainsReadonlyDiagnostic":True,
        "scope":"Archive integrity and static fixture inspection only; no producer, UI, TypeScript, import, or product tests."}
print(json.dumps(result,ensure_ascii=False,indent=2))
