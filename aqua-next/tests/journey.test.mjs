import test from 'node:test';
import assert from 'node:assert/strict';
import { getJourneyState, progressForProduct, getModelPose, productIds } from '../lib/journey.mjs';
import { createProductModels, disposeModels } from '../lib/product-models.js';
import { Box3 } from 'three';

test('the full scroll range visits every product and ends on the final construction feature', () => {
  assert.equal(getJourneyState(0).id, 'sailing');
  assert.equal(getJourneyState(0).phase, -1);
  const seen = new Set();
  for (let step = 0; step <= 1000; step++) {
    const state = getJourneyState(step / 1000);
    seen.add(state.id);
    assert.ok(state.local >= 0 && state.local <= 1);
    assert.ok(state.phase >= -1 && state.phase <= 2);
  }
  assert.deepEqual([...seen], productIds);
  assert.equal(getJourneyState(1).id, 'paragliding');
  assert.equal(getJourneyState(1).phase, 2);
});

test('product selectors and each feature button navigate to their own chapter', () => {
  for (const id of productIds) {
    for (let phase = -1; phase <= 2; phase++) {
      const state = getJourneyState(progressForProduct(id, phase));
      assert.equal(state.id, id);
      assert.equal(state.phase, phase);
    }
  }
  assert.equal(progressForProduct('unknown'), null);
});

test('out-of-range scroll positions stay safe and model poses remain finite', () => {
  assert.equal(getJourneyState(-100).id, 'sailing');
  assert.equal(getJourneyState(100).id, 'paragliding');
  for (const id of productIds) {
    for (const compact of [true, false]) {
      for (let i = 0; i <= 100; i++) {
        const pose = getModelPose(id, i / 100, compact);
        assert.ok(Object.values(pose).every(Number.isFinite));
        assert.ok(pose.scale > 0);
      }
    }
    const early = getModelPose(id, 0, false, true);
    const late = getModelPose(id, 1, false, true);
    assert.deepEqual(early, late, 'reduced-motion mode must not turn or move the model with scroll');
  }
});

test('all three product forms have renderable geometry and three finite label anchors', () => {
  const models = createProductModels();
  for (const id of productIds) {
    const model = models[id];
    const bounds = new Box3().setFromObject(model);
    assert.ok(!bounds.isEmpty());
    assert.ok(bounds.max.x > bounds.min.x && bounds.max.y > bounds.min.y);
    assert.equal(model.userData.anchors.length, 3);
    assert.ok(model.userData.anchors.flat().every(Number.isFinite));
    let meshes = 0;
    model.traverse(object => {
      if (!object.isMesh) return;
      meshes++;
      assert.ok(object.geometry.attributes.position.array.every(Number.isFinite));
      assert.ok(object.geometry.attributes.normal.array.every(Number.isFinite));
    });
    assert.ok(meshes > 5, `${id} includes the fabric and construction details`);
  }
  disposeModels(models);
});
