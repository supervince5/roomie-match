import { APIGatewayProxyEventV2 } from "aws-lambda";
import { confirmSignUp } from "../repositories/authRepository.js";
import {
    CodeMismatchException,
    ExpiredCodeException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";

export async function handler(event:APIGatewayProxyEventV2){
    const rawBody = event.body;
    if (rawBody === undefined){
        return{
            statusCode: 400,
            body: JSON.stringify({message: "Missing body request"})
        }
    }
    const body = JSON.parse(rawBody)
    const ClientID = process.env.USER_POOL_CLIENT_ID;
    if (ClientID === undefined){
        return{
            statusCode: 500,
            body: JSON.stringify({message: "Client ID not created"})
        }
    }



    try{
        await confirmSignUp(ClientID, body.email, body.confirmationCode);
    } catch(error:any){
        if (error instanceof CodeMismatchException) {
            return{
                statusCode: 400,
                body: JSON.stringify({message: "The code you entered is invalid. Please try again."})
            }
        } else if (error instanceof ExpiredCodeException) {
            return{
                statusCode: 400,
                body: JSON.stringify({message: "This code has expired. Please request a new one."})
            }
        } else if (error instanceof UserNotFoundException) {
            return{
                statusCode: 404,
                body: JSON.stringify({message: "No user found with that username."})
            }
        } else {
            return{
                statusCode: 500,
                body: JSON.stringify({message: "An unexpected error occurred."})
            }
        }
    }
    return{
        statusCode: 200,
        body: JSON.stringify({message: "Email Verified"})
    }
}