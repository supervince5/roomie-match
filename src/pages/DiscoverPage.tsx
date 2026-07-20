import { Heart, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import ProfileCard from "../components/ProfileCard";
import { mockProfiles } from "../data/mockProfiles";

type SwipeAction = "like" | "pass";

function DiscoverPage() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [animation, setAnimation] = useState<SwipeAction | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);

  const currentProfile = mockProfiles[currentProfileIndex];
  const profilesRemaining = mockProfiles.length - currentProfileIndex;

  function handleDecision(action: SwipeAction) {
    if (!currentProfile || animation !== null) {
      return;
    }

    setAnimation(action);

    if (action === "like") {
      setLastDecision(`You liked ${currentProfile.name}.`);
    } else {
      setLastDecision(`You passed on ${currentProfile.name}.`);
    }

    window.setTimeout(() => {
      setCurrentProfileIndex((previousIndex) => previousIndex + 1);
      setAnimation(null);
    }, 260);
  }

  function restartProfiles() {
    setCurrentProfileIndex(0);
    setAnimation(null);
    setLastDecision(null);
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Roomie Match</p>
          <h1>Discover</h1>
        </div>

        {currentProfile && (
          <div className="profile-count">
            {profilesRemaining} remaining
          </div>
        )}
      </header>

      {lastDecision && (
        <p className="decision-message" role="status">
          {lastDecision}
        </p>
      )}

      {currentProfile ? (
        <>
          <ProfileCard
            profile={currentProfile}
            animation={animation}
          />

          <div className="swipe-controls">
            <button
              className="swipe-button swipe-button--pass"
              type="button"
              aria-label={`Pass on ${currentProfile.name}`}
              disabled={animation !== null}
              onClick={() => handleDecision("pass")}
            >
              <X size={35} strokeWidth={2.7} />
            </button>

            <button
              className="swipe-button swipe-button--like"
              type="button"
              aria-label={`Like ${currentProfile.name}`}
              disabled={animation !== null}
              onClick={() => handleDecision("like")}
            >
              <Heart size={34} strokeWidth={2.6} />
            </button>
          </div>

          <p className="swipe-instructions">
            Use the buttons for now. Drag-to-swipe will be added after the
            basic system works.
          </p>
        </>
      ) : (
        <section className="empty-state">
          <div className="empty-state__icon">
            <Heart size={40} />
          </div>

          <h2>You reached the end.</h2>

          <p>
            You have reviewed every sample profile in today’s deck.
          </p>

          <button
            className="secondary-button"
            type="button"
            onClick={restartProfiles}
          >
            <RotateCcw size={19} />
            Review again
          </button>
        </section>
      )}
    </main>
  );
}

export default DiscoverPage;