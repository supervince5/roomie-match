type Bounds = { left: number; right: number; top: number; height: number };
/** Sample once per gesture, then keep the ink still as the card leaves. */
export function reactionPlacement(rect: Bounds, direction: number, viewportWidth: number, viewportHeight: number, random = Math.random) {
  const width = Math.min(164, viewportWidth - 64);
  const side = direction < 0 ? "pass" : "like";
  const offsetX = (random() - .5) * 16;
  const offsetY = (random() - .5) * 24;
  const tilt = random();
  const angle = tilt < .5 ? -14 + tilt * 14 : 7 + (tilt - .5) * 14;
  // Keep the reaction inside the card, gently biased toward the swipe.
  const cardWidth = rect.right - rect.left;
  const edge = rect.left + cardWidth * (direction < 0 ? .35 : .65) - width / 2 + offsetX;
  // Leave room for the rotated corners of up to three lines, not just the box.
  const radians = Math.abs(angle) * Math.PI / 180;
  const insetX = 16 + Math.max(0, (width * Math.cos(radians) + 66 * Math.sin(radians) - width) / 2);
  const insetY = 16 + Math.max(0, (width * Math.sin(radians) + 66 * Math.cos(radians) - 66) / 2);
  return {
    side, width, angle,
    left: Math.max(insetX, Math.min(edge, viewportWidth - width - insetX)),
    top: Math.max(insetY, Math.min(rect.top + rect.height * .64 + offsetY, viewportHeight - 66 - insetY)),
  };
}
