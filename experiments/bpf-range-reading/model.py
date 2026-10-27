from collections import Counter
import platform

mask = (1 << 64) - 1
values = [(a - b) & mask for a in range(256) for b in range(256)]
signed = [v if v < (1 << 63) else v - (1 << 64) for v in values]
shifted = Counter(v >> 56 for v in values)
print('Python:', platform.python_version())
print('pairs:', len(values))
print('signed min/max:', min(signed), max(signed))
print('shift 56 counts:', dict(sorted(shifted.items())))
print('negative/zero/positive:', sum(x < 0 for x in signed), sum(x == 0 for x in signed), sum(x > 0 for x in signed))
