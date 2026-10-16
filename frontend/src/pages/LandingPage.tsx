import { ArrowRight, Pause, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Blossoms from "../components/Blossoms";
import Brand from "../components/Brand";
import BrandMark from "../components/BrandMark";
import CampusMarquee from "../components/CampusMarquee";
import { SwipePreview, ScrollPreview } from "../components/LandingDemos";
import WaitlistDialog from "../components/WaitlistDialog";
import "../landing.css";
import "../waitlist.css";

export default function LandingPage({ waitlist = true }: { waitlist?: boolean }) {
  const [paused, setPaused] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <main className={`minimal-landing ${waitlist ? "waitlist-landing" : ""} ${paused ? "is-paused" : ""}`}>
      <Blossoms paused={paused || waitlistOpen} />

      <header className="minimal-topbar">
        <Brand />
        {waitlist ? <span className="waitlist-topnote">coming soon</span> : <Link viewTransition className="minimal-login" to="/login">
          log in <ArrowRight size={14} />
        </Link>}
      </header>

      <div className="landing-composition">
        <section className="minimal-center" aria-label="Find your roommate">
          <div className="matcha-hero-mark"><BrandMark /></div>
          <h1>
            <span className="matcha-word">matcha</span>roomie
            <span className="wordmark-dot">.</span>
          </h1>
          <p className="minimal-kicker">find the roommate of your life.</p>
          {waitlist ? <>
            <button type="button" className="minimal-cta" onClick={() => setWaitlistOpen(true)}>
              join the waitlist <ArrowRight size={17} />
            </button>
            <p className="waitlist-launch">opening after uva early decision results</p>
          </> : <Link viewTransition className="minimal-cta" to="/signup">
            find your roomie <ArrowRight size={17} />
          </Link>}
        </section>
        <div className="landing-playground" aria-label="fictional sample profiles">
          <SwipePreview paused={paused || waitlistOpen} />
          <ScrollPreview paused={paused || waitlistOpen} />
        </div>
      </div>
      <div className="landing-campus-band"><CampusMarquee prelaunch={waitlist} /></div>

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
      {waitlist && <WaitlistDialog open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />}
    </main>
  );
}
