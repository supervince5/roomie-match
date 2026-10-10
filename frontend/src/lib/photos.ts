import { apiRequest } from "./api";

const MAX_SIDE = 1080; // pixels; plenty for a profile photo

// Shrinks a photo in the browser before uploading. Phone photos are often 4-10 MB;
// this turns them into a ~200 KB JPEG, so uploads are fast and storage stays cheap.
async function shrinkToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't read that image."))), "image/jpeg", 0.85),
  );
}

type UploadSlip = { photoKey: string; uploadUrl: string; fields: Record<string, string> };

// 1) ask our API for a one-time upload permission slip
// 2) send the photo straight to S3 with it
// 3) return the photoKey to save on the profile
export async function uploadPhoto(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const jpeg = await shrinkToJpeg(file);
  const slip = await apiRequest<UploadSlip>("/profiles/photo", { method: "POST" });

  const form = new FormData();
  for (const [key, value] of Object.entries(slip.fields)) {
    form.append(key, value);
  }
  form.append("file", jpeg); // S3 requires the file to be the last field

  const response = await fetch(slip.uploadUrl, { method: "POST", body: form });
  if (!response.ok) {
    throw new Error("Photo upload failed. Try a smaller image.");
  }
  return { photoKey: slip.photoKey, previewUrl: URL.createObjectURL(jpeg) };
}
