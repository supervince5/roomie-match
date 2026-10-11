import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { deleteSwipe, deleteMatch } from "../repositories/swipeRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// DELETE /swipes/{userId}: undo your swipe on someone. They'll show up in Discover again.
// If that swipe had made a match, the match is removed too.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const targetId = event.pathParameters?.userId;
    if (targetId === undefined) {
        return { statusCode: 400, body: JSON.stringify({ message: "Whose swipe are you undoing?" }) }
    }
    const removed = await deleteSwipe(userId, targetId);
    if (!removed) {
        return { statusCode: 404, body: JSON.stringify({ message: "You haven't swiped on this person." }) }
    }
    const unmatched = await deleteMatch(userId, targetId);
    return { statusCode: 200, body: JSON.stringify({ message: "Swipe undone", unmatched: unmatched }) }
});
