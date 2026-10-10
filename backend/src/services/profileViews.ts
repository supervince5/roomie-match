import { Profile } from "../repositories/profileRepository.js";
import { getPhotoUrl } from "../repositories/photoRepository.js";

// Decides what other people get to see of a profile.
// photoKey (where the file lives in S3) is swapped for a temporary photoUrl the browser can show.

// For yourself: everything, plus photoKey, so saving your profile keeps your photo.
export async function ownView(profile: Profile) {
    return { ...profile, photoUrl: await getPhotoUrl(profile.photoKey) };
}

// For your matches: everything, including Instagram.
export async function fullView(profile: Profile) {
    const { photoKey, ...rest } = profile;
    return { ...rest, photoUrl: await getPhotoUrl(photoKey) };
}

// For strangers in Discover: no Instagram until you've matched.
export async function publicView(profile: Profile) {
    const { photoKey, instagram, ...rest } = profile;
    return { ...rest, photoUrl: await getPhotoUrl(photoKey) };
}
