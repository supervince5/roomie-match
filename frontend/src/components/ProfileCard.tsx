import {
  AtSign,
  CalendarDays,
  Moon,
  Wallet,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  CLEANLINESS_LABELS,
  SLEEP_LABELS,
  type Profile,
} from "../types/profile";
type Props = { profile: Profile; animation?: "like" | "pass" | null };
function formatMoveIn(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
export default function ProfileCard({ profile, animation = null }: Props) {
  return (
    <article
      className={`profile-card ${animation ? `profile-card--${animation}` : ""}`}
      aria-label={`Roommate profile for ${profile.name}`}
    >
      <div
        className={`profile-card__photo-area ${profile.photoUrl ? "" : "profile-card__photo-area--avatar"}`}
      >
        {profile.photoUrl ? (
          <img
            className="profile-card__photo"
            src={profile.photoUrl}
            alt={`${profile.name}'s photo`}
            draggable={false}
          />
        ) : (
          <>
            <span className="profile-card__initial" aria-hidden="true">
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <span className="avatar-caption">Photo not added yet</span>
          </>
        )}
        <div className="profile-card__photo-gradient" />
        <div className="profile-card__headline">
          <h2>
            {profile.name}
            {profile.age !== undefined && <span>, {profile.age}</span>}
          </h2>
          <p>
            {profile.major}{profile.classYear && ` · Class of ${profile.classYear}`}
          </p>
        </div>
      </div>
      <div className="profile-card__details">
        <p className="profile-card__school">
          <MapPin size={15} />
          {profile.school}
        </p>
        {profile.bio && (
          <div className="profile-about">
            <h3>A little about me</h3>
            <p className="profile-card__bio">{profile.bio}</p>
          </div>
        )}
        {profile.tags.length > 0 && (
          <div className="tag-list">
            {profile.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="living-summary">
          <div>
            <Wallet size={19} />
            <span>
              Monthly budget
              <strong>
                {profile.budget ? `$${profile.budget.min.toLocaleString()}–$${profile.budget.max.toLocaleString()}` : "not shared yet"}
              </strong>
            </span>
          </div>
          <div>
            <CalendarDays size={19} />
            <span>
              Moving in<strong>{profile.moveInDate ? formatMoveIn(profile.moveInDate) : "not shared yet"}</strong>
            </span>
          </div>
          <div>
            <Moon size={19} />
            <span>
              Daily rhythm<strong>{profile.sleepSchedule ? SLEEP_LABELS[profile.sleepSchedule] : "not shared yet"}</strong>
            </span>
          </div>
          <div>
            <Sparkles size={19} />
            <span>
              Shared space
              <strong>{profile.cleanliness ? CLEANLINESS_LABELS[profile.cleanliness] : "not shared yet"}</strong>
            </span>
          </div>
        </div>
        <div className="living-list">
          {profile.smoking !== undefined && <span>{profile.smoking ? "Smokes" : "Non-smoker"}</span>}
          {profile.pets !== undefined && <span>{profile.pets ? "Has pets" : "No pets"}</span>}
        </div>
        {profile.prompt && (
          <div className="profile-prompt">
            <p className="profile-prompt__question">
              {profile.prompt.question}
            </p>
            <p className="profile-prompt__answer">“{profile.prompt.answer}”</p>
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
      <AtSign size={17} />
      {handle} on Instagram
    </a>
  );
}
