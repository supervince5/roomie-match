import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { deleteEverythingFor } from "../repositories/swipeRepository.js";
import { deleteAllPhotos } from "../repositories/photoRepository.js";
import { deleteLogin } from "../repositories/authRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { requireEnv } from "../lib/env.js";

// DELETE /account: removes your data, your photos, and finally your login.
// The login goes last, so if anything fails partway you can still log in and try again.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const userPoolId = requireEnv("USER_POOL_ID");

    await deleteEverythingFor(userId);
    await deleteAllPhotos(userId);
    await deleteLogin(userPoolId, userId);

    return { statusCode: 200, body: JSON.stringify({ message: "Account deleted" }) }
});
