import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { createProfile} from "../repositories/profileRepository.js";


export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const rawBody = event.body;
    if (rawBody === undefined){
        return{
            statusCode: 400,
            body: JSON.stringify({error: "Missing request body"})
        }
    }
    const body = JSON.parse(rawBody);
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    await createProfile(userId, body);
    return{
        statusCode: 200,
        body: JSON.stringify({
            id: userId, 
            ...body
        })
    }
}