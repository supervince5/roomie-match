import ContentArrival from "../components/ContentArrival";
import Conversation from "../components/Conversation";
import CompatibilityPanel from "../components/CompatibilityPanel";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ConfirmDialog from "../components/ConfirmDialog";
import FormErrors from "../components/FormErrors";
import ProfileCard, { InstagramLink } from "../components/ProfileCard";
import { apiRequest } from "../lib/api";
import { readApiCache, updateApiCache, useApi } from "../lib/useApi";
import type { MatchedProfile } from "../types/profile";

// One match's full profile, at /matches/<their id>
function MatchProfilePage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  // Coming from the Matches list? We already have their profile, so show it instantly.
  const fromList = readApiCache<{ matches: MatchedProfile[] }>(
    "/matches",
  )?.matches.find((m) => m.id === userId);
  const {
    data: match,
    error,
    loading,
  } = useApi<MatchedProfile>(
    "/matches/" + encodeURIComponent(userId),
    fromList,
  );
  const [unmatchError, setUnmatchError] = useState<unknown>(null);
  const [unmatching, setUnmatching] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function unmatch() {
    if (!match) {
      return;
    }
    setUnmatching(true);
    setUnmatchError(null);
    try {
      await apiRequest("/matches/" + encodeURIComponent(match.id), {
        method: "DELETE",
      });
      // Take them out of the remembered list too, so they don't flash back on the Matches page
      updateApiCache<{ matches: MatchedProfile[] }>("/matches", (current) => ({
        matches: current.matches.filter((m) => m.id !== match.id),
      }));
      navigate("/matches", { replace: true, viewTransition: true });
    } catch (caught) {
      setUnmatchError(caught);
      setUnmatching(false);
    }
  }

  let content;
  if (loading) {
    content = <p className="status-message">Loading profile...</p>;
  } else if (error || !match) {
    content = (
      <section className="empty-state">
        <FormErrors error={error} />
        <Link viewTransition className="secondary-button" to="/matches">
          Back to matches
        </Link>
      </section>
    );
  } else {
    content = (
      <>
        <section className="match-profile__contact">
          <p>
            You matched on{" "}
            {new Date(match.matchedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
            .
          </p>
          {match.instagram ? (
            <InstagramLink handle={match.instagram} />
          ) : (
            <p className="match-card__no-instagram">
              You can start a conversation here, even without Instagram.
            </p>
          )}
        </section>

        <div className="match-profile-layout">
          <div>
            <ProfileCard profile={match} />
            <CompatibilityPanel profile={match} />
          </div>
          <Conversation key={match.id} matchId={match.id} name={match.name} />
        </div>

        <button
          className="small-button small-button--danger match-profile__unmatch"
          type="button"
          onClick={() => setConfirmOpen(true)}
        >
          unmatch with <span className="member-name">{match.name}</span>
        </button>

        <ConfirmDialog
          open={confirmOpen}
          title={<>unmatch with <span className="member-name">{match.name}</span>?</>}
          message="You'll disappear from each other's matches, and you won't see each other in Discover again."
          confirmLabel="Unmatch"
          busyLabel="Unmatching..."
          busy={unmatching}
          error={unmatchError}
          onConfirm={unmatch}
          onCancel={() => {
            setConfirmOpen(false);
            setUnmatchError(null);
          }}
        />
      </>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header page-header--with-back">
        <Link viewTransition
          className="icon-button"
          to="/matches"
          aria-label="Back to matches"
        >
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p className="eyebrow">Your match</p>
          <h1 className="member-name">{match?.name ?? "profile"}</h1>
        </div>
      </header>

      <ContentArrival busy={loading} pace="detail">{content}</ContentArrival>
    </main>
  );
}

export default MatchProfilePage;
