import { HeartHandshake, ShieldCheck, SlidersHorizontal } from "lucide-react";
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
          Build a profile, browse students at your school, and match when
          you both say yes.
        </p>

        <div className="landing-features">
          <div className="landing-feature">
            <SlidersHorizontal size={21} />
            <span>Filter by living habits</span>
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

        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default LandingPage;