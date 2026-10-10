import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId, getProfilesBySchool, Profile } from "../repositories/profileRepository.js";
import { getSwipedIds } from "../repositories/swipeRepository.js";
import { parseQuery } from "../validation/parseQuery.js";
import { discoverFiltersSchema, DiscoverFilters } from "../validation/discoverSchemas.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseQuery(event.queryStringParameters, discoverFiltersSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const filters = parsed.data;
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;

    // 1. Which school am I at?
    const me = await getProfileByUserId(userId);
    if (me === undefined) {
        return { statusCode: 404, body: JSON.stringify({ message: "Create your profile before using Discover." }) }
    }

    // 2. Everyone at my school, minus me and anyone I've already swiped on,
    //    narrowed down by whatever filters were picked
    const schoolmates = await getProfilesBySchool(me.school, 50);
    const swiped = new Set(await getSwipedIds(userId));
    const profiles = schoolmates
        .filter(profile => profile.id !== userId)
        .filter(profile => !swiped.has(profile.id))
        .filter(profile => matchesFilters(profile, filters));

    return { statusCode: 200, body: JSON.stringify({ profiles: profiles }) }
});

// A filter that wasn't picked (undefined) lets everyone through.
function matchesFilters(profile: Profile, filters: DiscoverFilters) {
    if (filters.sleepSchedule !== undefined && profile.sleepSchedule !== filters.sleepSchedule) {
        return false;
    }
    if (filters.cleanliness !== undefined && profile.cleanliness !== filters.cleanliness) {
        return false;
    }
    if (filters.smoking !== undefined && profile.smoking !== filters.smoking) {
        return false;
    }
    if (filters.pets !== undefined && profile.pets !== filters.pets) {
        return false;
    }
    if (filters.maxBudget !== undefined && profile.budget.min > filters.maxBudget) {
        return false;
    }
    if (filters.classYear !== undefined && profile.classYear !== filters.classYear) {
        return false;
    }
    if (filters.tag !== undefined && !profile.tags.includes(filters.tag)) {
        return false;
    }
    return true;
}
