import { ArrowRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import BrandMark from "../components/BrandMark";
import CampusMarquee from "../components/CampusMarquee";
import { SwipePreview, ScrollPreview } from "../components/LandingDemos";
import "../landing.css";

export default function LandingPage() {
  const [paused, setPaused] = useState(false);

  return (
    <main className={`minimal-landing ${paused ? "is-paused" : ""}`}>
      <div className="pond-atmosphere" aria-hidden="true">
        <div className="pond-painting" />
        <i className="pond-ripple pond-ripple--one" />
        <i className="pond-ripple pond-ripple--two" />
        <i className="pond-ripple pond-ripple--three" />
      </div>

      <header className="minimal-topbar">
        <Link className="minimal-monogram" to="/" aria-label="RoomieMatch home">
          <BrandMark />
        </Link>
        <Link className="minimal-login" to="/login">
          Log in <ArrowRight size={14} />
        </Link>
      </header>

      <SwipePreview paused={paused} />

      <section className="minimal-center" aria-label="Find your roommate">
        <p className="minimal-kicker">find the roommate of your life.</p>
        <h1>
          roomie<span>match</span>
          <span className="wordmark-dot">.</span>
        </h1>
        <Link className="minimal-cta" to="/signup">
          Find your roomie <ArrowRight size={17} />
        </Link>
        <CampusMarquee />
      </section>

      <ScrollPreview paused={paused} />

      <span className="minimal-footnote">
        one’s a roomie. two’s a triplie.
        <span className="sr-only">
          Find a roommate or a trio for a three-person suite.
        </span>
      </span>
      <button
        className="minimal-motion"
        type="button"
        aria-label={paused ? "Play animations" : "Pause animations"}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
        <span>{paused ? "Play motion" : "Pause motion"}</span>
      </button>
    </main>
  );
}
