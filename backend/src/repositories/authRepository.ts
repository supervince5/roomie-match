import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({});

export async function signUp(clientId: string, email: string, password: string) {
    const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email }
        ]
    });
    await cognitoClient.send(command)
}

export async function confirmSignUp(clientId: string, email: string, confirmationCode: string) {
    const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: confirmationCode
    })
    await cognitoClient.send(command);
}

export async function login(clientId: string, email: string, password: string) {
    const command = new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password
        }
    });
    const response = await cognitoClient.send(command);
    return response.AuthenticationResult?.IdToken;
}