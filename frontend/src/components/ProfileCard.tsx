import type { Profile } from "../types/profile";

type ProfileCardProps = {
  profile: Profile;
  animation: "like" | "pass" | null;
};

function ProfileCard({ profile, animation }: ProfileCardProps) {
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
      <div className="profile-card__photo-area">
        <img
          className="profile-card__photo"
          src={profile.photoUrl}
          alt={`${profile.name}'s sample profile`}
        />

        <div className="profile-card__photo-gradient" />

        <div className="profile-card__headline">
          <div>
            <h2>{profile.name}</h2>
            <p>
              {profile.major} · {profile.year}
            </p>
          </div>

          <div className="compatibility-badge">
            {profile.compatibility}% match
          </div>
        </div>
      </div>

      <div className="profile-card__details">
        <p className="profile-card__school">{profile.school}</p>

        <div className="tag-list">
          {profile.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className="profile-card__bio">{profile.bio}</p>

        <div className="profile-prompt">
          <p className="profile-prompt__question">
            {profile.promptQuestion}
          </p>

          <p className="profile-prompt__answer">
            {profile.promptAnswer}
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;