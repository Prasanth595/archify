from pathlib import Path
import hashlib

root = Path(__file__).parent
src = (root / 'upstream/verifier_bounds.c').read_text().splitlines()
expected = '\n'.join(src[8:76])
a = (root / 'baseline.archify.md').read_text()
b = (root / 'candidate.archify.md').read_text()
projection = '\n## 对齐比较：不同的只有中间一行'
assert b.split(projection)[0].rstrip('\n') == a.rstrip('\n')
for arm in ('baseline', 'candidate'):
    draft = (root / f'{arm}.archify.md').read_text()
    assert '```c\n' + expected + '\n```' in draft
    html = (root / f'{arm}.html').read_text()
    for token in ('R0 max value is outside of the allowed memory range', 'R1 has unknown scalar with mixed signed bounds', '32,896', '32,640', 'GPL-2.0'):
        assert token in html, (arm, token)
assert hashlib.sha256((root / 'upstream/verifier_bounds.c').read_bytes()).hexdigest() == '8321822a812c1bf78e771a73b678063cc17969dfb676de7f3c91a09fe3cec8ee'
print('PASS: identical baseline content, verbatim source excerpt, expected text, attribution, source hash')
