import { Profile } from "../repositories/profileRepository.js";
import { getPhotoUrl } from "../repositories/photoRepository.js";
import { profilePhotoKeys } from "../validation/profileSchemas.js";

async function photoLinks(profile: Profile) {
    // Promise.all retains the stored cover/album order regardless of signing completion.
    const photoUrls = await Promise.all(profilePhotoKeys(profile).map(key => getPhotoUrl(key)));
    return { photoUrls, photoUrl: photoUrls[0] };
}

// Owners retain keys so editing can save the album. Everyone else gets signed links only.
export async function ownView(profile: Profile) {
    return { ...profile, ...await photoLinks(profile) };
}
export async function fullView(profile: Profile) {
    const { photoKey, photoKeys, ...rest } = profile;
    return { ...rest, ...await photoLinks(profile) };
}
export async function publicView(profile: Profile) {
    const { photoKey, photoKeys, instagram, ...rest } = profile;
    return { ...rest, ...await photoLinks(profile) };
}
