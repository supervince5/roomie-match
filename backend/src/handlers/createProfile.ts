import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { createProfile } from "../repositories/profileRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { profileSchema } from "../validation/profileSchemas.js";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const parsed = parseBody(event.body, profileSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const profile = parsed.data;
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    await createProfile(userId, profile);
    return {
        statusCode: 200,
        body: JSON.stringify({
            id: userId,
            ...profile
        })
    }
}
