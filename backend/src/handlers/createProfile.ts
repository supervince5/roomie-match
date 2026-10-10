import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { createProfile } from "../repositories/profileRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { profileSchema, photoBelongsTo } from "../validation/profileSchemas.js";
import { ownView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseBody(event.body, profileSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    if (!photoBelongsTo(parsed.data.photoKey, userId)) {
        return { statusCode: 403, body: JSON.stringify({ message: "You can only use photos you uploaded." }) }
    }
    const created = await createProfile(userId, parsed.data);
    if (created === undefined) {
        return {
            statusCode: 409,
            body: JSON.stringify({ message: "You already have a profile. Use PUT to update it." })
        }
    }
    return { statusCode: 201, body: JSON.stringify(await ownView(created)) }
});
