import { lazy, Suspense } from "react";
const GuidedDiscovery = lazy(() => import("../components/GuidedDiscovery"));
import { profileWithBasics, type GuidedValues } from "../lib/guidedDiscovery";
import { useNavigate } from "react-router";
import ContentArrival from "../components/ContentArrival";
import { LogOut, Pencil } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/authContext";
import ProfileCard from "../components/ProfileCard";
import ConfirmDialog from "../components/ConfirmDialog";
import ProfileForm from "../components/ProfileForm";
import { apiRequest } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { Profile, ProfileInput } from "../types/profile";

function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showBasics, setShowBasics] = useState(true);
  const [basicsSaved, setBasicsSaved] = useState(false);
  const { data: profile, error, loading, reload, setData } = useApi<Profile>("/profiles");
  const [editing, setEditing] = useState(false);

  const hasNoProfile = error?.status === 404;
  // Older profiles have no schoolId (saved before the school list existed)
  const isIncomplete = profile !== null && (!profile.schoolId || !profile.name || !profile.major);

  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  async function deleteAccount() {
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

  async function saveBasics(values: GuidedValues) {
    const input = profileWithBasics(profile, values);
    setData(await apiRequest<Profile>("/profiles", {method: profile ? "PUT" : "POST", body: input}));
    setBasicsSaved(true);
  }

  async function updateProfile(input: ProfileInput) {
    setData(await apiRequest<Profile>("/profiles", { method: "PUT", body: input }));
    setEditing(false);
  }

  let content;
  if (loading) {
    content = <p className="status-message">Loading your profile...</p>;
  } else if (hasNoProfile || isIncomplete) {
    content = <section className="empty-state"><h2>make yourself at home.</h2><p>start with your name, college, and major. the rest can wait.</p><button className="primary-button" onClick={()=>setShowBasics(true)}>let’s get started</button></section>;
  } else if (error) {
    content = (
      <div className="status-message">
        <p>{error.message}</p>
        <button className="secondary-button" type="button" onClick={reload}>Try again</button>
      </div>
    );
  } else if (profile && editing) {
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

      <ContentArrival busy={loading} pace="detail">{content}</ContentArrival>
      {!loading && (hasNoProfile || isIncomplete || basicsSaved) && showBasics && <Suspense fallback={<p role="status">opening your setup…</p>}><GuidedDiscovery initial={profile} preferences={false} onComplete={saveBasics} onDismiss={() => {
        setShowBasics(false);
        if (basicsSaved) navigate("/discover", {viewTransition:true});
      }}/></Suspense>}

      {!loading && (
        <section className="danger-zone">
          <h2>Delete account</h2>
          <p>Removes your profile, photos, matches, and login for good.</p>
          <button className="small-button small-button--danger" type="button" onClick={() => setConfirmOpen(true)}>
            Delete my account
          </button>
          <ConfirmDialog
            open={confirmOpen}
            title="Delete your account?"
            message="This permanently deletes your profile, photos, matches, and login. It can't be undone."
            requireTyping="delete"
            confirmLabel="Delete account"
            busyLabel="Deleting..."
            busy={deleting}
            error={deleteError}
            onConfirm={deleteAccount}
            onCancel={() => {
              setConfirmOpen(false);
              setDeleteError(null);
            }}
          />
        </section>
      )}
    </main>
  );
}

export default ProfilePage;
