import { APIGatewayProxyEventV2 } from "aws-lambda";
import { login } from "../repositories/authRepository.js";
import {
    NotAuthorizedException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";

export async function handler(event: APIGatewayProxyEventV2) {
    const rawBody = event.body;
    if (rawBody === undefined) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" })
        }
    }
    const body = JSON.parse(rawBody);
    const clientId = process.env.USER_POOL_CLIENT_ID;
    if (clientId === undefined) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "ClientID not created" })
        }
    }
    let token;
    try {
        token = await login(clientId, body.email, body.password);
    } catch (error: any) {
        if (error instanceof UserNotFoundException) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "The username you entered is invalid. Please try again." })
            }
        } else if (error instanceof NotAuthorizedException) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "The password you entered is invalid. Please try again." })
            }
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Unexpected error occurred." })
            }
        }
    }
    if (token === undefined) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Login succeeded but no token was returned." })
        }
    }
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Authenticated", token: token })
    }
}