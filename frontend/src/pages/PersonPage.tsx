import ContentArrival from "../components/ContentArrival";
import CompatibilityPanel from "../components/CompatibilityPanel";
import SwipeSurface from "../components/SwipeSurface";
import { ArrowLeft, Heart, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormErrors from "../components/FormErrors";
import ProfileCard from "../components/ProfileCard";
import { swipeOn, undoSwipe, type SwipeDirection } from "../lib/swipes";
import { useApi } from "../lib/useApi";
import type { Profile } from "../types/profile";

type PersonResponse = {
  profile: Profile;
  swipe: SwipeDirection | null;
  matched: boolean;
};

// Someone's full profile, opened from Search or History, with like/pass right here.
function PersonPage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, setData } = useApi<PersonResponse>(
    "/people/" + encodeURIComponent(userId),
  );
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (caught) {
      setActionError(caught);
    } finally {
      setBusy(false);
    }
  }

  function swipe(direction: SwipeDirection) {
    act(async () => {
      const result = await swipeOn(userId, direction);
      if (result.matched) {
        navigate("/matches/" + encodeURIComponent(userId), { viewTransition: true }); // straight to their match page (with Instagram)
        return;
      }
      if (data) setData({ ...data, swipe: direction });
    });
  }

  function undo() {
    act(async () => {
      await undoSwipe(userId);
      if (data) setData({ ...data, swipe: null, matched: false });
    });
  }

  let content;
  if (loading) {
    content = <p className="status-message">Loading profile...</p>;
  } else if (error || !data) {
    content = <FormErrors error={error} />;
  } else {
    const person = data.profile;
    content = (
      <>
        <SwipeSurface
          key={person.id}
          disabled={busy || data.swipe !== null || data.matched}
          name={person.name}
          onSwipe={swipe}
        >
          <ProfileCard profile={person} />
        </SwipeSurface>
        <CompatibilityPanel profile={person} />
        <FormErrors error={actionError} />

        {data.matched ? (
          <Link viewTransition
            className="primary-button person-page__action"
            to={`/matches/${encodeURIComponent(person.id)}`}
          >
            you matched! see <span className="member-name">{person.name}</span>'s match page
          </Link>
        ) : data.swipe === null ? (
          <div className="swipe-controls">
            <button
              className="swipe-button swipe-button--pass"
              type="button"
              aria-label={`Pass on ${person.name}`}
              disabled={busy}
              onClick={() => swipe("pass")}
            >
              <X size={22} />
              <span>Pass</span>
            </button>
            <button
              className="swipe-button swipe-button--like"
              type="button"
              aria-label={`Like ${person.name}`}
              disabled={busy}
              onClick={() => swipe("like")}
            >
              <Heart size={22} />
              <span>Like</span>
            </button>
          </div>
        ) : (
          <div className="person-page__swiped">
            <p>
              You {data.swipe === "like" ? "liked" : "passed on"} {person.name}.
            </p>
            <button
              className="secondary-button"
              type="button"
              disabled={busy}
              onClick={undo}
            >
              Undo
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header page-header--with-back">
        <button
          className="icon-button"
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="eyebrow">Profile</p>
          <h1 className="member-name">{data?.profile.name ?? "profile"}</h1>
        </div>
      </header>
      <ContentArrival busy={loading} pace="detail">{content}</ContentArrival>
    </main>
  );
}

export default PersonPage;
