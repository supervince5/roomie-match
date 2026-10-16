import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getProfileByUserId, getProfilesBySchool, encodeCursor, decodeCursor, Profile } from "../repositories/profileRepository.js";
import { getSwipedIds } from "../repositories/swipeRepository.js";
import { publicView } from "../services/profileViews.js";
import { parseQuery } from "../validation/parseQuery.js";
import { discoverFiltersSchema, DiscoverFilters } from "../validation/discoverSchemas.js";
import { getSchool } from "../data/schools.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

const PAGE_SIZE = 20;      // profiles to send back per request
const READ_SIZE = 50;      // profiles to read from DynamoDB at a time
const MAX_READS = 5;       // stop after this many reads, even if the page isn't full yet

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
    // Profiles saved before the school list existed have no schoolId yet
    if (!me.schoolId) {
        return { statusCode: 409, body: JSON.stringify({ message: "Finish your profile before using Discover." }) }
    }

    // Browse my school unless a different one was picked
    const schoolId = filters.schoolId ?? me.schoolId;

    // 2. Where to start: the beginning, or the bookmark from the last page
    let startKey: Record<string, any> | undefined = undefined;
    if (filters.cursor !== undefined) {
        startKey = decodeCursor(filters.cursor, schoolId);
        if (startKey === undefined) {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid cursor" }) }
        }
    }

    // 3. Read my school's drawer in chunks until we have a full page of people to show.
    //    (Filters and "already swiped" can throw most of a chunk away, so one read isn't always enough.)
    const swiped = new Set(await getSwipedIds(userId));
    const results: Profile[] = [];
    let reads = 0;
    do {
        const page = await getProfilesBySchool(schoolId, READ_SIZE, startKey);
        for (const profile of page.profiles) {
            if (profile.id !== userId && !swiped.has(profile.id) && matchesFilters(profile, filters)) {
                results.push(profile);
            }
        }
        startKey = page.nextKey;
        reads++;
    } while (startKey !== undefined && results.length < PAGE_SIZE && reads < MAX_READS);

    return {
        statusCode: 200,
        body: JSON.stringify({
            school: { id: schoolId, name: getSchool(schoolId)?.name },
            profiles: await Promise.all(results.map(publicView)),
            // If there's more to read, hand the browser a bookmark for next time
            nextCursor: startKey === undefined ? null : encodeCursor(startKey)
        })
    }
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
    if (filters.maxBudget !== undefined && (!profile.budget || profile.budget.min > filters.maxBudget)) {
        return false;
    }
    if (filters.classYear !== undefined && profile.classYear !== filters.classYear) {
        return false;
    }
    if (filters.tag !== undefined && !profile.tags.includes(filters.tag)) {
        return false;
    }
    if (filters.major !== undefined && !profile.major.toLowerCase().includes(filters.major.toLowerCase())) {
        return false;
    }
    if (filters.minAge !== undefined && (profile.age === undefined || profile.age < filters.minAge)) {
        return false;
    }
    if (filters.maxAge !== undefined && (profile.age === undefined || profile.age > filters.maxAge)) {
        return false;
    }
    // Dates in YYYY-MM-DD format sort correctly as plain text
    if (filters.moveInBy !== undefined && (!profile.moveInDate || profile.moveInDate > filters.moveInBy)) {
        return false;
    }
    return true;
}
