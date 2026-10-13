// A single timeline owns transforms, opacity, and layers. No CSS/React race at loop boundaries.
export type CardPose = {
  x: number;
  y: number;
  angle: number;
  scale: number;
  opacity: number;
  z: number;
  badge: number;
  direction: number;
};
export type SwipeMotion = {
  order: number[];
  poses: CardPose[];
  from: CardPose[];
  mode: "auto" | "drag" | "out" | "settle";
  elapsed: number;
  duration: number;
  direction: number;
  selected: number;
  dragBase: CardPose;
  distance: number;
};
const CYCLE = 9000;
const HANDOFF = 5670;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const clone = (poses: CardPose[]) => poses.map((p) => ({ ...p }));
function rest(position: number, count: number): CardPose {
  return {
    x: position === 0 ? 0 : position === 1 ? 6 : -Math.min(position * 4, 12),
    y: position === 1 ? 5 : Math.min(position * 4, 12),
    angle: position === 0 ? 0 : position === 1 ? 4 : -6,
    scale: position === 0 ? 1 : position === 1 ? 0.99 : 0.97,
    opacity: 1,
    z: count - position,
    badge: 0,
    direction: 1,
  };
}
function blend(a: CardPose, b: CardPose, t: number): CardPose {
  const mix = (key: "x" | "y" | "angle" | "scale" | "opacity" | "badge") =>
    a[key] + (b[key] - a[key]) * t;
  return {
    x: mix("x"),
    y: mix("y"),
    angle: mix("angle"),
    scale: mix("scale"),
    opacity: mix("opacity"),
    badge: mix("badge"),
    z: a.z,
    direction: b.direction,
  };
}
function resting(order: number[]) {
  const poses: CardPose[] = [];
  order.forEach((id, position) => {
    poses[id] = rest(position, order.length);
  });
  return poses;
}
export function createSwipeMotion(count: number): SwipeMotion {
  const order = Array.from({ length: count }, (_, i) => i);
  const poses = resting(order);
  return {
    order,
    poses,
    from: clone(poses),
    mode: "auto",
    elapsed: 0,
    duration: 0,
    direction: 1,
    selected: 0,
    dragBase: { ...poses[0] },
    distance: 0,
  };
}
export function frontCard(m: SwipeMotion) {
  return m.mode === "auto" && m.elapsed >= HANDOFF ? m.order[1] : m.order[0];
}
export function swipeFrame(m: SwipeMotion) {
  return {
    poses: clone(m.poses),
    front: frontCard(m),
    mode: m.mode,
    direction: m.direction,
  };
}
function sampleAuto(m: SwipeMotion, width: number) {
  const t = m.elapsed;
  const count = m.order.length;
  const start = { ...rest(0, count), direction: m.direction };
  const tilt = {
    ...start,
    x: width * 0.35 * m.direction,
    y: -width * 0.1,
    angle: 14 * m.direction,
    badge: 1,
  };
  const away = {
    ...tilt,
    x: width * 0.95 * m.direction,
    y: -width * 0.165,
    angle: 22 * m.direction,
    opacity: 0,
    badge: 0,
  };
  const poses = resting(m.order);
  if (t < HANDOFF) {
    poses[m.order[0]] =
      t < 2160
        ? start
        : t < 3780
          ? blend(start, tilt, ease((t - 2160) / 1620))
          : t < 4500
            ? tilt
            : blend(tilt, away, ease((t - 4500) / 1170));
  } else {
    // The only layer change happens at zero opacity, never on a visible card.
    const progress = ease((t - HANDOFF) / 2250);
    poses[m.order[0]] = blend(
      { ...away, z: 1 },
      { ...rest(count - 1, count), direction: m.direction },
      progress,
    );
    m.order.slice(1).forEach((id, i) => {
      poses[id] = blend(
        { ...rest(i + 1, count), z: count - i },
        rest(i, count),
        progress,
      );
    });
  }
  m.poses = poses;
}
function normalizeVisibleOrder(m: SwipeMotion) {
  const front = frontCard(m);
  while (m.order[0] !== front) m.order = [...m.order.slice(1), m.order[0]];
  m.selected = front;
}
export function beginSwipeDrag(m: SwipeMotion) {
  if (m.mode !== "auto") return false;
  normalizeVisibleOrder(m);
  m.mode = "drag";
  m.dragBase = { ...m.poses[m.selected] };
  m.distance = 0;
  return true;
}
export function moveSwipeDrag(m: SwipeMotion, distance: number) {
  if (m.mode !== "drag") return;
  m.distance = distance;
  const base = m.dragBase;
  m.poses[m.selected] = {
    ...base,
    x: base.x + distance,
    angle: base.angle + distance / 16,
    badge: clamp(Math.abs(distance) / 55),
    direction: distance < 0 ? -1 : 1,
  };
}
function settle(m: SwipeMotion, duration: number) {
  m.mode = "settle";
  m.elapsed = 0;
  m.duration = duration;
  // Preserve the exact current picture while assigning the completed order.
  m.order.forEach((id, i) => {
    m.poses[id] = { ...m.poses[id], z: m.order.length - i };
  });
  m.from = clone(m.poses);
}
export function triggerSwipe(
  m: SwipeMotion,
  direction: number,
  width: number,
  reduced = false,
) {
  if (m.mode !== "auto" && m.mode !== "drag") return false;
  if (m.mode === "auto") normalizeVisibleOrder(m);
  m.direction = direction < 0 ? -1 : 1;
  m.mode = "out";
  m.elapsed = 0;
  m.duration = reduced ? 0 : 750;
  m.from = clone(m.poses);
  // Width is sampled by advanceSwipe; finish synchronously for reduced motion.
  if (reduced) advanceSwipe(m, 0, width, false);
  return true;
}
export function cancelSwipeDrag(m: SwipeMotion, reduced = false) {
  if (m.mode === "drag") settle(m, reduced ? 0 : 450);
}
export function advanceSwipe(
  m: SwipeMotion,
  delta: number,
  width: number,
  running: boolean,
) {
  if (m.mode === "drag" || (m.mode === "auto" && !running)) return false;
  m.elapsed += delta;
  if (m.mode === "auto") {
    while (m.elapsed >= CYCLE) {
      m.elapsed -= CYCLE;
      m.order = [...m.order.slice(1), m.order[0]];
      m.direction *= -1;
    }
    sampleAuto(m, width);
  } else if (m.mode === "out") {
    const source = m.from[m.selected];
    const target = {
      ...source,
      x: m.direction * Math.max(width * 1.15, Math.abs(source.x) + 60),
      y: -width * 0.165,
      angle: m.direction * 22,
      opacity: 0,
      badge: 0,
      direction: m.direction,
    };
    m.poses[m.selected] = blend(
      source,
      target,
      ease(m.duration ? m.elapsed / m.duration : 1),
    );
    if (m.elapsed >= m.duration) {
      m.order = [...m.order.slice(1), m.order[0]];
      const reduced = m.duration === 0;
      settle(m, reduced ? 0 : 1100);
      if (reduced) advanceSwipe(m, 0, width, false);
    }
  } else {
    const target = resting(m.order);
    const progress = ease(m.duration ? m.elapsed / m.duration : 1);
    m.poses = m.from.map((pose, id) => blend(pose, target[id], progress));
    if (m.elapsed >= m.duration) {
      m.poses = target;
      m.mode = "auto";
      m.elapsed = 0;
      m.direction *= -1;
    }
  }
  return true;
}
