type Bounds = { left: number; right: number; top: number; height: number };
/** Keep reaction ink on the gesture's side without pushing it off small screens. */
export function reactionPlacement(rect: Bounds, direction: number, viewportWidth: number, viewportHeight: number) {
  const width = Math.min(164, viewportWidth - 32);
  const gap = 18;
  const side = direction < 0 ? "pass" : "like";
  const desired = direction < 0 ? rect.left - width - gap : rect.right + gap;
  const fits = desired >= 16 && desired + width <= viewportWidth - 16;
  // If the outer gutter is too small, sit just above that edge of the card.
  const edge = direction < 0 ? rect.left - width / 2 : rect.right - width / 2;
  return {
    side,
    width,
    left: Math.max(16, Math.min(fits ? desired : edge, viewportWidth - width - 16)),
    // Reserve three lines of reaction text plus the lower gutter.
    top: Math.max(16, Math.min(fits ? rect.top + rect.height * 0.38 : rect.top - 62, viewportHeight - 82)),
  };
}

