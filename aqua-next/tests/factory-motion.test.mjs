import test from 'node:test';
import assert from 'node:assert/strict';
import { factoryChapterStops, factoryMotion } from '../lib/factory-motion.mjs';

test('factory opening shows three separate previews, then raises only the centre film', () => {
  const start = factoryMotion(0, 1440, 900);
  assert.ok(start.cards.every(card => card.opacity === 1 && card.y > 700));
  assert.ok(start.cards[1].x < start.cards[0].x && start.cards[0].x < start.cards[2].x);
  const lifted = factoryMotion(.22, 1440, 900);
  assert.ok(lifted.cards[0].y < start.cards[0].y);
  assert.ok(lifted.cards[0].width > start.cards[0].width);
  assert.equal(lifted.cards[1].opacity, 0);
  assert.equal(lifted.overlayReveal, 0);
});

test('video fills desktop and mobile before overlay titles enter; selectors reach every film', () => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const full = factoryMotion(.39, width, height);
    assert.equal(full.cards[0].width, width);
    assert.equal(full.cards[0].height, height);
    assert.equal(full.cards[0].y, 0);
    assert.equal(full.overlayReveal, 0);
    factoryChapterStops.forEach((stop, index) => {
      const chapter = factoryMotion(stop, width, height);
      assert.equal(chapter.active, index);
      assert.equal(chapter.cards[index].opacity, 1);
      assert.equal(chapter.overlayReveal, 1);
    });
  }
});

test('reduced motion skips expansion and exposes the title immediately', () => {
  const state = factoryMotion(0, 390, 844, true);
  assert.equal(state.introOpacity, 0);
  assert.equal(state.overlayReveal, 1);
  assert.ok(state.cards.every(card => card.width === 390 && card.height === 844));
});
