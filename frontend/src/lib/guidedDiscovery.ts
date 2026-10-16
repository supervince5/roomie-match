import type { Cleanliness, Profile, ProfileInput } from "../types/profile";
export type GuidedValues = { name: string; school: { id: number; name: string } | null; major: string; cleanliness: Cleanliness | "" };
export type GuidedStep = "hello" | "name" | "school" | "major" | "cleanliness" | "ready";
export function guidedSteps(profile: Partial<Profile> | null, preferences = true): GuidedStep[] {
  return ["hello", ...(!profile?.name?.trim() ? ["name" as const] : []), ...(!profile?.schoolId ? ["school" as const] : []), ...(!profile?.major?.trim() ? ["major" as const] : []), ...(preferences ? ["cleanliness" as const] : []), "ready"];
}
export function validateGuidedStep(step: GuidedStep, values: GuidedValues) {
  if (step === "name" && (!values.name.trim() || values.name.trim().length > 50)) return "what should we call you? use up to 50 characters.";
  if (step === "school" && (!values.school || !Number.isInteger(values.school.id) || values.school.id <= 0)) return "choose your college from the list.";
  if (step === "major" && (!values.major.trim() || values.major.trim().length > 100)) return "add your major, or write undecided.";
  return "";
}
export function profileWithBasics(profile: Profile | null, values: GuidedValues): ProfileInput {
  for (const step of ["name", "school", "major"] as const) {
    const error = validateGuidedStep(step, values);
    if (error) throw new Error(error);
  }
  if (!profile) return { name: values.name.trim(), schoolId: values.school!.id, major: values.major.trim(), tags: [] };
  // Copy only writable fields. Never send public URLs or server identity back.
  const { name, age, schoolId, major, classYear, bio, instagram, photoKey, tags, prompt, budget, moveInDate, sleepSchedule, cleanliness, smoking, pets } = profile;
  return { name: name || values.name.trim(), age, schoolId: schoolId || values.school!.id, major: major || values.major.trim(), classYear, bio, instagram, photoKey, tags, prompt, budget, moveInDate, sleepSchedule, cleanliness, smoking, pets };
}
type StorageAccess = Pick<Storage, "getItem" | "setItem">;
export function hasSeenSetup(storage: StorageAccess, key: string) {
  try { return storage.getItem(key) === "seen"; } catch { return false; }
}
export function markSetupSeen(storage: StorageAccess, key: string) {
  try { storage.setItem(key, "seen"); } catch { /* Continue in memory when storage is unavailable. */ }
}
export function setupKeys(account: string) {
  return { hint: `roomie.discovery-hint.${account}`, done: `roomie.guided-setup.${account}` };
}
