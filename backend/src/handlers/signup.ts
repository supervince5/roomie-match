import { APIGatewayProxyEventV2 } from "aws-lambda";
import { signUp } from "../repositories/authRepository.js";
import {
    UsernameExistsException,
    InvalidPasswordException,
    InvalidParameterException
} from "@aws-sdk/client-cognito-identity-provider";
import { parseBody } from "../validation/parseBody.js";
import { signupSchema } from "../validation/authSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { requireEnv } from "../lib/env.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    const parsed = parseBody(event.body, signupSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const body = parsed.data;
    const clientId = requireEnv("USER_POOL_CLIENT_ID");
    try {
        await signUp(clientId, body.email, body.password);
    } catch (error) {
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
        }
        throw error; // not one we planned for, so the safety net handles it
    }
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "User Created" })
    }
});
