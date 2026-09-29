import { APIGatewayProxyEventV2 } from "aws-lambda";


export async function handler(event: APIGatewayProxyEventV2 ){
    return{
        statusCode: 200,
        body: JSON.stringify({message: "HEALTH CHECK PASSED"})
    }

}