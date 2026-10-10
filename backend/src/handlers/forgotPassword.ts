import { APIGatewayProxyEventV2 } from "aws-lambda";
import { LimitExceededException, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
import { forgotPassword } from "../repositories/authRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { forgotPasswordSchema } from "../validation/authSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { requireEnv } from "../lib/env.js";

// POST /password/forgot: emails a reset code.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    const parsed = parseBody(event.body, forgotPasswordSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    try {
        await forgotPassword(requireEnv("USER_POOL_CLIENT_ID"), parsed.data.email);
    } catch (error) {
        if (error instanceof LimitExceededException) {
            return { statusCode: 429, body: JSON.stringify({ message: "Too many attempts. Wait a few minutes and try again." }) }
        }
        // Same answer whether or not the email has an account, so strangers can't use
        // this form to check who's signed up.
        if (!(error instanceof UserNotFoundException)) {
            throw error;
        }
    }
    return { statusCode: 200, body: JSON.stringify({ message: "If that email has an account, we sent it a reset code." }) }
});
