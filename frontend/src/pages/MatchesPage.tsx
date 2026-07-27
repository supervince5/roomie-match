import { Heart } from "lucide-react";
import { mockProfiles } from "../data/mockProfiles";

function MatchesPage() {
  const sampleMatches = mockProfiles.slice(0, 2);

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your connections</p>
          <h1>Matches</h1>
        </div>
      </header>

      <section className="matches-introduction">
        <Heart size={23} />
        <p>
          A match appears when two students both choose each other.
        </p>
      </section>

      <section className="match-list" aria-label="Roommate matches">
        {sampleMatches.map((profile) => (
          <article className="match-card" key={profile.id}>
            <img
              className="match-card__photo"
              src={profile.photoUrl}
              alt={`${profile.name}'s sample profile`}
            />

            <div className="match-card__information">
              <div className="match-card__heading">
                <h2>{profile.name}</h2>
                <span>{profile.compatibility}%</span>
              </div>

              <p>
                {profile.major} · {profile.year}
              </p>

              <p className="match-card__shared">
                You both value communication and shared-space respect.
              </p>

              <button className="small-button" type="button">
                View profile
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default MatchesPage;