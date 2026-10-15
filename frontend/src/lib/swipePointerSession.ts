export type PointerSample = Event & {
  clientY: number;
  pointerId: number;
  clientX: number;
  buttons: number;
  getCoalescedEvents?: () => PointerSample[];
};

// One native event stream owns a drag until release, including outside the
// card's bounds. Capture loss alone is not a release or a cancellation.
export function trackSwipePointer({
  target, blurTarget, pointerId, originX, onMove, onEnd,
}: {
  target: EventTarget;
  blurTarget: EventTarget;
  pointerId: number;
  originX: number;
  onMove: (distance: number, sample: PointerSample) => void;
  onEnd: (interrupted: boolean) => void;
}) {
  let active = true;
  function stop() {
    active = false;
    target.removeEventListener("pointermove", move, true);
    target.removeEventListener("pointerup", up, true);
    target.removeEventListener("pointercancel", cancel, true);
    blurTarget.removeEventListener("blur", blur);
  }
  function finish(interrupted: boolean) {
    if (!active) return;
    stop();
    onEnd(interrupted);
  }
  function sample(event: PointerSample) {
    for (const point of event.getCoalescedEvents?.() ?? [])
      onMove(point.clientX - originX, point);
    onMove(event.clientX - originX, event);
  }
  function move(event: Event) {
    const point = event as PointerSample;
    if (point.pointerId !== pointerId) return;
    sample(point);
    // Recover a release outside the browser when the cursor returns.
    if (!(point.buttons & 1)) finish(false);
  }
  function up(event: Event) {
    const point = event as PointerSample;
    if (point.pointerId !== pointerId) return;
    sample(point);
    finish(false);
  }
  function cancel(event: Event) {
    if ((event as PointerSample).pointerId === pointerId) finish(true);
  }
  function blur() { finish(true); }
  target.addEventListener("pointermove", move, true);
  target.addEventListener("pointerup", up, true);
  target.addEventListener("pointercancel", cancel, true);
  blurTarget.addEventListener("blur", blur);
  return stop;
}
