import type { ReactNode } from "react";
import Brand from "./Brand";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <div className="auth-story">
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
          <img
            src="/images/campus-editorial.png"
            alt="An illustrated collection of university architecture"
          />
        </div>
        <small>Good company makes all the difference.</small>
      </div>
      <div className="auth-content">{children}</div>
    </main>
  );
}
