import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId } from "../repositories/profileRepository.js";
import { saveSwipe, hasLiked, saveMatch } from "../repositories/swipeRepository.js";
import { parseBody } from "../validation/parseBody.js";
import { swipeSchema } from "../validation/swipeSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseBody(event.body, swipeSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const targetId = parsed.data.targetId;
    const direction = parsed.data.direction;
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    if (targetId === userId) {
        return { statusCode: 400, body: JSON.stringify({ message: "You can't swipe on yourself." }) }
    }
    const target = await getProfileByUserId(targetId);
    if (target === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "That person doesn't exist." }) }
    }

    // 1. Save my swipe first...
    const saved = await saveSwipe(userId, targetId, direction);
    if (!saved) {
        return { statusCode: 409, body: JSON.stringify({ message: "You already swiped on this person." }) }
    }

    // 2. ...then, if it was a like, check whether they already liked me.
    // (Saving first means if we both swipe at the same moment, at least one of us sees the other's like.)
    let matched = false;
    if (direction === "like" && await hasLiked(targetId, userId)) {
        await saveMatch(userId, targetId);
        matched = true;
    }

    return { statusCode: 201, body: JSON.stringify({ matched: matched }) }
});
