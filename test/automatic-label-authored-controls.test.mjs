import assert from 'node:assert/strict';
import test from 'node:test';
import { placeAutomaticLabels } from '../archify/renderers/shared/automatic-labels.mjs';

test('automatic label repair preserves each authored control, including zero offsets', () => {
  const label = { relation: {}, relationIndex: 0, lx: 100, ly: 100, x: 80, y: 90, width: 40, height: 14 };
  const scene = {
    routes: [{ relationIndex: 0, points: [[20, 100], [180, 100]] }],
    components: [{ x: 75, y: 85, width: 50, height: 30 }],
    titles: [], viewBox: [200, 200],
  };
  const [automatic] = placeAutomaticLabels({ ...scene, labels: [label] });
  assert.notDeepEqual([automatic.lx, automatic.ly], [label.lx, label.ly], 'fixture must exercise automatic repair');
  for (const control of [{ labelAt: [100, 100] }, { labelDx: 0 }, { labelDy: 0 }, { labelSegment: 0 }]) {
    const pinned = { ...label, relation: control };
    const before = structuredClone(pinned);
    const [result] = placeAutomaticLabels({ ...scene, labels: [pinned] });
    assert.deepEqual(result, before, JSON.stringify(control));
    assert.deepEqual(pinned, before, 'repair must not mutate the authored input');
  }
});
