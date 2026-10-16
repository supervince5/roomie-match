import test from "node:test";
import assert from "node:assert/strict";
import { reactionPlacement, landingReactionPlacement } from "../src/lib/reactionPlacement.ts";
test("reaction stays inside the card with a modest bias toward the swipe", () => {
  const rect = { left: 200, right: 1000, top: 100, height: 500 };
  const left = reactionPlacement(rect, -1, 1280, 900);
  const right = reactionPlacement(rect, 1, 1280, 900);
  assert.ok(left.left >= rect.left && right.left + right.width <= rect.right);
  assert.ok(left.left + left.width / 2 > 400 && left.left + left.width / 2 < 600);
  assert.ok(right.left + right.width / 2 > 600 && right.left + right.width / 2 < 800);
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

test("reaction varies within the middle-to-lower card area", () => {
  const rect = { left: 400, right: 680, top: 200, height: 400 };
  for (const direction of [-1, 1]) {
    const a = reactionPlacement(rect, direction, 1280, 800, () => 0);
    const b = reactionPlacement(rect, direction, 1280, 800, () => 1);
    assert.ok(a.top >= rect.top + rect.height * .55);
    assert.ok(b.top >= rect.top + rect.height * .55);
    assert.ok(a.top <= rect.top + rect.height * .75);
    assert.ok(b.top <= rect.top + rect.height * .75);
    assert.notEqual(a.top, b.top);
    assert.notEqual(a.left, b.left);
    assert.notEqual(a.angle, b.angle);
    assert.ok(Math.abs(a.angle) >= 7 && Math.abs(a.angle) <= 14);
    assert.ok(Math.abs(b.angle) >= 7 && Math.abs(b.angle) <= 14);
  }
});

test("tilted reactions keep their full bounds inside small viewports", () => {
  for (const viewport of [320, 390, 768]) {
    for (const direction of [-1, 1]) {
      for (const random of [0, 0.5, 1]) {
        const rect = { left: 18, right: viewport - 18, top: 40, height: 200 };
        const p = reactionPlacement(rect, direction, viewport, 320, () => random);
        const angle = Math.abs(p.angle) * Math.PI / 180;
        const rotatedWidth = p.width * Math.cos(angle) + 66 * Math.sin(angle);
        const rotatedHeight = p.width * Math.sin(angle) + 66 * Math.cos(angle);
        assert.ok(p.left + p.width / 2 - rotatedWidth / 2 >= 16);
        assert.ok(p.left + p.width / 2 + rotatedWidth / 2 <= viewport - 16);
        assert.ok(p.top + 33 - rotatedHeight / 2 >= 16);
        assert.ok(p.top + 33 + rotatedHeight / 2 <= 304);
      }
    }
  }
});

test("landing reaction clears the stack and stays nearby when the side is open", () => {
  const card = { left: 240, right: 440, top: 200, height: 260 };
  for (const direction of [-1, 1]) {
    const p = landingReactionPlacement(card, direction, 1200, 900, [], () => .5);
    const angle = Math.abs(p.angle) * Math.PI / 180;
    const extra = (p.width * Math.cos(angle) + 66 * Math.sin(angle) - p.width) / 2;
    if (direction < 0) {
      assert.ok(p.left + p.width + extra <= card.left - 12);
      assert.ok(card.left - (p.left + p.width + extra) <= 24);
    } else {
      assert.ok(p.left - extra >= card.right + 12);
      assert.ok(p.left - extra - card.right <= 24);
    }
  }
});
test("crowded landing places the reaction below cards without hitting the wordmark", () => {
  const card = { left: 208, right: 415, top: 433, height: 218 };
  const obstacles = [
    { left: 140, right: 740, top: 212, height: 193 },
    { left: 466, right: 678, top: 437, height: 242 },
  ];
  const p = landingReactionPlacement(card, 1, 880, 900, obstacles, () => .5);
  assert.ok(p.top >= 695);
  assert.ok(p.left + p.width / 2 > (card.left + card.right) / 2);
  assert.ok(p.top + 66 < 884);
});
