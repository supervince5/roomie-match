import {
  ArrowDown,
  ArrowRight,
  Check,
  Heart,
  House,
  Moon,
  MoveHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import Brand from "../components/Brand";
import Blossoms from "../components/Blossoms";

export default function LandingPage() {
  return (
    <div className="home-page">
      <header className="site-header">
        <Brand />
        <nav aria-label="Website navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#better-together">Why RoomieMatch</a>
          <Link to="/login">Log in</Link>
          <Link className="button button--dark" to="/discover">
            Find your roomie <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <Blossoms />
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-flower">✳</span> A NEW CHAPTER. A SHARED
              SPACE.
            </p>
            <h1>
              Good company.
              <br />
              Better <em>beginnings.</em>
            </h1>
            <p className="hero-description">
              College is a big new world.
              <br />
              Find someone who makes it feel like home.
            </p>
            <p className="hero-support">
              Meet students who share your everyday rhythms, from quiet mornings
              to late-night study sessions. A roommate connection that starts
              with how you actually live.
            </p>
            <div className="hero-actions">
              <Link className="button button--dark" to="/discover">
                Find your roomie <ArrowRight size={18} />
              </Link>
              <a className="text-link" href="#how-it-works">
                See how it works <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-note">
              <span className="mini-seal">
                <House size={16} />
              </span>
              <span>Your campus. Your pace. Your kind of people.</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-kicker">
              <span>THE CAMPUS CHAPTER</span>
              <span>VOL. 01 / NEW BEGINNINGS</span>
            </div>
            <img
              src="/images/campus-editorial.png"
              alt="Illustrated architectural studies inspired by Harvard, Princeton, and Stanford"
              fetchPriority="high"
            />
            <div className="art-caption">
              <span>
                Different campuses.
                <br />
                <em>The same feeling of belonging.</em>
              </span>
              <span className="art-stamp">
                ROOM
                <br />
                FOR TWO
              </span>
            </div>
            <div className="floating-note">
              <span className="note-icon">
                <Heart size={19} />
              </span>
              <div>
                <strong>A little more in common.</strong>
                <span>A lot more at home.</span>
              </div>
            </div>
          </div>
        </section>
        <div className="campus-strip">
          <span>
            BIG DREAMS.
            <br />
            <strong>EVERY KIND OF CAMPUS.</strong>
          </span>
          <div>
            <span>Harvard</span>
            <span>Princeton</span>
            <span>Stanford</span>
            <span>Virginia Tech</span>
            <span>Your next chapter.</span>
          </div>
          <small>Campus inspiration · independent of these universities</small>
        </div>
        <section id="how-it-works" className="editorial-section how-section">
          <div className="section-intro">
            <p className="eyebrow">01 / A MORE THOUGHTFUL WAY TO MEET</p>
            <h2>
              From strangers
              <br />
              to <em>shared routines.</em>
            </h2>
            <p>
              Skip the endless group-chat introductions. Start with what matters
              when you share a home.
            </p>
          </div>
          <div className="steps">
            <article>
              <span className="step-number">01</span>
              <div>
                <h3>Bring your whole self.</h3>
                <p>
                  Tell your story, your budget, and your living habits. The
                  early alarms, the clean kitchen, the things that make you,
                  you.
                </p>
              </div>
            </article>
            <article>
              <span className="step-number">02</span>
              <div>
                <h3>Find your everyday fit.</h3>
                <p>
                  Explore students at your school. Scroll to get to know them,
                  then swipe right to like or left to pass. No rush.
                </p>
              </div>
            </article>
            <article>
              <span className="step-number">03</span>
              <div>
                <h3>Make the first hello.</h3>
                <p>
                  When you both like each other, it’s a match. Start a
                  conversation and talk through what living together could look
                  like.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section id="better-together" className="values-section">
          <div className="values-art">
            <span className="eyebrow">IT’S THE LITTLE THINGS</span>
            <h2>
              Same wavelength.
              <br />
              <em>Shared space.</em>
            </h2>
            <div className="routine-note">
              <Moon size={22} />
              <span>
                “Quiet after 11?
                <br />
                <strong>That’s my kind of evening.”</strong>
              </span>
            </div>
            <p className="illustrative-label">
              An everyday conversation worth having.
            </p>
            <span className="decor-flower" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="values-copy">
            <p className="eyebrow">02 / MORE THAN A PROFILE PHOTO</p>
            <h2>
              A good roomie fits
              <br />
              your <em>real life.</em>
            </h2>
            <p>
              RoomieMatch is built around a simple idea: sharing an address
              works better when you understand each other first.
            </p>
            <ul>
              <li>
                <Check />
                Know where your budgets and move-in plans overlap.
              </li>
              <li>
                <Check />
                Compare sleep schedules and expectations for a shared space.
              </li>
              <li>
                <Check />
                Connect through mutual interest, at your own pace.
              </li>
            </ul>
            <Link className="text-link" to="/discover">
              Meet your kind of people <ArrowRight size={18} />
            </Link>
          </div>
        </section>
        <section className="closing-section">
          <Sparkles size={26} />
          <p className="eyebrow">MAKE ROOM FOR SOMETHING GOOD</p>
          <h2>
            Your next chapter
            <br />
            doesn’t have to start <em>alone.</em>
          </h2>
          <Link className="button button--dark" to="/discover">
            Let’s find your roomie <ArrowRight size={18} />
          </Link>
          <span>
            <MoveHorizontal size={16} /> A mutual match is just the beginning.
          </span>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <p>Find your people. Make yourself at home.</p>
        <a href="#how-it-works">
          A thoughtful start <ArrowRight size={16} />
        </a>
      </footer>
    </div>
  );
}
