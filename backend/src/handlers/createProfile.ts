import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
    const rawBody = event.body;
    if (rawBody === undefined){
        return{
            statusCode: 400,
            body: JSON.stringify({error: "Missing request body"})
        }
    }
    const body = JSON.parse(rawBody);
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const command = new PutCommand({
        TableName: "profiles",
        Item: {
            PK: "USER#" + userId, 
            SK: "PROFILE",
            userId: userId,
            ...body        // spreads all the fields from body (name, age, etc.) into this object
        }
    });

    await docClient.send(command);
    return{
        statusCode: 200,
        body: JSON.stringify({
            id: userId, 
            ...body
        })
    }
}