import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { createPhotoUpload } from "../repositories/photoRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// Step 1 of uploading a photo: get a one-time permission slip to upload straight to S3.
// Step 2 (in the browser): POST the file to uploadUrl with these fields.
// Step 3: save the returned photoKey on your profile.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const upload = await createPhotoUpload(userId);
    return { statusCode: 200, body: JSON.stringify(upload) }
});
