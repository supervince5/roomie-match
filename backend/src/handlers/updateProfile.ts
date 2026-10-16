import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { updateProfile, ProfilePhotoConflict } from "../repositories/profileRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { profileSchema, profilePhotosBelongTo } from "../validation/profileSchemas.js";
import { ownView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseBody(event.body, profileSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    if (!profilePhotosBelongTo(parsed.data, userId)) {
        return { statusCode: 403, body: JSON.stringify({ message: "You can only use photos you uploaded." }) }
    }
    let updated;
    try {
        updated = await updateProfile(userId, parsed.data);
    } catch (error) {
        if (error instanceof ProfilePhotoConflict) return { statusCode: 409, body: JSON.stringify({ message: error.message }) };
        throw error;
    }
    if (updated === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "No profile to update. Create one first." }) }
    }
    return { statusCode: 200, body: JSON.stringify(await ownView(updated)) }
});
