import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";

function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <div className="brand-icon">
          <HeartHandshake size={42} strokeWidth={2.2} />
        </div>

        <p className="eyebrow">Roommate matching, reimagined</p>

        <h1>Meet your future roomie.</h1>

        <p className="landing-card__description">
          Build a profile, compare living habits, and match with incoming
          students who fit your lifestyle.
        </p>

        <div className="landing-features">
          <div className="landing-feature">
            <Sparkles size={21} />
            <span>Lifestyle compatibility</span>
          </div>

          <div className="landing-feature">
            <HeartHandshake size={21} />
            <span>Mutual roommate matches</span>
          </div>

          <div className="landing-feature">
            <ShieldCheck size={21} />
            <span>Student-focused safety</span>
          </div>
        </div>

        <Link className="primary-button" to="/discover">
          Start matching
        </Link>

        <p className="landing-card__disclaimer">
          Day 2 frontend prototype using sample profiles.
        </p>
      </section>
    </main>
  );
}

export default LandingPage;