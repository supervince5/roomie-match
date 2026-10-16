import { lazy, Suspense } from "react";
const GuidedDiscovery = lazy(() => import("../components/GuidedDiscovery"));
import { useNavigate } from "react-router";
import Blossoms from "../components/Blossoms";
import { useState } from "react";
import ProfileForm from "../components/ProfileForm";
import { Link, useSearchParams } from "react-router";
import Brand from "../components/Brand";
import DiscoverPage from "./DiscoverPage";
import type { Profile } from "../types/profile";
const base: Profile = {
  id: "preview-1",
  name: "Jamie",
  age: 20,
  schoolId: 1,
  school: "Sample university",
  major: "Architecture",
  classYear: 2028,
  budget: { min: 650, max: 950 },
  moveInDate: "2027-08-01",
  sleepSchedule: "early_bird",
  cleanliness: "clean",
  smoking: false,
  pets: false,
  tags: ["Creative", "Cooking", "Hiking"],
  bio: "I love a slow morning, a shared dinner, and a home where everyone can recharge. Looking for someone who appreciates a tidy kitchen and the occasional weekend adventure.",
  prompt: {
    question: "You should room with me if...",
    answer:
      "You think good food and a little consideration make a house a home.",
  },
};
const profiles = [
  base,
  {
    ...base,
    id: "preview-2",
    name: "Alex",
    major: "Computer Science",
    sleepSchedule: "night_owl" as const,
  },
  {
    ...base,
    id: "preview-3",
    name: "Casey",
    major: "Biology",
    budget: { min: 1100, max: 1400 },
  },
];
export default function DesignPreviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setupPreview = params.get("view") === "setup";
  const [saved, setSaved] = useState(false);
  const formPreview = params.get("view") === "profile";
  return (
    <div className="app-shell">
      <Blossoms quiet />
      <header className="app-header">
        <Brand />
        <span className="eyebrow">SAMPLE PROFILES · LOCAL PREVIEW</span>
        <Link viewTransition className="text-link" to="/discover">
          Back to your account
        </Link>
      </header>
      <nav className="preview-navigation" aria-label="Preview views">
        <Link viewTransition to="/design-preview" aria-current={!formPreview && !setupPreview ? "page" : undefined}>Discover</Link>
        <Link viewTransition to="/design-preview?view=setup">guided setup</Link>
        <Link viewTransition to="/design-preview?view=profile" aria-current={formPreview ? "page" : undefined}>Profile form</Link>
      </nav>
      {setupPreview && <Suspense fallback={<p role="status">opening your setup…</p>}><GuidedDiscovery localPreview initial={null} preferences onComplete={async()=>{setSaved(true);}} onDismiss={()=>navigate("/design-preview",{viewTransition:true})}/></Suspense>} 
      {formPreview ? <main className="page">
        <header className="page-header"><h1>Sample profile</h1></header>
        <p>Local preview. Changes and photos stay in this tab.</p>
        {saved && <p role="status">Sample saved. No account changed.</p>}
        <ProfileForm initial={base} localPreview submitLabel="Save sample profile" onSubmit={async () => { setSaved(true); }} />
      </main> : <DiscoverPage previewProfiles={profiles} />}
    </div>
  );
}
