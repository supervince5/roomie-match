import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId } from "../repositories/profileRepository.js";
import { getMatches } from "../repositories/swipeRepository.js";
import { fullView } from "../services/profileViews.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const matches = await getMatches(userId);

    // Look up each match's profile (in parallel). Skip anyone who has since deleted theirs.
    const withProfiles = await Promise.all(matches.map(async match => {
        const profile = await getProfileByUserId(match.userId);
        if (profile === undefined) {
            return undefined;
        }
        return { ...(await fullView(profile)), matchedAt: match.matchedAt };
    }));
    const profiles = withProfiles.filter(profile => profile !== undefined);

    return { statusCode: 200, body: JSON.stringify({ matches: profiles }) }
});
