#!/usr/bin/env python3
"""Audit archived evidence only; does not run a BPMN engine or browser."""
import hashlib, json, struct, xml.etree.ElementTree as ET
from pathlib import Path
P=Path(__file__).resolve().parent
identity=json.loads((P/"source-identities.json").read_text())
for row in identity["files"]:
    data=(P/"sources"/row["path"]).read_bytes()
    assert hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()==row["sha"],row["path"]
ns={"b":"http://www.omg.org/spec/BPMN/20100524/MODEL","d":"http://www.omg.org/spec/BPMN/20100524/DI"}
source=ET.parse(P/"sources/test/spec/simulator/Simulator.parallel-gateway-join.bpmn").getroot()
export=ET.parse(P/"browser/native-export.bpmn").getroot()
def canonical(e):
    return (e.tag,tuple(sorted(e.attrib.items())),(e.text or "").strip(),tuple(canonical(c) for c in e))
assert canonical(source.find("b:process",ns))==canonical(export.find("b:process",ns))
for tag in ["BPMNShape","BPMNEdge"]:
    a={e.attrib["id"]:canonical(e) for e in source.findall(".//d:"+tag,ns)}
    b={e.attrib["id"]:canonical(e) for e in export.findall(".//d:"+tag,ns)}
    assert a==b
assert export.attrib["exporter"]=="bpmn-js-token-simulation"
assert export.attrib["exporterVersion"]=="1.1.0"
source_attributes={k:v for k,v in source.attrib.items() if k not in ["exporter","exporterVersion"]}
export_attributes={k:v for k,v in export.attrib.items() if k not in ["exporter","exporterVersion"]}
assert source_attributes==export_attributes
waiting=json.loads((P/"browser/05-two-timers.json").read_text())["observed"]
assert {e["id"]:e["text"] for e in waiting["overlays"]}=={
 "StartEvent_1":"","ParallelJoin_1":"2","EndEvent_1":"","Activity_1":"1","Timer_1":""}
waiting_log=json.loads((P/"browser/06-log.json").read_text())["observed"]["log"]
assert [e["text"] for e in waiting_log]==["Process started","Start Event","Boundary Event","Boundary Event"]
done=json.loads((P/"browser/07-timer-task.json").read_text())["observed"]
assert {e["id"]:e["text"] for e in done["overlays"]}=={
 "StartEvent_1":"","ParallelJoin_1":"","EndEvent_1":"Finished","Activity_1":"","Timer_1":""}
assert "Process finished" in done["text"] and "Parallel Gateway" in done["text"]
dimensions={}
for png in sorted((P/"browser").glob("*.png")):
    data=png.read_bytes();assert data[:8]==b"\x89PNG\r\n\x1a\n"
    dimensions[png.name]=struct.unpack(">II",data[16:24]);assert dimensions[png.name]==(1291,761)
assert len(dimensions)==4
result={"sourceBlobs":len(identity["files"]),"bpmnProcessAndDrawingMatch":True,
        "exportedVersion":export.attrib["exporterVersion"],"savedNativeArms":2,
        "screenshots":dimensions,"scope":"Archived data integrity, not a fresh runtime test."}
print(json.dumps(result,ensure_ascii=False,indent=2))
