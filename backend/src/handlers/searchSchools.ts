import { APIGatewayProxyEventV2 } from "aws-lambda";
import { searchSchools } from "../data/schools.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";

// GET /schools?q=virginia  ->  up to 10 matching schools, for the school picker
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    const query = event.queryStringParameters?.q ?? "";
    const results = searchSchools(query.slice(0, 100), 10).map(school => ({
        id: school.id,
        name: school.name,
        city: school.city,
        state: school.state
    }));
    return { statusCode: 200, body: JSON.stringify({ schools: results }) }
});
