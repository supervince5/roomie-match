import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { z } from "zod";
import { getProfileByUserId, getProfilesBySchool, Profile } from "../repositories/profileRepository.js";
import { getSwipedIds } from "../repositories/swipeRepository.js";
import { publicView } from "../services/profileViews.js";
import { parseQuery } from "../validation/parseQuery.js";
import { getSchool } from "../data/schools.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

const searchSchema = z.object({
    q: z.string().trim().min(2, "Type at least 2 letters").max(50),
    schoolId: z.coerce.number().int().refine(id => getSchool(id) !== undefined, "Pick a school from the list").optional()
}).strict();

const MAX_RESULTS = 20;
const MAX_READS = 10; // up to 500 profiles scanned per search; fine for now (see note below)

// GET /people?q=maya: students at your school (or another school) whose name matches.
// Note: this reads the school's profiles and checks each one. That's fine for hundreds of
// students per school; at real scale you'd add a search service (like OpenSearch).
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
    const parsed = parseQuery(event.queryStringParameters, searchSchema);
    if (!parsed.success) {
        return parsed.response;
    }
    const userId = event.requestContext.authorizer.jwt.claims.sub as string;
    const me = await getProfileByUserId(userId);
    if (me === undefined || !me.schoolId) {
        return { statusCode: 409, body: JSON.stringify({ message: "Finish your profile before searching." }) }
    }
    const schoolId = parsed.data.schoolId ?? me.schoolId;
    const q = parsed.data.q.toLowerCase();

    const results: Profile[] = [];
    let startKey: Record<string, any> | undefined = undefined;
    let reads = 0;
    do {
        const page = await getProfilesBySchool(schoolId, 50, startKey);
        for (const profile of page.profiles) {
            if (profile.name.toLowerCase().includes(q) && profile.id !== userId) {
                results.push(profile);
            }
        }
        startKey = page.nextKey;
        reads++;
    } while (startKey !== undefined && results.length < MAX_RESULTS && reads < MAX_READS);

    // Say which ones you've already swiped on, so the app can show it
    const swiped = new Set(await getSwipedIds(userId));
    const people = await Promise.all(results.slice(0, MAX_RESULTS).map(async profile => ({
        ...(await publicView(profile)),
        swiped: swiped.has(profile.id)
    })));
    return { statusCode: 200, body: JSON.stringify({ people: people }) }
});
