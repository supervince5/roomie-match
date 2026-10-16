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

export function landingReactionPlacement(rect: Bounds, direction: number, viewportWidth: number, viewportHeight: number, obstacles: Bounds[] = [], random = Math.random) {
  const placement = reactionPlacement(rect, direction, viewportWidth, viewportHeight, random);
  const { width, angle } = placement;
  const radians = Math.abs(angle) * Math.PI / 180;
  const extraX = Math.max(0, (width * Math.cos(radians) + 66 * Math.sin(radians) - width) / 2);
  const extraY = Math.max(0, (width * Math.sin(radians) + 66 * Math.cos(radians) - 66) / 2);
  const gap = 12;
  let left = direction < 0 ? rect.left - width - gap - extraX : rect.right + gap + extraX;
  let top = placement.top;
  const overlaps = (obstacle: Bounds) => left - extraX < obstacle.right + gap && left + width + extraX > obstacle.left - gap && top - extraY < obstacle.top + obstacle.height + gap && top + 66 + extraY > obstacle.top - gap;
  const noSideRoom = left - extraX < 16 || left + width + extraX > viewportWidth - 16;
  if (!noSideRoom) {
    for (const obstacle of [...obstacles].sort((a, b) => a.top - b.top)) {
      if (overlaps(obstacle)) top = obstacle.top + obstacle.height + gap + extraY;
    }
  }
  if (noSideRoom || top > rect.top + rect.height) {
    // The narrow composition has another preview immediately beside this one.
    // Use the lower corner, beside the lower corner, instead of crossing either card.
    left = direction < 0 ? rect.left - width * .15 : rect.right - width * .85;
    left = Math.max(16 + extraX, Math.min(left, viewportWidth - width - 16 - extraX));
    top = rect.top + rect.height + 8 + extraY;
    for (const obstacle of [...obstacles].sort((a, b) => a.top - b.top)) {
      if (overlaps(obstacle)) top = obstacle.top + obstacle.height + gap + extraY;
    }
  }
  // Never trade legibility for placement. Keep the accessible swipe announcement
  // when the viewport has no clear space for decorative ink.
  const visible = left - extraX >= 16 && left + width + extraX <= viewportWidth - 16
    && top - extraY >= 16 && top + 66 + extraY <= viewportHeight - 16
    && !obstacles.some(overlaps);
  return { ...placement, left, top, visible };

}
