import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
    CodeMismatchException,
    ExpiredCodeException,
    InvalidPasswordException,
    LimitExceededException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";
import { resetPassword } from "../repositories/authRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { resetPasswordSchema } from "../validation/authSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { requireEnv } from "../lib/env.js";

// POST /password/reset: sets a new password using the emailed code.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    const parsed = parseBody(event.body, resetPasswordSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const body = parsed.data;
    try {
        await resetPassword(requireEnv("USER_POOL_CLIENT_ID"), body.email, body.confirmationCode, body.newPassword);
    } catch (error) {
        if (error instanceof CodeMismatchException || error instanceof UserNotFoundException) {
            return { statusCode: 400, body: JSON.stringify({ message: "That code isn't right. Check your email and try again." }) }
        } else if (error instanceof ExpiredCodeException) {
            return { statusCode: 400, body: JSON.stringify({ message: "That code expired. Request a new one." }) }
        } else if (error instanceof InvalidPasswordException) {
            return { statusCode: 400, body: JSON.stringify({ message: "Password must be at least 8 characters with uppercase, lowercase, and a number." }) }
        } else if (error instanceof LimitExceededException) {
            return { statusCode: 429, body: JSON.stringify({ message: "Too many attempts. Wait a few minutes and try again." }) }
        }
        throw error;
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Password updated. You can log in now." }) }
});
