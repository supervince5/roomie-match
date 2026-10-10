import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ProfileInput } from "../validation/profileSchemas.js";
import { requireEnv } from "../lib/env.js";
import { getSchool } from "../data/schools.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true } // skip optional fields that weren't filled in
});
const tableName = requireEnv("TABLE_NAME");

// What the rest of the app sees. No PK/SK: those are DynamoDB's filing labels,
// and they stay inside this file.
export type Profile = ProfileInput & { id: string; school: string };

// Profiles are filed by the school's official id, so spelling can never split a school in two.
function schoolKey(schoolId: number) {
    return "SCHOOL#" + schoolId;
}

// Everything DynamoDB needs to store a profile: the profile itself plus its filing labels.
function toItem(userId: string, profile: ProfileInput) {
    return {
        PK: "USER#" + userId,
        SK: "PROFILE",
        GSI1PK: schoolKey(profile.schoolId),
        GSI1SK: "USER#" + userId,
        userId: userId,
        ...profile,
        school: getSchool(profile.schoolId)?.name // stored so reads don't need a lookup
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
    return toProfile(toItem(userId, profile));
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
    return toProfile(toItem(userId, profile));
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

// One page of profiles at a school, using the school index (a Query, not a Scan).
// DynamoDB hands back a bookmark (LastEvaluatedKey) when there's more; we pass it back in to continue.
export async function getProfilesBySchool(schoolId: number, limit: number, startKey?: Record<string, any>) {
    const command = new QueryCommand({
        TableName: tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :school",
        ExpressionAttributeValues: { ":school": schoolKey(schoolId) },
        Limit: limit,
        ExclusiveStartKey: startKey
    });
    const result = await docClient.send(command);
    return {
        profiles: (result.Items ?? []).map(toProfile),
        nextKey: result.LastEvaluatedKey
    };
}

// The bookmark goes to the browser as an opaque string ("cursor") and comes back on the next request.
export function encodeCursor(key: Record<string, any>) {
    return Buffer.from(JSON.stringify(key)).toString("base64url");
}

// Never trust a cursor from the browser: it must be a bookmark into *your* school's drawer.
export function decodeCursor(cursor: string, schoolId: number) {
    try {
        const key = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        const looksRight = key.GSI1PK === schoolKey(schoolId)
            && typeof key.GSI1SK === "string" && typeof key.PK === "string" && typeof key.SK === "string"
            && Object.keys(key).length === 4;
        return looksRight ? key : undefined;
    } catch {
        return undefined;
    }
}
