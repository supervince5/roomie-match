import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import FormErrors from "../components/FormErrors";
import ProfileCard, { InstagramLink } from "../components/ProfileCard";
import { apiRequest } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { MatchedProfile } from "../types/profile";

// One match's full profile, at /matches/<their id>
function MatchProfilePage() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { data: match, error, loading } = useApi<MatchedProfile>("/matches/" + encodeURIComponent(userId));
  const [unmatchError, setUnmatchError] = useState<unknown>(null);
  const [unmatching, setUnmatching] = useState(false);

  async function unmatch() {
    if (!match || !window.confirm(`Unmatch with ${match.name}? You won't see each other again.`)) {
      return;
    }
    setUnmatching(true);
    setUnmatchError(null);
    try {
      await apiRequest("/matches/" + encodeURIComponent(match.id), { method: "DELETE" });
      navigate("/matches", { replace: true });
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
        <Link className="secondary-button" to="/matches">Back to matches</Link>
      </section>
    );
  } else {
    content = (
      <>
        <section className="match-profile__contact">
          <p>
            You matched on {new Date(match.matchedAt).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.
          </p>
          {match.instagram ? (
            <InstagramLink handle={match.instagram} />
          ) : (
            <p className="match-card__no-instagram">{match.name} hasn't added an Instagram yet.</p>
          )}
        </section>

        <ProfileCard profile={match} />

        <FormErrors error={unmatchError} />
        <button className="small-button small-button--danger match-profile__unmatch" type="button" disabled={unmatching} onClick={unmatch}>
          {unmatching ? "Unmatching..." : `Unmatch with ${match.name}`}
        </button>
      </>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header page-header--with-back">
        <Link className="icon-button" to="/matches" aria-label="Back to matches">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p className="eyebrow">Your match</p>
          <h1>{match?.name ?? "Profile"}</h1>
        </div>
      </header>

      {content}
    </main>
  );
}

export default MatchProfilePage;
