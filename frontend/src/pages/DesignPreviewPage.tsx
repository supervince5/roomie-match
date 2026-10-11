import { Heart, RotateCcw, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import Brand from "../components/Brand";
import ProfileCard from "../components/ProfileCard";
import SwipeSurface from "../components/SwipeSurface";
import { compareProfiles } from "../lib/compatibility";
import type { Profile } from "../types/profile";
const base: Profile = {
  id: "preview-1",
  name: "Jamie",
  age: 20,
  schoolId: 1,
  school: "Sample university",
  major: "Architecture",
  classYear: 2028,
  budget: { min: 650, max: 950 },
  moveInDate: "2027-08-01",
  sleepSchedule: "early_bird",
  cleanliness: "clean",
  smoking: false,
  pets: false,
  tags: ["Creative", "Cooking", "Hiking"],
  bio: "I love a slow morning, a shared dinner, and a home where everyone can recharge. Looking for someone who appreciates a tidy kitchen and the occasional weekend adventure.",
  prompt: {
    question: "You should room with me if...",
    answer:
      "You think good food and a little consideration make a house a home.",
  },
};
const profiles = [
  base,
  {
    ...base,
    id: "preview-2",
    name: "Alex",
    major: "Computer Science",
    sleepSchedule: "night_owl" as const,
  },
  {
    ...base,
    id: "preview-3",
    name: "Casey",
    major: "Biology",
    budget: { min: 1100, max: 1400 },
  },
];
export default function DesignPreviewPage() {
  const [index, setIndex] = useState(0),
    [notice, setNotice] = useState(""),
    [animation, setAnimation] = useState<"like" | "pass" | null>(null);
  const busy = useRef(false);
  const person = profiles[index];
  async function decide(direction: "like" | "pass") {
    if (!person || busy.current) return;
    busy.current = true;
    setAnimation(direction);
    await new Promise((resolve) => setTimeout(resolve, 280));
    setNotice(
      `${direction === "like" ? "Liked" : "Passed on"} ${person.name}. Preview only; nothing was saved.`,
    );
    setIndex((i) => i + 1);
    setAnimation(null);
    busy.current = false;
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <span className="eyebrow">DESIGN & INTERACTION PREVIEW</span>
        <Link className="text-link" to="/discover">
          Back to your account
        </Link>
      </header>
      <main className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">SAMPLE PROFILES · LOCAL PREVIEW ONLY</p>
            <h1>Try your new roomie experience.</h1>
            <p className="page-subtitle">
              Drag a card horizontally, scroll vertically, or focus it and use
              the arrow keys. No account data changes.
            </p>
          </div>
          <button
            className="secondary-button"
            disabled={animation !== null}
            onClick={() => {
              setIndex(0);
              setNotice("");
            }}
          >
            <RotateCcw size={15} /> Reset preview
          </button>
        </header>
        <p role="status">{notice}</p>
        {person ? (
          <>
            <SwipeSurface
              name={person.name}
              disabled={animation !== null}
              onSwipe={decide}
            >
              <ProfileCard profile={person} animation={animation} />
            </SwipeSurface>
            <section className="compatibility-panel">
              <p className="eyebrow">ILLUSTRATIVE COMPATIBILITY</p>
              <div className="fit-list">
                {compareProfiles(base, person).map((f) => (
                  <div className="fit-item" key={f.label}>
                    <div>
                      <strong>{f.label}</strong>
                      <p>{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <div className="swipe-controls">
              <button
                className="swipe-button swipe-button--pass"
                disabled={animation !== null}
                onClick={() => decide("pass")}
                aria-label={`Pass on ${person.name}`}
              >
                <X />
                <span>Pass</span>
              </button>
              <span className="swipe-hint">Your next chapter starts here</span>
              <button
                className="swipe-button swipe-button--like"
                disabled={animation !== null}
                onClick={() => decide("like")}
                aria-label={`Like ${person.name}`}
              >
                <Heart />
                <span>Like</span>
              </button>
            </div>
          </>
        ) : (
          <section className="empty-state">
            <h2>That’s the whole preview.</h2>
            <p>Reset to try the gestures again.</p>
          </section>
        )}
      </main>
    </div>
  );
}
