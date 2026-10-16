import test from "node:test";
import assert from "node:assert/strict";
import { reactionPlacement } from "../src/lib/reactionPlacement.ts";
test("reaction follows left and right gestures when there is room", () => {
  const rect = { left: 400, right: 600, top: 200, height: 260 };
  const left = reactionPlacement(rect, -1, 1280, 720);
  const right = reactionPlacement(rect, 1, 1280, 720);
  assert.ok(left.left + left.width < rect.left);
  assert.ok(right.left > rect.right);
  assert.equal(left.side, "pass");
  assert.equal(right.side, "like");
});
test("reaction stays readable at either edge of a narrow viewport", () => {
  for (const viewport of [320, 390, 768]) {
    for (const direction of [-1, 1]) {
      const rect = { left: 18, right: viewport - 18, top: 40, height: 200 };
      const position = reactionPlacement(rect, direction, viewport, 568);
      assert.ok(position.left >= 16);
      assert.ok(position.left + position.width <= viewport - 16);
      assert.ok(position.top >= 16);
    }
  }
});


test("reaction stays above the bottom edge on short and scrolled screens", () => {
  for (const height of [320, 568, 720]) {
    for (const direction of [-1, 1]) {
      const rect = { left: 400, right: 600, top: height - 20, height: 260 };
      const position = reactionPlacement(rect, direction, 1280, height);
      assert.ok(position.top + 66 <= height - 16);
    }
  }
});
