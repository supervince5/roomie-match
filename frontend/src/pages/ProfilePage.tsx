import { LogOut, Pencil } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/authContext";
import ProfileCard from "../components/ProfileCard";
import FormErrors from "../components/FormErrors";
import ProfileForm from "../components/ProfileForm";
import { apiRequest } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { Profile, ProfileInput } from "../types/profile";

function ProfilePage() {
  const { logout } = useAuth();
  const { data: profile, error, loading, reload, setData } = useApi<Profile>("/profiles");
  const [editing, setEditing] = useState(false);

  const hasNoProfile = error?.status === 404;
  // Older profiles have no schoolId (saved before the school list existed)
  const isIncomplete = profile !== null && !profile.schoolId;

  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    const typed = window.prompt(
      "This permanently deletes your profile, photos, matches, and login. Type DELETE to confirm.",
    );
    if (typed !== "DELETE") {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiRequest("/account", { method: "DELETE" });
      logout();
    } catch (caught) {
      setDeleteError(caught);
      setDeleting(false);
    }
  }

  async function createProfile(input: ProfileInput) {
    setData(await apiRequest<Profile>("/profiles", { method: "POST", body: input }));
  }

  async function updateProfile(input: ProfileInput) {
    setData(await apiRequest<Profile>("/profiles", { method: "PUT", body: input }));
    setEditing(false);
  }

  let content;
  if (loading) {
    content = <p className="status-message">Loading your profile...</p>;
  } else if (hasNoProfile) {
    content = (
      <>
        <p className="status-message">Set up your profile so other students can find you.</p>
        <ProfileForm submitLabel="Create profile" onSubmit={createProfile} />
      </>
    );
  } else if (error) {
    content = (
      <div className="status-message">
        <p>{error.message}</p>
        <button className="secondary-button" type="button" onClick={reload}>Try again</button>
      </div>
    );
  } else if (profile && (editing || isIncomplete)) {
    content = (
      <>
        {isIncomplete && <p className="status-message">Finish your profile to start using Discover.</p>}
        <ProfileForm
          initial={profile}
          submitLabel="Save profile"
          onSubmit={updateProfile}
          onCancel={isIncomplete ? undefined : () => setEditing(false)}
        />
      </>
    );
  } else if (profile) {
    content = (
      <>
        <ProfileCard profile={profile} />
        <button className="secondary-button profile-page__edit" type="button" onClick={() => setEditing(true)}>
          <Pencil size={17} />
          Edit profile
        </button>
      </>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Profile</h1>
        </div>

        <button className="icon-button" type="button" aria-label="Log out" title="Log out" onClick={logout}>
          <LogOut size={22} />
        </button>
      </header>

      {content}

      {!loading && (
        <section className="danger-zone">
          <h2>Delete account</h2>
          <p>Removes your profile, photos, matches, and login for good.</p>
          <FormErrors error={deleteError} />
          <button className="small-button small-button--danger" type="button" disabled={deleting} onClick={deleteAccount}>
            {deleting ? "Deleting..." : "Delete my account"}
          </button>
        </section>
      )}
    </main>
  );
}

export default ProfilePage;
