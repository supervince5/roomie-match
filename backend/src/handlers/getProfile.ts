import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId } from "../repositories/profileRepository.js";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const profile = await getProfileByUserId(userId);
    if (profile === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "User not found" }) }
    }
    return { statusCode: 200, body: JSON.stringify(profile) }
}