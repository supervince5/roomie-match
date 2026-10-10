import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ProfileInput } from "../validation/profileSchemas.js";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = requireEnv("TABLE_NAME");

export async function getProfileByUserId(userId: string) {
    const command = new GetCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" }
    });
    const result = await docClient.send(command);
    return result.Item;
}

export async function createProfile(userId: string, profile: ProfileInput) {
    const command = new PutCommand({
        TableName: tableName,
        Item: { PK: "USER#" + userId, SK: "PROFILE", userId: userId, ...profile }
    });
    await docClient.send(command);
}

export async function updateProfile(userId: string, name: string, age: number) {
    const command = new UpdateCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" },
        UpdateExpression: "SET #name = :name, age = :age",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": name, ":age": age },
        ReturnValues: "ALL_NEW"
    });
    const result = await docClient.send(command);
    return result.Attributes;
}

export async function deleteProfile(userId: string) {
    const command = new DeleteCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" },
        ReturnValues: "ALL_OLD"
    });
    const result = await docClient.send(command);
    return result.Attributes;
}