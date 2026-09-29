import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEventV2 } from "aws-lambda";


const cognitoClient = new CognitoIdentityProviderClient({});

export async function handler(event: APIGatewayProxyEventV2){
    const rawBody = event.body;
    if (rawBody === undefined){
        return{
            statusCode: 400,
            body: JSON.stringify({error: "Missing request body"})
        }
    }
    const body = JSON.parse(rawBody);
    const clientId = process.env.USER_POOL_CLIENT_ID;
    if (clientId === undefined){
        return{
            statusCode: 500,
            body: JSON.stringify({error: "ClientID not created"})
        }
    }
    const command = new SignUpCommand({
        ClientId: clientId,
        Username: body.email,
        Password: body.password,
        UserAttributes: [
            { Name: "email", Value: body.email }
        ]
    });
    await cognitoClient.send(command)
    return{
        statusCode: 200,
        body: JSON.stringify({message: "User Created"})
    }

}