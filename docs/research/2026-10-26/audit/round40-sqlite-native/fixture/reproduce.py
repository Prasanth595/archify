#!/usr/bin/env python3
"""Run the reviewed upstream SQLite fixture with the existing Apple CLI."""
import ast
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import time

source = Path(__file__).resolve().parent
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=False)
html = (source / 'sqlite-query-explainer.html').read_text()
python = re.search(r'<script type="text/x-python" id="py-src">(.*?)</script>', html, re.S)[1]
tree = ast.parse(python)
selected = [n for n in tree.body if
            isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'EXAMPLE_SCHEMA' for t in n.targets)
            or isinstance(n, ast.FunctionDef) and n.name == 'load_example_database']
assert len(selected) == 2
# Reviewed fixture code only; omit the unrelated schema-description return value.
scope = {'sqlite3': sqlite3, 'get_schema': lambda: None}
exec(compile(ast.Module(body=selected, type_ignores=[]), '<reviewed-upstream-fixture>', 'exec'), scope)
scope['load_example_database']()
db = out / 'fixture.db'
connection = sqlite3.connect(db)
scope['conn'].backup(connection)
connection.close()
scope['conn'].close()
query = 'SELECT name,\n  (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count\nFROM customers'
cases = {'limit-10': query + ' LIMIT 10', 'limit-0': query + ' LIMIT 0',
         'all': query, 'sorted-10': query + ' ORDER BY order_count DESC LIMIT 10'}
commands = []
binary = '/usr/bin/sqlite3'
def run(name, args):
    argv = [binary, *args]
    start = time.perf_counter()
    result = subprocess.run(argv, capture_output=True)
    commands.append({'name': name, 'argv': argv, 'exit': result.returncode,
                     'elapsed_seconds': time.perf_counter()-start})
    (out / (name+'.stdout')).write_bytes(result.stdout)
    (out / (name+'.stderr')).write_bytes(result.stderr)
    assert result.returncode == 0, name
    return result.stdout.decode()
run('version', ['--version'])
run('compile-options', [str(db), 'SELECT sqlite_source_id(); PRAGMA compile_options;'])
run('cardinality', [str(db), '-json', 'SELECT (SELECT count(*) FROM customers) AS customers, (SELECT count(*) FROM orders) AS orders;'])
observations = {}
for name, sql in cases.items():
    (out / (name+'.sql')).write_text(sql+';\n')
    plan = run(name+'-eqp', [str(db), '-json', '.explain off', 'EXPLAIN QUERY PLAN '+sql+';'])
    profile = run(name+'-profile', [str(db), '.scanstats on', sql+';'])
    # Fixed CLI-format extraction for this archive; not a general plan parser.
    result, metrics = profile.split('QUERY PLAN\n', 1)
    search = next(line for line in metrics.splitlines() if 'SEARCH orders USING COVERING INDEX' in line)
    loop_rows = re.search(r'loops=(\d+) rows=(\d+)', search)
    observations[name] = {'result_rows':len(result.splitlines()),
                          'orders_index_loops':int(loop_rows[1]),
                          'orders_index_rows':int(loop_rows[2]),
                          'eqp':json.loads(plan), 'raw_profile':metrics}
(out / 'observations.json').write_text(json.dumps(observations,indent=2)+'\n')
(out / 'commands.json').write_text(json.dumps({'python':sys.version,'fixture_sqlite_version':sqlite3.sqlite_version,
    'fixture_creation':'only reviewed EXAMPLE_SCHEMA and load_example_database; get_schema return stubbed',
    'binary':binary,'binary_sha256':hashlib.sha256(Path(binary).read_bytes()).hexdigest(),
    'database_sha256':hashlib.sha256(db.read_bytes()).hexdigest(),'database_bytes':db.stat().st_size,
    'commands':commands},indent=2)+'\n')
print(json.dumps({'commands':len(commands),'cases':{k:{f:v[f] for f in ['result_rows','orders_index_loops','orders_index_rows']} for k,v in observations.items()}}))
