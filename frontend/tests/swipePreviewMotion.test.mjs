import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceSwipe,
  beginSwipeDrag,
  cancelSwipeDrag,
  createSwipeMotion,
  frontCard,
  moveSwipeDrag,
  swipeFrame,
  triggerSwipe,
} from "../src/lib/swipePreviewMotion.ts";

function assertSafeLayers(before, after) {
  for (let a = 0; a < after.length; a++)
    for (let b = a + 1; b < after.length; b++) {
      if (
        Math.sign(before[a].z - before[b].z) !==
        Math.sign(after[a].z - after[b].z)
      ) {
        assert.ok(
          Math.min(
            before[a].opacity,
            after[a].opacity,
            before[b].opacity,
            after[b].opacity,
          ) < 0.001,
          `Visible cards ${a}/${b} exchanged layers`,
        );
      }
    }
}
function assertSamePicture(before, after) {
  before.forEach((pose, id) => {
    for (const key of ["x", "y", "angle", "scale", "opacity", "z", "badge"]) {
      assert.ok(
        Math.abs(pose[key] - after[id][key]) < 0.001,
        `Card ${id} jumped in ${key}`,
      );
    }
  });
}

test("twenty automatic cycles alternate directions and never exchange visible layers", () => {
  const m = createSwipeMotion(6);
  for (let cycle = 0; cycle < 20; cycle++) {
    const previousOrder = [...m.order];
    const direction = m.direction;
    for (let t = 0; t < 9000; t += 10) {
      const before = swipeFrame(m).poses;
      advanceSwipe(m, 10, 220, true);
      assertSafeLayers(before, m.poses);
      if (t === 3990) assert.equal(Math.sign(m.poses[m.order[0]].x), direction);
    }
    assert.deepEqual(m.order, [...previousOrder.slice(1), previousOrder[0]]);
    assert.equal(m.direction, -direction);
  }
});

test("the loop boundary preserves every card position and opacity", () => {
  const m = createSwipeMotion(6);
  advanceSwipe(m, 8999, 220, true);
  const before = swipeFrame(m).poses;
  advanceSwipe(m, 1, 220, true);
  assertSamePicture(before, m.poses);
});

test("hover freezes the exact frame and exit resumes on the first tick", () => {
  const m = createSwipeMotion(6);
  advanceSwipe(m, 3000, 220, true);
  const before = swipeFrame(m).poses;
  advanceSwipe(m, 10000, 220, false);
  assertSamePicture(before, m.poses);
  advanceSwipe(m, 16, 220, true);
  assert.notEqual(m.poses[0].x, before[0].x);
});

for (const time of [0, 3200, 5600, 6100, 8500])
  for (const direction of [-1, 1]) {
    test(`manual ${direction < 0 ? "pass" : "like"} at ${time}ms preserves layers and returns the chosen card underneath`, () => {
      const m = createSwipeMotion(6);
      advanceSwipe(m, time, 220, true);
      const selected = frontCard(m);
      const beforeDrag = swipeFrame(m).poses;
      assert.equal(beginSwipeDrag(m), true);
      assertSamePicture(beforeDrag, m.poses);
      moveSwipeDrag(m, direction * 75);
      const expected = [...m.order.slice(1), m.order[0]];
      assert.equal(triggerSwipe(m, direction, 220), true);
      assert.equal(triggerSwipe(m, direction, 220), false);
      for (let t = 0; t < 1900; t += 10) {
        const before = swipeFrame(m).poses;
        advanceSwipe(m, 10, 220, false);
        assertSafeLayers(before, m.poses);
      }
      assert.deepEqual(m.order, expected);
      assert.equal(m.order.at(-1), selected);
      assert.equal(m.mode, "auto");
      assert.equal(m.poses[selected].z, 1);
    });
  }

test("cancelled short drags settle without advancing the pile", () => {
  const m = createSwipeMotion(6);
  beginSwipeDrag(m);
  moveSwipeDrag(m, 20);
  cancelSwipeDrag(m);
  advanceSwipe(m, 450, 220, false);
  assert.deepEqual(m.order, [0, 1, 2, 3, 4, 5]);
  assert.equal(m.mode, "auto");
  assert.equal(m.poses[0].x, 0);
});

test("reduced motion completes a manual swipe without an animated interval", () => {
  const m = createSwipeMotion(6);
  triggerSwipe(m, -1, 220, true);
  assert.equal(m.mode, "auto");
  assert.deepEqual(m.order, [1, 2, 3, 4, 5, 0]);
});
