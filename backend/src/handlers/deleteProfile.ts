import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { deleteProfile } from "../repositories/profileRepository.js";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const deleted = await deleteProfile(userId);
    if (deleted === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "no profile found with that id" }) }
    }
    return { statusCode: 200, body: JSON.stringify({ message: "account deleted" }) }
}