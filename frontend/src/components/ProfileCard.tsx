import { AtSign } from "lucide-react";
import { CLEANLINESS_LABELS, SLEEP_LABELS, type Profile } from "../types/profile";

type ProfileCardProps = {
  profile: Profile;
  animation?: "like" | "pass" | null;
};

function formatMoveIn(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function ProfileCard({ profile, animation = null }: ProfileCardProps) {
  const animationClass =
    animation === "like"
      ? "profile-card--like"
      : animation === "pass"
        ? "profile-card--pass"
        : "";

  return (
    <article
      className={`profile-card ${animationClass}`}
      aria-label={`Roommate profile for ${profile.name}`}
    >
      <div className={`profile-card__photo-area ${profile.photoUrl ? "" : "profile-card__photo-area--avatar"}`}>
        {profile.photoUrl ? (
          <img className="profile-card__photo" src={profile.photoUrl} alt={`${profile.name}'s photo`} />
        ) : (
          <span className="profile-card__initial" aria-hidden="true">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="profile-card__photo-gradient" />

        <div className="profile-card__headline">
          <div>
            <h2>
              {profile.name}, {profile.age}
            </h2>
            <p>
              {profile.major} · Class of {profile.classYear}
            </p>
          </div>
        </div>
      </div>

      <div className="profile-card__details">
        <p className="profile-card__school">{profile.school}</p>

        {/* The API only includes instagram for yourself and your matches */}
        {profile.instagram && <InstagramLink handle={profile.instagram} />}

        <div className="living-list">
          <span>{SLEEP_LABELS[profile.sleepSchedule]}</span>
          <span>{CLEANLINESS_LABELS[profile.cleanliness]}</span>
          <span>
            ${profile.budget.min}–${profile.budget.max}/mo
          </span>
          <span>Moving in {formatMoveIn(profile.moveInDate)}</span>
          <span>{profile.smoking ? "Smokes" : "Non-smoker"}</span>
          <span>{profile.pets ? "Has pets" : "No pets"}</span>
        </div>

        {profile.tags.length > 0 && (
          <div className="tag-list">
            {profile.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {profile.bio && <p className="profile-card__bio">{profile.bio}</p>}

        {profile.prompt && (
          <div className="profile-prompt">
            <p className="profile-prompt__question">{profile.prompt.question}</p>
            <p className="profile-prompt__answer">{profile.prompt.answer}</p>
          </div>
        )}
      </div>
    </article>
  );
}

export function InstagramLink({ handle }: { handle: string }) {
  return (
    <a
      className="instagram-link"
      href={`https://instagram.com/${encodeURIComponent(handle)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <AtSign size={17} />{handle} on Instagram
    </a>
  );
}

export default ProfileCard;
