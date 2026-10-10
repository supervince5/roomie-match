import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { updateProfile } from "../repositories/profileRepository.js";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    if (event.body === undefined) {
        return { statusCode: 400, body: JSON.stringify({ message: "missing name and age" }) }
    }
    const body = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const updated = await updateProfile(userId, body.name, body.age);
    return { statusCode: 200, body: JSON.stringify(updated) }
}