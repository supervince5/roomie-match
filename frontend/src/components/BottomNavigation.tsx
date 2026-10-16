import { Compass, Heart, History, Search, UserRound } from "lucide-react";
import { NavLink } from "react-router";
export default function BottomNavigation() {
  return (
    <nav className="app-navigation" aria-label="Main navigation">
      {[
        { to: "/discover", label: "Discover", Icon: Compass },
        { to: "/matches", label: "Matches", Icon: Heart },
        { to: "/search", label: "Search", Icon: Search },
        { to: "/history", label: "History", Icon: History },
        { to: "/profile", label: "My profile", Icon: UserRound },
      ].map(({ to, label, Icon }) => (
        <NavLink viewTransition
          key={to}
          to={to}
          className={({ isActive }) =>
            `app-navigation__link ${isActive ? "is-active" : ""}`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
