import { APIGatewayProxyEventV2 } from "aws-lambda";
import { withErrorHandling } from "../lib/withErrorHandling.js";


export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2) => {
    return{
        statusCode: 200,
        body: JSON.stringify({message: "HEALTH CHECK PASSED"})
    }
});
