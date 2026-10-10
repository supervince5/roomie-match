import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ProfileInput } from "../validation/profileSchemas.js";
import { requireEnv } from "../lib/env.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true } // skip optional fields that weren't filled in
});
const tableName = requireEnv("TABLE_NAME");

// What the rest of the app sees. No PK/SK: those are DynamoDB's filing labels,
// and they stay inside this file.
export type Profile = ProfileInput & { id: string };

// "Virginia Tech", " virginia tech " and "VIRGINIA TECH" all file into the same drawer.
function schoolKey(school: string) {
    return "SCHOOL#" + school.trim().toLowerCase();
}

// Everything DynamoDB needs to store a profile: the profile itself plus its filing labels.
function toItem(userId: string, profile: ProfileInput) {
    return {
        PK: "USER#" + userId,
        SK: "PROFILE",
        GSI1PK: schoolKey(profile.school),
        GSI1SK: "USER#" + userId,
        userId: userId,
        ...profile
    };
}

function toProfile(item: Record<string, any>): Profile {
    // Pull out the DynamoDB-only labels; everything left over is the profile.
    const { PK, SK, GSI1PK, GSI1SK, userId, ...profile } = item;
    return { id: userId, ...profile } as Profile;
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
        Item: toItem(userId, profile),
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

// Replaces the whole profile. Returns undefined if there's no profile to update.
export async function updateProfile(userId: string, profile: ProfileInput) {
    const command = new PutCommand({
        TableName: tableName,
        Item: toItem(userId, profile),
        ConditionExpression: "attribute_exists(PK)" // only if it already exists
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

// All profiles at a school, using the school index (a Query, not a Scan).
export async function getProfilesBySchool(school: string, limit: number) {
    const command = new QueryCommand({
        TableName: tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :school",
        ExpressionAttributeValues: { ":school": schoolKey(school) },
        Limit: limit
    });
    const result = await docClient.send(command);
    return (result.Items ?? []).map(toProfile);
}
