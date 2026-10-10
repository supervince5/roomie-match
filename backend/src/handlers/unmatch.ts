import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { deleteMatch } from "../repositories/swipeRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// DELETE /matches/{userId}
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const otherId = event.pathParameters?.userId;
    if (otherId === undefined) {
        return { statusCode: 400, body: JSON.stringify({ message: "Who are you unmatching?" }) }
    }
    const removed = await deleteMatch(userId, otherId);
    if (!removed) {
        return { statusCode: 404, body: JSON.stringify({ message: "You're not matched with this person." }) }
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Unmatched" }) }
});
