export type DragPoint = { x: number; y: number; time: number };
export function createProfileDrag(point: DragPoint, base = 0) {
  return { start: point, last: point, lastMotionTime: point.time, base, x: base, velocity: 0, axis: null as "x" | "y" | null };
}
export type ProfileDrag = ReturnType<typeof createProfileDrag>;
export function moveProfileDrag(drag: ProfileDrag, point: DragPoint) {
  const dx = point.x - drag.start.x, dy = point.y - drag.start.y;
  if (!drag.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 8)
    drag.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
  const elapsed = point.time - drag.last.time;
  if (elapsed > 0 && point.x !== drag.last.x) {
    const velocity = (point.x - drag.last.x) / elapsed * 1000;
    drag.velocity = elapsed > 100 ? 0 : Math.max(-2500, Math.min(2500, velocity));
    drag.lastMotionTime = point.time;
  }
  if (point.time - drag.lastMotionTime > 80) drag.velocity = 0;
  drag.last = point;
  if (drag.axis === "x") drag.x = drag.base + dx;
  return drag.x;
}
export function profileSwipeDecision(drag: ProfileDrag) {
  if (drag.axis !== "x") return null;
  const distance = drag.last.x - drag.start.x;
  // Deliberate distance or a small, quick flick. Vertical scrolling never votes.
  if (Math.abs(distance) >= 48 ||
    (Math.abs(distance) >= 12 && Math.abs(distance + drag.velocity * .14) >= 48))
    return distance > 0 ? "like" as const : "pass" as const;
  return null;
}
export function springStep(x: number, velocity: number, target: number, seconds: number) {
  // Analytic critically damped spring: frame-rate independent, no bounce.
  const omega = 18;
  const displacement = x - target;
  const c = velocity + omega * displacement;
  const decay = Math.exp(-omega * seconds);
  return { x: target + (displacement + c * seconds) * decay,
    velocity: (velocity - omega * c * seconds) * decay };
}
