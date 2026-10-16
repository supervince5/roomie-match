import type { Profile } from "../types/profile";

export const MAX_PROFILE_PHOTOS = 6;
export type EditablePhoto = { key?: string; url?: string };
export function profilePhotoUrls(profile: Partial<Profile>): string[] {
  return profile.photoUrls ?? (profile.photoUrl ? [profile.photoUrl] : []);
}
export function editablePhotos(profile: Partial<Profile>): EditablePhoto[] {
  const keys = profile.photoKeys ?? (profile.photoKey ? [profile.photoKey] : []);
  const urls = profilePhotoUrls(profile);
  return keys.map((key, index) => ({ key, url: urls[index] }));
}
// The requested gesture: dragging right advances the album, dragging left goes back.
export function photoSwipeStep(dx: number, dy: number): -1 | 0 | 1 {
  return Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 1 : -1) : 0;
}
export function nextPhotoIndex(index: number, step: number, count: number): number {
  return Math.max(0, Math.min(count - 1, index + step));
}
