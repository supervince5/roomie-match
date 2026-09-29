import { CognitoIdentityProviderClient, InitiateAuthCommand, InvalidPasswordException, NotAuthorizedException, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";
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
    const command = new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters:{
            USERNAME: body.email,
            PASSWORD: body.password
        }
    });
    let response;
    try{
        response = await cognitoClient.send(command)
    } catch (error:any){
        if (error instanceof UserNotFoundException) {
                    return{
                        statusCode: 400,
                        body: JSON.stringify({message: "The username you entered is invalid. Please try again."})
                    }
        }
        if (error instanceof NotAuthorizedException) {
                    return{
                        statusCode: 400,
                        body: JSON.stringify({message: "The password you entered is invalid. Please try again."})
                    }
        }
        else{
            return{
                statusCode: 500,
                body: JSON.stringify({message: "Unexpected Error Occured."})
            }
        }
    }
    if (response.AuthenticationResult === undefined){
        return{
            statusCode: 500,
            body: JSON.stringify({message: "Missing Authentication Result"})
        }
    }
    return{
        statusCode: 200,
        body: JSON.stringify({
            message: "Authenticated", 
            token: response.AuthenticationResult.IdToken
        })
    }
}