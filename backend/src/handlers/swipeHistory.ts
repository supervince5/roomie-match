import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfilesByUserIds } from "../repositories/profileRepository.js";
import { getRecentSwipes, getMatches } from "../repositories/swipeRepository.js";
import { publicView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

const HISTORY_SIZE = 15;

// GET /swipes: your last 15 swipes, newest first, with each person's profile.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const swipes = await getRecentSwipes(userId, HISTORY_SIZE);
    const profiles = await getProfilesByUserIds(swipes.map(swipe => swipe.userId));
    const matchedIds = new Set((await getMatches(userId)).map(match => match.userId));

    const history = [];
    for (const swipe of swipes) {
        const profile = profiles.get(swipe.userId);
        if (profile === undefined) {
            continue; // they deleted their account
        }
        history.push({
            direction: swipe.direction,
            swipedAt: swipe.swipedAt,
            matched: matchedIds.has(swipe.userId),
            profile: await publicView(profile)
        });
    }
    return { statusCode: 200, body: JSON.stringify({ history: history }) }
});
