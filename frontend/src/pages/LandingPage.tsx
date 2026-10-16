import { ArrowRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Blossoms from "../components/Blossoms";
import Brand from "../components/Brand";
import BrandMark from "../components/BrandMark";
import CampusMarquee from "../components/CampusMarquee";
import { SwipePreview, ScrollPreview } from "../components/LandingDemos";
import "../landing.css";

export default function LandingPage() {
  const [paused, setPaused] = useState(false);

  return (
    <main className={`minimal-landing ${paused ? "is-paused" : ""}`}>
      <Blossoms paused={paused} />

      <header className="minimal-topbar">
        <Brand />
        <Link viewTransition className="minimal-login" to="/login">
          log in <ArrowRight size={14} />
        </Link>
      </header>

      <div className="landing-composition">
        <section className="minimal-center" aria-label="Find your roommate">
          <div className="matcha-hero-mark"><BrandMark /></div>
          <h1>
            <span className="matcha-word">matcha</span>roomie
            <span className="wordmark-dot">.</span>
          </h1>
          <p className="minimal-kicker">find the roommate of your life.</p>
          <Link viewTransition className="minimal-cta" to="/signup">
            find your roomie <ArrowRight size={17} />
          </Link>
        </section>
        <div className="landing-playground" aria-label="fictional sample profiles">
          <SwipePreview paused={paused} />
          <ScrollPreview paused={paused} />
        </div>
      </div>
      <div className="landing-campus-band"><CampusMarquee /></div>

      <span className="minimal-footnote">
        one’s a roomie. two’s a triplie.
        <span className="sr-only">
          Find a roommate or a trio for a three-person suite.
        </span>
      </span>
      <button
        className="minimal-motion"
        type="button"
        aria-label={paused ? "play animations" : "pause animations"}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
        <span>{paused ? "play motion" : "pause motion"}</span>
      </button>
    </main>
  );
}
