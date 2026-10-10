import { APIGatewayProxyEventV2 } from "aws-lambda";
import { login } from "../repositories/authRepository.js";
import {
    NotAuthorizedException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";
import { parseBody } from "../validation/parseBody.js";
import { loginSchema } from "../validation/authSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { requireEnv } from "../lib/env.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    const parsed = parseBody(event.body, loginSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const body = parsed.data;
    const clientId = requireEnv("USER_POOL_CLIENT_ID");
    let token;
    try {
        token = await login(clientId, body.email, body.password);
    } catch (error) {
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
        }
        throw error; // not one we planned for, so the safety net handles it
    }
    if (token === undefined) {
        throw new Error("Login succeeded but Cognito returned no token");
    }
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Authenticated", token: token })
    }
});
