import { createPortal } from "react-dom";
import { landingReactionPlacement } from "../lib/reactionPlacement";
import { Heart, MoveDown, MoveHorizontal, X } from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import {
  advanceSwipe,
  beginSwipeDrag,
  createSwipeMotion,
  frontCard,
  moveSwipeDrag,
  releaseSwipeDrag,
  swipeFrame,
  triggerSwipe,
} from "../lib/swipePreviewMotion";

import { trackSwipePointer } from "../lib/swipePointerSession";

const people = [
  { name: "Mina", initial: "m", habit: "early mornings", tone: "peach" },
  { name: "Alex", initial: "a", habit: "quiet evenings", tone: "sage" },
  { name: "Jules", initial: "j", habit: "shared dinners", tone: "rose" },
  { name: "Kai", initial: "k", habit: "weekend adventures", tone: "sage" },
  { name: "Sofia", initial: "s", habit: "a tidy space", tone: "peach" },
  { name: "Noah", initial: "n", habit: "coffee & good company", tone: "rose" },
];

const swipeReactions = {
  like: ["the roomie of your life?", "a meet-cute, but for rent.", "the shared-fridge era?", "the perfect one?", "your future coffee buddy?", "a little roomie chemistry.", "same playlist, maybe?", "this could feel like home.", "one shared kitchen closer.", "a good morning person?"],
  pass: ["good vibes, wrong lease.", "not quite in tune.", "the search continues…", "different sleep schedules?", "someone else’s perfect roomie.", "keeping a little room open.", "a different kind of cozy.", "not our chapter.", "another door to try.", "the right fit takes a minute."],
};

// Hover pauses in place; leaving resumes on the next frame, without a cooldown.
function usePreviewIdle(paused: boolean) {
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  return {
    running:
      !paused && !hovered && !held && !keyboard && !reducedMotion && visible,
    enter: (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(true);
    },
    leave: () => {
      setHovered(false);
      setKeyboard(false);
    },
    hold: () => {
      setHeld(true);
      setKeyboard(false);
    },
    release: () => setHeld(false),
    focus: () => setKeyboard(true),
    blur: () => setKeyboard(false),
  };
}

function PreviewCard({ person }: { person: (typeof people)[number] }) {
  return (
    <>
      <div className={`demo-portrait demo-portrait--${person.tone}`}>
        <span>{person.initial}</span>
        <small>sample roomie</small>
      </div>
      <div className="demo-card-copy">
        <strong>{person.name}</strong>
        <span>{person.habit}</span>
      </div>
    </>
  );
}

export function SwipePreview({ paused }: { paused: boolean }) {
  const idle = usePreviewIdle(paused);
  const deckRef = useRef<HTMLDivElement>(null);
  const motion = useRef(createSwipeMotion(people.length));
  const [frame, setFrame] = useState(() =>
    swipeFrame(createSwipeMotion(people.length)),
  );
  const [announcement, setAnnouncement] = useState("");
  const [reaction, setReaction] = useState<({ id: number; text: string } & ReturnType<typeof landingReactionPlacement>) | null>(null);
  const reactionId = useRef(0);
  const lastReaction = useRef("");
  useEffect(() => {
    if (!reaction) return;
    const clear = () => setReaction(null);
    const timer = window.setTimeout(clear, 3300);
    window.addEventListener("resize", clear);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", clear);
      window.removeEventListener("scroll", clear);
    };
  }, [reaction]);

  function showReaction(direction: number) {
    const options = (direction > 0 ? swipeReactions.like : swipeReactions.pass).filter(text => text !== lastReaction.current);
    const rect = deckRef.current?.getBoundingClientRect();
    if (!rect) return;
    const obstacles = [...document.querySelectorAll(".minimal-center, .landing-scroll-demo")].map(element => element.getBoundingClientRect());
    const text = options[Math.floor(Math.random() * options.length)];
    lastReaction.current = text;
    setReaction({
      id: ++reactionId.current, text,
      ...landingReactionPlacement(rect, direction, document.documentElement.clientWidth, window.innerHeight, obstacles),
    });
  }
  const stopPointer = useRef<(() => void) | null>(null);
  useEffect(() => () => stopPointer.current?.(), []);
  const width = () => deckRef.current?.clientWidth ?? 220;
  const reduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const publish = () => setFrame(swipeFrame(motion.current));
  const tick = useEffectEvent((delta: number) => {
    if (advanceSwipe(motion.current, delta, width(), idle.running)) publish();
  });
  useEffect(() => {
    let animation = 0;
    let previous = 0;
    const animate = (now: number) => {
      if (previous) tick(Math.min(now - previous, 50));
      previous = now;
      animation = requestAnimationFrame(animate);
    };
    animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  function swipe(direction: number) {
    const person = people[frontCard(motion.current)];
    if (triggerSwipe(motion.current, direction, width(), reduced())) {
      setAnnouncement(
        `${direction > 0 ? "Liked" : "Passed"} ${person.name}. Moving this sample to the bottom.`,
      );
      showReaction(direction);
      publish();
    }
  }
  return (
    <div
      className="landing-swipe-demo"
      onPointerEnter={idle.enter}
      onPointerLeave={idle.leave}
    >
      <div
        ref={deckRef}
        className={`demo-deck demo-deck--interactive ${frame.mode === "drag" ? "is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`Sample profile: ${people[frame.front].name}. Swipe left to pass or right to like.`}
        aria-describedby="swipe-preview-help"
        data-running={idle.running}
        data-phase={frame.mode}
        data-direction={frame.direction}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) idle.focus();
        }}
        onBlur={idle.blur}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            event.button !== 0 ||
            !beginSwipeDrag(motion.current)
          )
            return;
          event.preventDefault();
          stopPointer.current?.();
          const deck = event.currentTarget;
          const pointerId = event.pointerId;
          const person = people[frontCard(motion.current)];
          // Listen at the document, not just the animated card. Losing capture
          // must not cancel a swipe when the cursor leaves the stack.
          stopPointer.current = trackSwipePointer({
            target: document,
            blurTarget: window,
            pointerId,
            originX: event.clientX,
            onMove: (distance) => {
              moveSwipeDrag(motion.current, distance);
              publish();
            },
            onEnd: (interrupted) => {
              stopPointer.current = null;
              const direction = releaseSwipeDrag(
                motion.current, width(), reduced(), !interrupted,
              );
              if (direction !== null) {
                setAnnouncement(`${direction > 0 ? "Liked" : "Passed"} ${person.name}. Moving this sample to the bottom.`);
                showReaction(direction);
              }
              publish();
              idle.release();
              if (deck.hasPointerCapture(pointerId)) deck.releasePointerCapture(pointerId);
            },
          });
          idle.hold();
          publish();
          event.currentTarget.setPointerCapture(pointerId);
        }}
        onDragStart={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (["Enter", " ", "Delete", "Backspace"].includes(event.key) && !event.repeat) {
            event.preventDefault();
            idle.focus();
            swipe(["Delete", "Backspace"].includes(event.key) ? -1 : 1);
          }
        }}
      >
        {people.map((person, id) => {
          const pose = frame.poses[id];
          return (
            <div
              key={person.name}
              className="demo-card demo-card--stacked"
              aria-hidden={id !== frame.front ? true : undefined}
              data-card={person.name}
              style={{
                zIndex: pose.z,
                opacity: pose.opacity,
                transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.angle}deg) scale(${pose.scale})`,
              }}
            >
              <PreviewCard person={person} />
              <div
                className="demo-swipe-feedback"
                aria-hidden="true"
                style={{ opacity: pose.badge }}
              >
                {pose.direction > 0 ? (
                  <Heart size={20} fill="currentColor" />
                ) : (
                  <X size={20} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <span className="demo-caption">
        <MoveHorizontal size={15} /> try a swipe.
      </span>
      {reaction && createPortal(
        <p key={reaction.id} className={`demo-swipe-note demo-swipe-note--${reaction.side}`}
          style={{ left: reaction.left, top: reaction.top, width: reaction.width, rotate: `${reaction.angle}deg` }}
          aria-hidden="true">{reaction.text}</p>,
        document.body,
      )}
      <span id="swipe-preview-help" className="sr-only">
        Interactive sample only. Drag left to pass or right to like.
        Press Enter to like or Delete to pass. Cards return to the bottom; no
        real likes are sent.
      </span>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}

export function ScrollPreview({ paused }: { paused: boolean }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef<HTMLDivElement>(null);
  const idle = usePreviewIdle(paused);

  useEffect(() => {
    const viewport = windowRef.current;
    const cycle = cycleRef.current;
    if (!viewport || !cycle) return;
    viewport.scrollTop = cycle.offsetHeight;
  }, []);

  useEffect(() => {
    if (!idle.running) return;
    let frame = 0;
    let previous = 0;
    let position = windowRef.current?.scrollTop ?? 0;
    function tick(now: number) {
      const viewport = windowRef.current;
      const height = cycleRef.current?.offsetHeight ?? 0;
      if (viewport && previous && height) {
        position += Math.min(now - previous, 50) * 0.018;
        if (position >= height * 2) position -= height;
        viewport.scrollTop = position;
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [idle.running]);

  return (
    <div
      className="landing-scroll-demo"
      onPointerEnter={idle.enter}
      onPointerLeave={idle.leave}
    >
      <div
        className="demo-feed-window demo-feed-window--interactive"
        ref={windowRef}
        tabIndex={0}
        role="region"
        aria-label="Scrollable sample roommate profiles"
        onPointerDown={(event) => {
          idle.hold();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={idle.release}
        onPointerCancel={idle.release}
        onLostPointerCapture={idle.release}
        data-running={idle.running}
        onKeyDown={idle.focus}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) idle.focus();
        }}
        onBlur={idle.blur}
        onScroll={() => {
          const viewport = windowRef.current;
          const height = cycleRef.current?.offsetHeight ?? 0;
          if (!viewport || !height) return;
          // Identical cycles preserve the visible content while wrapping either way.
          if (viewport.scrollTop >= height * 2) viewport.scrollTop -= height;
          else if (viewport.scrollTop < 1) viewport.scrollTop += height;
        }}
      >
        {[0, 1, 2].map((copy) => (
          <div
            className="demo-feed-cycle"
            key={copy}
            ref={copy === 0 ? cycleRef : undefined}
            aria-hidden={copy !== 1 ? true : undefined}
          >
            {people.map((person) => (
              <div className="demo-feed-person" key={person.name}>
                <span
                  className={`demo-feed-avatar demo-feed-avatar--${person.tone}`}
                  aria-hidden="true"
                >
                  {person.initial}
                </span>
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.habit}</span>
                </div>
                <Heart size={12} aria-hidden="true" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="demo-caption">
        <MoveDown size={14} /> scroll to explore.
      </span>
    </div>
  );
}
