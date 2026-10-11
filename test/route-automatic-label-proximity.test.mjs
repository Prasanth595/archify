import assert from 'node:assert/strict';
import test from 'node:test';
import { placeAutomaticLabels } from '../archify/renderers/shared/automatic-labels.mjs';
import { rectsOverlap } from '../archify/renderers/shared/geometry.mjs';

test('blocked own-route slots retain a diagnostic collision instead of orphaning a label', () => {
  const label = { relation: {}, relationIndex: 0, lx: 100, ly: 100, x: 80, y: 90, width: 40, height: 14 };
  const obstacle = { x: 0, y: 60, width: 200, height: 80 };
  const scene = { labels: [label], components: [obstacle], titles: [], viewBox: [200, 200],
    routes: [{ relationIndex: 0, points: [[20, 100], [180, 100]] }] };
  const [unrestricted] = placeAutomaticLabels(scene);
  assert.equal(rectsOverlap(unrestricted, obstacle), false, 'fixture offers a distant clear fallback');
  for (const policy of [{ keepFallbackNearRoute: true }, { maxOwnRouteDistance: 36 }]) {
    const [bounded] = placeAutomaticLabels({ ...scene, ...policy });
    assert.deepEqual(bounded, label, JSON.stringify(policy));
    assert.equal(rectsOverlap(bounded, obstacle), true, 'validation must retain the original repairable collision');
  }
});
