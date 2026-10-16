import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Profile } from "../types/profile";

// A compact row: photo, name, major. Tapping it opens their profile.
// `aside` shows on the right (a badge or buttons).
function PersonRow({ profile, to, aside }: { profile: Profile; to: string; aside?: ReactNode }) {
  return (
    <div className="match-row person-row">
      <Link viewTransition className="person-row__link" to={to}>
        {profile.photoUrl ? (
          <img className="match-row__photo" src={profile.photoUrl} alt="" />
        ) : (
          <div className="match-row__photo match-row__photo--initial" aria-hidden="true">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="match-row__text">
          <strong>{profile.name}</strong>
          <span>
            {profile.major}{profile.classYear && ` · Class of ${profile.classYear}`}
          </span>
        </div>
      </Link>
      {aside && <div className="person-row__aside">{aside}</div>}
    </div>
  );
}

export default PersonRow;
