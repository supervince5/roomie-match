import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId } from "../repositories/profileRepository.js";
import { getSwipe, getMatch } from "../repositories/swipeRepository.js";
import { fullView, publicView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// GET /people/{userId}: someone's profile, plus whether you've swiped on or matched with them.
// Instagram is only included if you're matched.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const otherId = event.pathParameters?.userId;
    const profile = otherId === undefined ? undefined : await getProfileByUserId(otherId);
    if (otherId === undefined || profile === undefined || otherId === userId) {
        return { statusCode: 404, body: JSON.stringify({ message: "That person doesn't exist." }) }
    }
    const [swipe, match] = await Promise.all([getSwipe(userId, otherId), getMatch(userId, otherId)]);
    const view = match ? await fullView(profile) : await publicView(profile);
    return {
        statusCode: 200,
        body: JSON.stringify({ profile: view, swipe: swipe ?? null, matched: match !== undefined })
    }
});
