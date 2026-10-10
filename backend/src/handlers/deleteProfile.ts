import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { deleteProfile } from "../repositories/profileRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const deleted = await deleteProfile(userId);
    if (deleted === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "No profile to delete" }) }
    }
    return { statusCode: 200, body: JSON.stringify({ message: "profile deleted" }) }
});
