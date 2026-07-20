import type { Profile } from "../types/profile";

export const mockProfiles: Profile[] = [
  {
    id: "maya-chen",
    name: "Maya",
    school: "Virginia Tech",
    major: "Architecture",
    year: "Class of 2030",
    bio: "I love coffee shops, sketching, and keeping a calm room. I usually wake up early and like having a clean shared space.",
    photoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    compatibility: 94,
    tags: ["Early riser", "Very clean", "Quiet"],
    promptQuestion: "My ideal roommate night looks like...",
    promptAnswer: "Cooking something together and watching a movie.",
  },
  {
    id: "jordan-williams",
    name: "Jordan",
    school: "Virginia Tech",
    major: "Computer Science",
    year: "Class of 2030",
    bio: "I am usually studying, playing basketball, gaming, or looking for good food. I am social but still respect quiet time.",
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    compatibility: 89,
    tags: ["Night owl", "Gaming", "Social"],
    promptQuestion: "You should room with me if...",
    promptAnswer: "You like a balance between having fun and getting work done.",
  },
  {
    id: "sofia-martinez",
    name: "Sofia",
    school: "Virginia Tech",
    major: "Biological Sciences",
    year: "Class of 2030",
    bio: "Future pre-med student. I like organized spaces, quiet study sessions, plants, and going to the gym.",
    photoUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    compatibility: 87,
    tags: ["Studious", "Gym", "Organized"],
    promptQuestion: "A non-negotiable for our room is...",
    promptAnswer: "We communicate instead of letting small problems build up.",
  },
  {
    id: "ethan-kim",
    name: "Ethan",
    school: "Virginia Tech",
    major: "Mechanical Engineering",
    year: "Class of 2030",
    bio: "I like cars, music, hiking, and pickup sports. I am pretty relaxed about the room as long as we both contribute.",
    photoUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    compatibility: 82,
    tags: ["Hiking", "Music", "Relaxed"],
    promptQuestion: "Something I always bring to the room is...",
    promptAnswer: "A speaker, snacks, and a good attitude.",
  },
  {
    id: "noor-hassan",
    name: "Noor",
    school: "Virginia Tech",
    major: "Business Information Technology",
    year: "Class of 2030",
    bio: "I enjoy thrifting, photography, late-night conversations, and exploring new places. I keep shared spaces tidy.",
    photoUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    compatibility: 79,
    tags: ["Photography", "Night owl", "Tidy"],
    promptQuestion: "The fastest way to annoy me is...",
    promptAnswer: "Leaving food or trash in the room for days.",
  },
];

export const myProfile: Profile = {
  id: "my-profile",
  name: "Vincent",
  school: "Virginia Tech",
  major: "General Engineering",
  year: "Class of 2030",
  bio: "Cellist, developer, and incoming engineering student. I like music, games, creative projects, and meeting new people.",
  photoUrl:
    "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=900&q=80",
  compatibility: 100,
  tags: ["Music", "Engineering", "Creative"],
  promptQuestion: "You should room with me if...",
  promptAnswer: "You communicate clearly and respect each other's schedules.",
};