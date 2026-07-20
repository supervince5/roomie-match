import { Pencil, Settings } from "lucide-react";
import { myProfile } from "../data/mockProfiles";

function ProfilePage() {
  function showEditingMessage() {
    window.alert(
      "Profile editing will be built after the frontend preview is complete.",
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Profile</h1>
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Open settings"
          onClick={() =>
            window.alert("Settings will be added in a later step.")
          }
        >
          <Settings size={23} />
        </button>
      </header>

      <section className="my-profile-card">
        <img
          className="my-profile-card__photo"
          src={myProfile.photoUrl}
          alt="Sample personal profile"
        />

        <div className="my-profile-card__content">
          <div className="my-profile-card__heading">
            <div>
              <h2>{myProfile.name}</h2>
              <p>
                {myProfile.major} · {myProfile.year}
              </p>
            </div>

            <button
              className="edit-button"
              type="button"
              onClick={showEditingMessage}
            >
              <Pencil size={17} />
              Edit
            </button>
          </div>

          <p className="my-profile-card__school">
            {myProfile.school}
          </p>

          <div className="tag-list">
            {myProfile.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <p className="my-profile-card__bio">{myProfile.bio}</p>

          <div className="profile-prompt">
            <p className="profile-prompt__question">
              {myProfile.promptQuestion}
            </p>

            <p className="profile-prompt__answer">
              {myProfile.promptAnswer}
            </p>
          </div>
        </div>
      </section>

      <section className="profile-progress">
        <div className="profile-progress__heading">
          <h2>Profile strength</h2>
          <span>80%</span>
        </div>

        <div
          className="profile-progress__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={80}
        >
          <div className="profile-progress__fill" />
        </div>

        <p>
          Adding housing preferences and additional prompts will improve your
          future recommendations.
        </p>
      </section>
    </main>
  );
}

export default ProfilePage;