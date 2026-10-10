import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    AdminDeleteUserCommand,
    UserNotFoundException
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
// Cognito emails a 6-digit reset code.
export async function forgotPassword(clientId: string, email: string) {
    await cognitoClient.send(new ForgotPasswordCommand({ ClientId: clientId, Username: email }));
}

export async function resetPassword(clientId: string, email: string, code: string, newPassword: string) {
    await cognitoClient.send(new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
    }));
}

// Removes the login itself. Admin-only call, so the Lambda needs IAM permission for it.
// If the login is already gone, that counts as done (so a retried delete still succeeds).
export async function deleteLogin(userPoolId: string, userId: string) {
    try {
        await cognitoClient.send(new AdminDeleteUserCommand({ UserPoolId: userPoolId, Username: userId }));
    } catch (error) {
        if (!(error instanceof UserNotFoundException)) {
            throw error;
        }
    }
}
