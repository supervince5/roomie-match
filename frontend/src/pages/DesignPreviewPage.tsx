import Blossoms from "../components/Blossoms";
import { Link } from "react-router";
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
  return (
    <div className="app-shell">
      <Blossoms quiet />
      <header className="app-header">
        <Brand />
        <span className="eyebrow">SAMPLE PROFILES · LOCAL PREVIEW</span>
        <Link className="text-link" to="/discover">
          Back to your account
        </Link>
      </header>
      <DiscoverPage previewProfiles={profiles} />
    </div>
  );
}
