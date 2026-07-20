import { Heart, Search, UserRound } from "lucide-react";
import { NavLink } from "react-router";

function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      <NavLink
        to="/discover"
        className={({ isActive }) =>
          `bottom-navigation__link ${
            isActive ? "bottom-navigation__link--active" : ""
          }`
        }
      >
        <Search size={23} strokeWidth={2.3} />
        <span>Discover</span>
      </NavLink>

      <NavLink
        to="/matches"
        className={({ isActive }) =>
          `bottom-navigation__link ${
            isActive ? "bottom-navigation__link--active" : ""
          }`
        }
      >
        <Heart size={23} strokeWidth={2.3} />
        <span>Matches</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `bottom-navigation__link ${
            isActive ? "bottom-navigation__link--active" : ""
          }`
        }
      >
        <UserRound size={23} strokeWidth={2.3} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNavigation;