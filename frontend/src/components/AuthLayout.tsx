import type { ReactNode } from "react";
import { ArrowUpRight, Moon, Coffee, Utensils } from "lucide-react";
import Brand from "./Brand";
import Blossoms from "./Blossoms";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <aside className="auth-story" aria-label="About matcharoomie">
        <Blossoms quiet />
        <Brand />
        <div className="auth-story__body">
          <span className="auth-story__index">A place for your kind of person.</span>
          <h2>Life’s better<br />with a good<br /><span>roomie.</span></h2>
          <p>Meet students who fit your everyday.<br />Not just your floor plan.</p>
          <div className="roommate-notes">
            <div className="roommate-notes__heading"><span>The little things that matter</span><ArrowUpRight size={18} /></div>
            <div><Coffee size={20} /><span>Early starts or late nights</span><span>01</span></div>
            <div><Moon size={20} /><span>A quiet space to come back to</span><span>02</span></div>
            <div><Utensils size={20} /><span>Someone to split dinner with</span><span>03</span></div>
          </div>
        </div>
        <footer className="auth-story__footer"><span>One room. A new connection.</span><span>mr.</span></footer>
      </aside>
      <div className="auth-content">{children}</div>
    </main>
  );
}
