import Blossoms from "./Blossoms";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { prefetch } from "../lib/useApi";
import BottomNavigation from "./BottomNavigation";
import Brand from "./Brand";
import BrandMark from "./BrandMark";
export default function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    prefetch("/profiles");
    prefetch("/matches");
    prefetch("/discover");
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="app-shell">
      <Blossoms quiet />
      <a className="skip-link" href="#app-content">
        Skip to content
      </a>
      <header className="app-header">
        <Brand />
        <BottomNavigation />
      </header>
      <div id="app-content" tabIndex={-1}>
        <Outlet />
      </div>
      <footer className="app-footer">
        <span>ROOMIEMATCH</span>
        <p>A thoughtful start to living together.</p>
        <BrandMark />
      </footer>
    </div>
  );
}
