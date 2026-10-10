import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { updateProfile } from "../repositories/profileRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { profileSchema } from "../validation/profileSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseBody(event.body, profileSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const updated = await updateProfile(userId, parsed.data.name, parsed.data.age);
    return { statusCode: 200, body: JSON.stringify(updated) }
});
