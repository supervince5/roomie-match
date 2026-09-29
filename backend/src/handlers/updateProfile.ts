import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer ){
    if (event.body === undefined){
        return {
            statusCode: 400,
            body: JSON.stringify({message: "missing name and age"})
        }
    }
    const body = JSON.parse(event.body);
    const command = new UpdateCommand({
        TableName: "profiles",
        Key: {
            PK: "USER#" + event.requestContext.authorizer.jwt.claims.sub, 
            SK: "PROFILE",
        },
        UpdateExpression: "SET #name = :name, age = :age",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": body.name,
            ":age": body.age
        },
        ReturnValues: "ALL_NEW"
        });
    const response = await docClient.send(command);
    return{
        statusCode: 200,
        body: JSON.stringify(response.Attributes)
    }
}

