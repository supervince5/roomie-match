import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId } from "../repositories/profileRepository.js";
import { getMatch } from "../repositories/swipeRepository.js";
import { fullView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// GET /matches/{userId}: one match's full profile (Instagram included).
// Only works if you're actually matched, so it can't be used to look up strangers.
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const otherId = event.pathParameters?.userId;
    if (otherId === undefined) {
        return { statusCode: 400, body: JSON.stringify({ message: "Which match?" }) }
    }
    const match = await getMatch(userId, otherId);
    const profile = match === undefined ? undefined : await getProfileByUserId(otherId);
    if (match === undefined || profile === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "You're not matched with this person." }) }
    }
    return { statusCode: 200, body: JSON.stringify({ ...(await fullView(profile)), matchedAt: match.matchedAt }) }
});
