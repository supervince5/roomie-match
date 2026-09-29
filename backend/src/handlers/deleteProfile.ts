import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handler(event:APIGatewayProxyEventV2WithJWTAuthorizer){
    const command = new DeleteCommand({
        TableName: "profiles",
        Key: {
            PK: "USER#" + event.requestContext.authorizer.jwt.claims.sub,
            SK: "PROFILE"
        },
        ReturnValues: "ALL_OLD"
    })
    const result = await docClient.send(command)
    if (result.Attributes === undefined){
        return{
            statusCode:404,
            body: JSON.stringify({message: "no profile found with that id"})
        }
    }
    return {
        statusCode: 200,
        body: JSON.stringify({message: "account deleted"})
    }

}