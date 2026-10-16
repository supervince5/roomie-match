import { z } from "zod";
import { getSchool } from "../data/schools.js";

// Fixed lists. Matching compares these, so they can't be free text.
export const TAGS = [
    "Quiet", "Social", "Studious", "Organized", "Creative",
    "Gaming", "Gym", "Sports", "Hiking", "Music",
    "Photography", "Art", "Cooking", "Movies", "Reading",
    "Coffee", "Travel", "Parties", "Homebody", "Engineering"
] as const;

export const PROMPT_QUESTIONS = [
    "My ideal roommate night looks like...",
    "You should room with me if...",
    "A non-negotiable for our room is...",
    "Something I always bring to the room is...",
    "The fastest way to annoy me is..."
] as const;

const photoKeySchema = z.string().regex(/^photos\/[\w-]+\/[\w-]+\.jpg$/, "Invalid photo");

// The one place that defines what a valid profile looks like.
// .strict() rejects any field not listed here (like "isAdmin").
export const profileSchema = z.object({
    // About you
    name: z.string().trim().min(1, "Name can't be empty").max(50),
    age: z.number().int().min(17).max(100).optional(),
    schoolId: z.number().int().refine(id => getSchool(id) !== undefined, "Pick a school from the list"),
    major: z.string().trim().min(1).max(100),
    classYear: z.number().int().min(2020).max(2040).optional(),
    bio: z.string().trim().max(500).optional(),
    tags: z.array(z.enum(TAGS, "Not one of the allowed tags")).max(5, "Pick at most 5 tags").default([]),
    // Only shown to people you've matched with. A leading "@" is fine; we strip it.
    instagram: z.string().trim()
        .transform(handle => handle.replace(/^@/, ""))
        .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Instagram handles only use letters, numbers, periods, and underscores"))
        .optional(),
    // Where your photo lives in S3. You get this from POST /profiles/photo.
    photoKey: photoKeySchema.optional(),
    photoKeys: z.array(photoKeySchema).max(6, "Choose up to 6 photos")
        .refine(keys => new Set(keys).size === keys.length, "Each photo can only appear once").optional(),
    prompt: z.object({
        question: z.enum(PROMPT_QUESTIONS),
        answer: z.string().trim().min(1).max(200)
    }).strict().optional(),

    // Living preferences (what matching is built on)
    budget: z.object({
        min: z.number().int().min(0),
        max: z.number().int().min(0)
    }).strict().refine(b => b.min <= b.max, "Budget min can't be more than max").optional(),
    moveInDate: z.iso.date("Use the format YYYY-MM-DD").optional(),
    sleepSchedule: z.enum(["early_bird", "flexible", "night_owl"]).optional(),
    cleanliness: z.enum(["very_clean", "clean", "relaxed"]).optional(),
    smoking: z.boolean().optional(),
    pets: z.boolean().optional()
}).strict();

// The TypeScript type, generated from the schema so the two can never drift apart.
export type ProfileInput = z.infer<typeof profileSchema>;

// A photo key looks like photos/<userId>/<random>.jpg. You can only use your own photos.
export function photoBelongsTo(photoKey: string | undefined, userId: string) {
    return photoKey === undefined || photoKey.startsWith("photos/" + userId + "/");
}

// Check both representations, even when an album overrides a legacy cover.
export function profilePhotosBelongTo(profile: Pick<ProfileInput, "photoKey" | "photoKeys">, userId: string) {
    return photoBelongsTo(profile.photoKey, userId)
        && (profile.photoKeys ?? []).every(key => photoBelongsTo(key, userId));
}

export function profilePhotoKeys(profile: Pick<ProfileInput, "photoKey" | "photoKeys">): string[] {
    return profile.photoKeys ?? (profile.photoKey ? [profile.photoKey] : []);
}

// An omitted album means preserve it; [] explicitly removes every photo.
export function normalizedPhotos(profile: Pick<ProfileInput, "photoKey" | "photoKeys">) {
    if (profile.photoKeys !== undefined) return { photoKeys: profile.photoKeys, photoKey: profile.photoKeys[0] };
    if (profile.photoKey !== undefined) return { photoKeys: [profile.photoKey], photoKey: profile.photoKey };
    return {};
}
