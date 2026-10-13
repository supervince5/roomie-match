import test from 'node:test';
import assert from 'node:assert/strict';
import { trackSwipePointer } from '../src/lib/swipePointerSession.ts';
import { createSwipeMotion, beginSwipeDrag, moveSwipeDrag, releaseSwipeDrag, advanceSwipe } from '../src/lib/swipePreviewMotion.ts';
function setup() {
  const target = new EventTarget(), blurTarget = new EventTarget();
  const motion = createSwipeMotion(6);
  beginSwipeDrag(motion);
  let endings = 0;
  const stop = trackSwipePointer({ target, blurTarget, pointerId: 1, originX: 200,
    onMove: x => moveSwipeDrag(motion, x),
    onEnd: interrupted => { endings++; releaseSwipeDrag(motion, 220, false, !interrupted); },
  });
  const emit = (type, x = 200, extra = {}) => target.dispatchEvent(Object.assign(new Event(type), {pointerId: 1, clientX: x, buttons: type === 'pointerup' ? 0 : 1, ...extra}));
  return {motion, emit, blurTarget, stop, endings: () => endings};
}
for (const direction of [-1, 1]) {
  test(`release far outside the deck commits ${direction} without a hold`, () => {
    const s = setup();
    s.emit('pointermove', 200 + direction * 1000);
    s.emit('pointerup', 200 + direction * 1000);
    assert.equal(s.motion.mode, 'out');
    assert.equal(s.motion.direction, direction);
    assert.equal(s.motion.duration, 750);
    advanceSwipe(s.motion, 750, 220, false);
    assert.equal(s.motion.order.at(-1), 0);
    assert.equal(s.motion.duration, 1100);
  });
}
test('capture loss does not cancel tracking; later release commits once', () => {
  const s = setup();
  s.emit('pointermove', 240);
  s.emit('lostpointercapture');
  assert.equal(s.motion.mode, 'drag');
  s.emit('pointermove', 900);
  s.emit('pointerup', 900);
  s.emit('pointerup', 900);
  assert.equal(s.motion.mode, 'out');
  assert.equal(s.endings(), 1);
});
for (const event of ['pointercancel', 'blur']) {
  test(`${event} preserves a crossed swipe threshold`, () => {
    const s = setup();
    s.emit('pointermove', 170);
    if (event === 'blur') s.blurTarget.dispatchEvent(new Event('blur'));
    else s.emit(event);
    assert.equal(s.motion.mode, 'out');
    assert.equal(s.motion.direction, -1);
  });
  test(`${event} before movement does not accidentally like`, () => {
    const s = setup();
    if (event === 'blur') s.blurTarget.dispatchEvent(new Event('blur'));
    else s.emit(event);
    assert.equal(s.motion.mode, 'settle');
    assert.deepEqual(s.motion.order, [0,1,2,3,4,5]);
  });
}
test('release coordinates alone can complete a fast flick', () => {
  const s = setup();
  s.emit('pointerup', 220);
  assert.equal(s.motion.mode, 'out');
});
test('mouse returning with button released finishes a missed outside release', () => {
  const s = setup();
  s.emit('pointermove', 600);
  s.emit('pointermove', 210, {buttons: 0});
  assert.equal(s.motion.mode, 'out');
  assert.equal(s.endings(), 1);
});
test('unrelated pointers do not end a drag, cleanup removes listeners', () => {
  const s = setup();
  s.emit('pointerup', 900, {pointerId: 2});
  assert.equal(s.motion.mode, 'drag');
  s.stop();
  s.emit('pointerup', 900);
  assert.equal(s.endings(), 0);
});
