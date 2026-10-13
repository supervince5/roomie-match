import type { ReactNode } from "react";
import Blossoms from "./Blossoms";
import Brand from "./Brand";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <div className="auth-story">
        <Blossoms quiet />
        <Brand />
        <div>
          <p className="eyebrow">A SHARED SPACE. A FRESH START.</p>
          <h2>
            Make yourself
            <br />
            <em>at home.</em>
          </h2>
          <p>
            Your routines, your ambitions, your kind of people.
            <br />A better roommate connection begins here.
          </p>
          <div className="sakura-room-art" aria-hidden="true">
            <div className="sakura-window"><i /><i /></div>
            <span>a little room for a new beginning.</span>
          </div>
        </div>
        <small>Good company makes all the difference.</small>
      </div>
      <div className="auth-content">{children}</div>
    </main>
  );
}
