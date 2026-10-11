import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { prefetch } from "../lib/useApi";
import BottomNavigation from "./BottomNavigation";
import Brand from "./Brand";
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
      <a className="skip-link" href="#app-content">
        Skip to content
      </a>
      <header className="app-header">
        <Brand />
        <BottomNavigation />
        <span className="app-header__note">
          <i /> Make room for good company.
        </span>
      </header>
      <div id="app-content" tabIndex={-1}>
        <Outlet />
      </div>
      <footer className="app-footer">
        <span>ROOMIEMATCH</span>
        <p>A thoughtful start to living together.</p>
        <span>✳</span>
      </footer>
    </div>
  );
}
