import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ProfileInput } from "../validation/profileSchemas.js";
import { requireEnv } from "../lib/env.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = requireEnv("TABLE_NAME");

// What the rest of the app sees. No PK/SK: those are DynamoDB's filing labels,
// and they stay inside this file.
export type Profile = ProfileInput & { id: string };

function toProfile(item: Record<string, any>): Profile {
    return {
        id: item.userId,
        name: item.name,
        age: item.age
    };
}

export async function getProfileByUserId(userId: string) {
    const command = new GetCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" }
    });
    const result = await docClient.send(command);
    if (result.Item === undefined) {
        return undefined;
    }
    return toProfile(result.Item);
}

// Returns undefined if this user already has a profile.
export async function createProfile(userId: string, profile: ProfileInput) {
    const command = new PutCommand({
        TableName: tableName,
        Item: { PK: "USER#" + userId, SK: "PROFILE", userId: userId, ...profile },
        ConditionExpression: "attribute_not_exists(PK)" // only if it doesn't exist yet
    });
    try {
        await docClient.send(command);
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            return undefined;
        }
        throw error;
    }
    return { id: userId, ...profile };
}

// Returns undefined if there's no profile to update.
export async function updateProfile(userId: string, name: string, age: number) {
    const command = new UpdateCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" },
        UpdateExpression: "SET #name = :name, age = :age",
        ConditionExpression: "attribute_exists(PK)", // only if it already exists
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": name, ":age": age },
        ReturnValues: "ALL_NEW"
    });
    let result;
    try {
        result = await docClient.send(command);
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            return undefined;
        }
        throw error;
    }
    return toProfile(result.Attributes!);
}

// Returns undefined if there was nothing to delete.
export async function deleteProfile(userId: string) {
    const command = new DeleteCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "PROFILE" },
        ReturnValues: "ALL_OLD"
    });
    const result = await docClient.send(command);
    if (result.Attributes === undefined) {
        return undefined;
    }
    return toProfile(result.Attributes);
}
