// Mirrors backend/src/validation/profileSchemas.ts. If you change the rules there, update this too.

export const TAGS = [
  "Quiet", "Social", "Studious", "Organized", "Creative",
  "Gaming", "Gym", "Sports", "Hiking", "Music",
  "Photography", "Art", "Cooking", "Movies", "Reading",
  "Coffee", "Travel", "Parties", "Homebody", "Engineering",
] as const;

export const PROMPT_QUESTIONS = [
  "My ideal roommate night looks like...",
  "You should room with me if...",
  "A non-negotiable for our room is...",
  "Something I always bring to the room is...",
  "The fastest way to annoy me is...",
] as const;

export type Tag = (typeof TAGS)[number];
export type PromptQuestion = (typeof PROMPT_QUESTIONS)[number];
export type SleepSchedule = "early_bird" | "flexible" | "night_owl";
export type Cleanliness = "very_clean" | "clean" | "relaxed";

// Readable labels for the stored values
export const SLEEP_LABELS: Record<SleepSchedule, string> = {
  early_bird: "Early bird",
  flexible: "Flexible schedule",
  night_owl: "Night owl",
};

export const CLEANLINESS_LABELS: Record<Cleanliness, string> = {
  very_clean: "Very clean",
  clean: "Clean",
  relaxed: "Relaxed about mess",
};

// What you send when creating or editing your profile
export type ProfileInput = {
  name: string;
  age?: number;
  schoolId: number; // official college id; pick from the /schools search
  major: string;
  classYear?: number;
  bio?: string;
  instagram?: string; // only shown to people you've matched with
  photoKey?: string;  // where your photo lives in S3 (from uploadPhoto)
  tags: Tag[];
  prompt?: { question: PromptQuestion; answer: string };
  budget?: { min: number; max: number };
  moveInDate?: string; // YYYY-MM-DD
  sleepSchedule?: SleepSchedule;
  cleanliness?: Cleanliness;
  smoking?: boolean;
  pets?: boolean;
};

// What the API sends back. photoUrl is a temporary link (about an hour) to show the photo.
// instagram only comes back for yourself and your matches.
export type Profile = ProfileInput & { id: string; school: string; photoUrl?: string };
export type MatchedProfile = Profile & { matchedAt: string };
