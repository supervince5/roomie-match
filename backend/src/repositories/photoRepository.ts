import { randomUUID } from "node:crypto";
import { S3Client, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { requireEnv } from "../lib/env.js";

const s3 = new S3Client({});
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

function bucket() {
    return requireEnv("PHOTOS_BUCKET");
}

// The bucket is private. To upload, the browser gets a one-time "permission slip" (a presigned
// POST) that only allows ONE file, at ONE exact path, as a JPEG under 5 MB, for the next 5 minutes.
// The photo goes straight from the browser to S3; it never passes through our Lambda.
export async function createPhotoUpload(userId: string) {
    const photoKey = "photos/" + userId + "/" + randomUUID() + ".jpg";
    const upload = await createPresignedPost(s3, {
        Bucket: bucket(),
        Key: photoKey,
        Conditions: [
            ["content-length-range", 1, MAX_PHOTO_BYTES],
            ["eq", "$Content-Type", "image/jpeg"]
        ],
        Fields: { "Content-Type": "image/jpeg" },
        Expires: 300
    });
    return { photoKey: photoKey, uploadUrl: upload.url, fields: upload.fields };
}

// Same idea for viewing: a link that works for one hour, then expires.
export async function getPhotoUrl(photoKey: string | undefined) {
    if (photoKey === undefined) {
        return undefined;
    }
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket(), Key: photoKey }), { expiresIn: 3600 });
}

// Removes every photo a user ever uploaded (used when deleting an account).
export async function deleteAllPhotos(userId: string) {
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "photos/" + userId + "/" }));
    const keys = (listed.Contents ?? []).map(object => ({ Key: object.Key! }));
    if (keys.length > 0) {
        await s3.send(new DeleteObjectsCommand({ Bucket: bucket(), Delete: { Objects: keys } }));
    }
}
