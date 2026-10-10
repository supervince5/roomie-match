import { APIGatewayProxyEventV2 } from "aws-lambda";
import { signUp } from "../repositories/authRepository.js";
import {
    UsernameExistsException,
    InvalidPasswordException,
    InvalidParameterException
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
    try {
        await signUp(clientId, body.email, body.password);
    } catch (error: any) {
        if (error instanceof UsernameExistsException) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: "An account with this email already exists." })
            }
        } else if (error instanceof InvalidPasswordException) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Password must be at least 8 characters with uppercase, lowercase, and a number." })
            }
        } else if (error instanceof InvalidParameterException) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid email or password format." })
            }
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "An unexpected error occurred." })
            }
        }
    }
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "User Created" })
    }
}