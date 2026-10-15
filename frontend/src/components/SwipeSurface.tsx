import { useEffect, useEffectEvent, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { createProfileDrag, moveProfileDrag, profileSwipeDecision, springStep } from "../lib/profileSwipe";
import { trackSwipePointer } from "../lib/swipePointerSession";
type Props = {
  children: ReactNode;
  disabled: boolean;
  onSwipe: (direction: "like" | "pass") => void;
  name: string;
  decision?: "like" | "pass" | null;
  onExitComplete?: () => void;
};
export default function SwipeSurface({ children, disabled, onSwipe, name, decision = null, onExitComplete }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const pose = useRef({ x: 0, velocity: 0, opacity: 1 });
  const animation = useRef(0);
  const stopPointer = useRef<(() => void) | null>(null);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "pass" | null>(null);
  const complete = () => onExitComplete?.();
  function draw() {
    if (!surface.current) return;
    const p = pose.current;
    surface.current.style.transform = `translateX(${p.x}px) rotate(${Math.max(-12, Math.min(12, p.x / 28))}deg)`;
    surface.current.style.opacity = String(p.opacity);
  }
  function animate(target: number, leaving = false) {
    cancelAnimationFrame(animation.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pose.current = { x: 0, velocity: 0, opacity: leaving ? 0 : 1 };
      draw();
      if (leaving) animation.current = requestAnimationFrame(() => complete());
      return;
    }
    let previous = 0;
    const fromOpacity = pose.current.opacity;
    let elapsed = 0;
    function tick(now: number) {
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
      previous = now; elapsed += dt;
      const next = springStep(pose.current.x, pose.current.velocity, target, dt);
      pose.current = { ...next, opacity: leaving ? Math.max(0, fromOpacity * (1 - elapsed / .36)) : 1 };
      draw();
      if (Math.abs(next.x - target) < .5 && Math.abs(next.velocity) < 5) {
        pose.current = { x: target, velocity: 0, opacity: leaving ? 0 : 1 };
        draw();
        if (leaving) complete();
      } else animation.current = requestAnimationFrame(tick);
    }
    animation.current = requestAnimationFrame(tick);
  }
  const changeDecision = useEffectEvent(() => {
    const width = surface.current?.offsetWidth ?? 600;
    animate(decision ? (decision === "like" ? 1 : -1) * Math.max(width * 1.1, Math.abs(pose.current.x) + 80) : 0, !!decision);
  });
  useEffect(() => { changeDecision(); }, [decision]);
  useEffect(() => () => { cancelAnimationFrame(animation.current); stopPointer.current?.(); }, []);

  function start(event: PointerEvent<HTMLDivElement>) {
    if (disabled || !event.isPrimary || event.button !== 0 ||
      (event.target as HTMLElement).closest("a,button,input,select,textarea")) return;
    if (event.pointerType === "mouse") event.preventDefault();
    cancelAnimationFrame(animation.current);
    stopPointer.current?.();
    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const drag = createProfileDrag({ x: event.clientX, y: event.clientY, time: event.timeStamp }, pose.current.x);
    setDragging(true);
    stopPointer.current = trackSwipePointer({
      target: document, blurTarget: window, pointerId, originX: event.clientX,
      onMove: (_, point) => {
        moveProfileDrag(drag, { x: point.clientX, y: point.clientY, time: point.timeStamp });
        if (drag.axis !== "x") return;
        if (point.cancelable) point.preventDefault();
        pose.current = { x: drag.x, velocity: drag.velocity, opacity: 1 };
        setFeedback(drag.x >= 0 ? "like" : "pass");
        draw();
      },
      onEnd: interrupted => {
        stopPointer.current = null;
        setDragging(false);
        if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
        const action = interrupted ? null : profileSwipeDecision(drag);
        if (action) onSwipe(action);
        else { setFeedback(null); animate(0); }
      },
    });
    element.setPointerCapture(pointerId);
  }
  return (
    <div ref={surface}
      className={`swipe-surface ${dragging ? "is-dragging" : ""} ${decision ? "is-leaving" : ""}`}
      style={{ transition: "none" }}
      tabIndex={disabled ? -1 : 0} role="group"
      aria-label={disabled ? `${name}'s profile` : `Swipe ${name}'s profile. Use left arrow to pass or right arrow to like.`}
      onPointerDown={start} onDragStart={event => event.preventDefault()}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || disabled || event.repeat) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); onSwipe(event.key === "ArrowRight" ? "like" : "pass");
        }
      }}>
      {(feedback || decision) && <span className={`swipe-feedback ${(decision ?? feedback) === "like" ? "is-like" : "is-pass"}`} aria-hidden="true">
        {(decision ?? feedback) === "like" ? "LIKE" : "PASS"}
      </span>}
      {children}
    </div>
  );
}
