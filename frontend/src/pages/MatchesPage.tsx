import { ChevronRight, Heart } from "lucide-react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import { useApi } from "../lib/useApi";
import type { MatchedProfile } from "../types/profile";

function MatchesPage() {
  const { data, error, loading, reload } = useApi<{ matches: MatchedProfile[] }>("/matches");
  const matches = data?.matches ?? [];

  let content;
  if (loading) {
    content = <p className="status-message">Loading your matches...</p>;
  } else if (error) {
    content = (
      <section className="empty-state">
        <FormErrors error={error} />
        <button className="secondary-button" type="button" onClick={reload}>Try again</button>
      </section>
    );
  } else if (matches.length === 0) {
    content = (
      <section className="empty-state">
        <div className="empty-state__icon">
          <Heart size={40} />
        </div>
        <h2>No matches yet</h2>
        <p>Keep swiping. When someone you liked likes you back, they'll show up here.</p>
        <Link className="secondary-button" to="/discover">Go to Discover</Link>
      </section>
    );
  } else {
    // One compact row per match. Tap a row to open their full profile.
    content = (
      <section className="match-list" aria-label="Roommate matches">
        {matches.map((match) => (
          <Link className="match-row" key={match.id} to={`/matches/${encodeURIComponent(match.id)}`}>
            {match.photoUrl ? (
              <img className="match-row__photo" src={match.photoUrl} alt="" />
            ) : (
              <div className="match-row__photo match-row__photo--initial" aria-hidden="true">
                {match.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="match-row__text">
              <strong>{match.name}</strong>
              <span>
                {match.major} · Class of {match.classYear}
              </span>
            </div>
            <ChevronRight className="match-row__arrow" size={20} />
          </Link>
        ))}
      </section>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your connections</p>
          <h1>A hello worth making.</h1>
        </div>
      </header>

      <section className="matches-introduction">
        <Heart size={23} />
        <p>A match appears when two students both like each other. Open a match to compare your living habits and start a conversation.</p>
      </section>

      {content}
    </main>
  );
}

export default MatchesPage;
