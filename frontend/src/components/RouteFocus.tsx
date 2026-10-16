import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
const titles: Record<string, string> = {
  "/": "Find your roomie", "/discover": "Discover", "/matches": "Matches",
  "/search": "Search", "/history": "Swipe history", "/profile": "My profile",
  "/login": "Log in", "/signup": "Create an account", "/forgot-password": "Reset password",
  "/design-preview": "Design preview",
};
export default function RouteFocus() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    const title = titles[pathname] ?? (pathname.startsWith("/matches/") ? "Your match" : pathname.startsWith("/people/") ? "Roommate profile" : "Page not found");
    document.title = `${title} · matcharoomie`;
    if (previous.current === pathname) return;
    previous.current = pathname;
    const frame = requestAnimationFrame(() => {
      if (document.querySelector("dialog[open]")) return;
      const main = document.querySelector("main");
      if (!main || main.contains(document.activeElement)) return;
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
