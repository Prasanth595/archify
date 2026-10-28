"""Recalculate data facts and extract archived DOM observations; no app execution."""
from pathlib import Path
import datetime, hashlib, json, re
r=Path(__file__).resolve().parent
data=(r/'fixtures/github-sample.json').read_bytes()
rows=json.loads(data)
def log(name):
    return (r/'browser'/name).read_text()
def headings(name):
    return re.findall(r'heading\n\s+text "([^"]+)"',log(name))
assert len(rows)==8 and all(type(x['private']) is bool and x['private'] is False for x in rows)
assert all(len(x)==77 for x in rows)
assert headings('11-same-pair.log')==['root','Index 2','Index 2']
assert headings('06-name-sibling.log')==['root','Index 2','name']
assert headings('10-direct-path.log')==['root','Index 7','private','Related values']
assert "SAME_PAIR_BEFORE" in log('11-same-pair.log') and "'Index 1', 'private'" in log('11-same-pair.log')
assert 'NAME_BEFORE name' in log('06-name-sibling.log') and 'git-consortium' in log('06-name-sibling.log')
raw=rows[2]['created_at']
assert raw=='2014-06-18T21:26:19Z' and type(raw) is str
instant=datetime.datetime.fromisoformat(raw.replace('Z','+00:00'))
date_log=log('12-date-confirm.log')
assert 'string/datetime/rfc3339' in date_log and '1403126779' in date_log
highlight=re.search(r"text: '(\d+)', dateTime: '([^']+)', className: 'bg-indigo[^']*'",date_log)
assert highlight and 'CLEANUP about:blank' in date_log
result={
 'scope':'Archived observations plus independently parsed later public JSON download; not a rerun of JSON Hero',
 'download':{'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'rows':len(rows),'fieldsPerRow':[len(x) for x in rows]},
 'samePair':{'from':1,'to':2,'gesture':['Alt+ArrowLeft','ArrowDown'],'falseHeadings':headings('11-same-pair.log'),'nameHeadings':headings('06-name-sibling.log'),'values':[{k:rows[i][k] for k in ['name','private']} for i in [1,2]]},
 'falseGroup':{'count':sum(x['private'] is False for x in rows),'paths':['$.'+str(i)+'.private' for i in range(len(rows))],'directJumpHeadings':headings('10-direct-path.log')},
 'date':{'raw':raw,'jsonType':'string','observedInferredType':'string/datetime/rfc3339','epochSeconds':int(instant.timestamp()),'ShanghaiDate':instant.astimezone(datetime.timezone(datetime.timedelta(hours=8))).date().isoformat(),'observedCalendarHighlight':{'text':highlight.group(1),'dateTimeAttribute':highlight.group(2)},'calendarCorrectnessAccepted':False},
 'deploymentCommit':'unknown',
}
print(json.dumps(result,indent=2))
