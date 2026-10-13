import {
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent,
} from "react";
type Props = {
  children: ReactNode;
  disabled: boolean;
  onSwipe: (direction: "like" | "pass") => void;
  name: string;
  decision?: "like" | "pass" | null;
};
export default function SwipeSurface({
  children,
  disabled,
  onSwipe,
  name,
  decision = null,
}: Props) {
  const origin = useRef<{
    x: number;
    y: number;
    id: number;
    axis: "x" | "y" | null;
  } | null>(null);
  const [offset, setOffset] = useState(0);
  function start(e: PointerEvent<HTMLDivElement>) {
    if (
      disabled ||
      !e.isPrimary ||
      e.button !== 0 ||
      (e.target as HTMLElement).closest("a,button,input,select,textarea")
    )
      return;
    origin.current = {
      x: e.clientX,
      y: e.clientY,
      id: e.pointerId,
      axis: null,
    };
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const p = origin.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x,
      dy = e.clientY - p.y;
    if (!p.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 12) {
      p.axis = Math.abs(dx) > Math.abs(dy) * 1.3 ? "x" : "y";
      if (p.axis === "x") e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (p.axis === "x") {
      e.preventDefault();
      setOffset(dx);
    }
  }
  function end(e: PointerEvent<HTMLDivElement>, cancelled = false) {
    const p = origin.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    origin.current = null;
    setOffset(0);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (!cancelled && !disabled && p.axis === "x" && Math.abs(dx) >= 105)
      onSwipe(dx > 0 ? "like" : "pass");
  }
  return (
    <div
      className={`swipe-surface ${offset ? "is-dragging" : ""} ${decision ? "is-leaving" : ""}`}
      tabIndex={disabled ? -1 : 0}
      role="group"
      aria-label={
        disabled
          ? `${name}'s profile`
          : `Swipe ${name}'s profile. Use left arrow to pass or right arrow to like.`
      }
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={(e) => end(e)}
      onPointerCancel={(e) => end(e, true)}
      onLostPointerCapture={() => {
        origin.current = null;
        setOffset(0);
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || disabled || e.repeat) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          onSwipe(e.key === "ArrowRight" ? "like" : "pass");
        }
      }}
      style={
        {
          "--swipe-x": decision
            ? decision === "like"
              ? "115%"
              : "-115%"
            : `${offset}px`,
          "--swipe-rotation": decision
            ? decision === "like"
              ? "10deg"
              : "-10deg"
            : `${offset / 28}deg`,
          opacity: decision ? 0 : 1,
        } as CSSProperties
      }
    >
      {Math.abs(offset) > 30 && (
        <span
          className={`swipe-feedback ${offset > 0 ? "is-like" : "is-pass"}`}
          aria-hidden="true"
        >
          {offset > 0 ? "LIKE" : "PASS"}
        </span>
      )}
      {children}
    </div>
  );
}
