import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { requireEnv } from "../lib/env.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = requireEnv("TABLE_NAME");

// How swipes and matches are filed (same table as profiles):
//
//   PK: USER#<me>   SK: SWIPE#<them>   direction: like | pass   <- my swipe on them
//   PK: USER#<me>   SK: MATCH#<them>   matchedAt                <- one copy in each person's folder

// Records my swipe. Returns false if I already swiped on this person.
export async function saveSwipe(userId: string, targetId: string, direction: "like" | "pass") {
    const command = new PutCommand({
        TableName: tableName,
        Item: {
            PK: "USER#" + userId,
            SK: "SWIPE#" + targetId,
            direction: direction,
            swipedAt: new Date().toISOString()
        },
        ConditionExpression: "attribute_not_exists(PK)" // one swipe per person
    });
    try {
        await docClient.send(command);
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            return false;
        }
        throw error;
    }
    return true;
}

// Did `fromId` like `toId`?
export async function hasLiked(fromId: string, toId: string) {
    const command = new GetCommand({
        TableName: tableName,
        Key: { PK: "USER#" + fromId, SK: "SWIPE#" + toId },
        ConsistentRead: true // read the very latest, in case they swiped a split second ago
    });
    const result = await docClient.send(command);
    return result.Item?.direction === "like";
}

// Files the match in both people's folders.
export async function saveMatch(userA: string, userB: string) {
    const matchedAt = new Date().toISOString();
    await Promise.all([
        docClient.send(new PutCommand({
            TableName: tableName,
            Item: { PK: "USER#" + userA, SK: "MATCH#" + userB, matchedAt: matchedAt }
        })),
        docClient.send(new PutCommand({
            TableName: tableName,
            Item: { PK: "USER#" + userB, SK: "MATCH#" + userA, matchedAt: matchedAt }
        }))
    ]);
}

// Everyone I've swiped on (like or pass), so Discover can hide them.
export async function getSwipedIds(userId: string) {
    const items = await queryMyFolder(userId, "SWIPE#");
    return items.map(item => (item.SK as string).replace("SWIPE#", ""));
}

// My match with one specific person, or undefined if we're not matched.
export async function getMatch(userId: string, otherId: string) {
    const result = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "MATCH#" + otherId }
    }));
    if (result.Item === undefined) {
        return undefined;
    }
    return { userId: otherId, matchedAt: result.Item.matchedAt as string };
}

// Everyone I've matched with, newest first.
export async function getMatches(userId: string) {
    const items = await queryMyFolder(userId, "MATCH#");
    return items
        .map(item => ({ userId: (item.SK as string).replace("MATCH#", ""), matchedAt: item.matchedAt as string }))
        .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}

// Unmatch: removes the match from both folders. Swipes are kept, so neither person
// shows up in the other's Discover again. Returns false if there was no match.
export async function deleteMatch(userId: string, otherId: string) {
    const result = await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { PK: "USER#" + userId, SK: "MATCH#" + otherId },
        ReturnValues: "ALL_OLD"
    }));
    if (result.Attributes === undefined) {
        return false;
    }
    await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { PK: "USER#" + otherId, SK: "MATCH#" + userId }
    }));
    return true;
}

// Delete account: everything in my folder (profile, swipes, matches),
// plus my match entry in each matched person's folder.
export async function deleteEverythingFor(userId: string) {
    const myItems = await queryMyFolder(userId, "");
    const keys = myItems.map(item => ({ PK: item.PK as string, SK: item.SK as string }));
    for (const item of myItems) {
        if ((item.SK as string).startsWith("MATCH#")) {
            const otherId = (item.SK as string).replace("MATCH#", "");
            keys.push({ PK: "USER#" + otherId, SK: "MATCH#" + userId });
        }
    }
    // DynamoDB deletes up to 25 items per batch request
    for (let i = 0; i < keys.length; i += 25) {
        const batch = keys.slice(i, i + 25).map(key => ({ DeleteRequest: { Key: key } }));
        let unprocessed: any = { [tableName]: batch };
        while (unprocessed && Object.keys(unprocessed).length > 0) {
            const result = await docClient.send(new BatchWriteCommand({ RequestItems: unprocessed }));
            unprocessed = result.UnprocessedItems;
        }
    }
    return keys.length;
}

// All items in my folder whose SK starts with a prefix ("" = everything), following DynamoDB's pages.
async function queryMyFolder(userId: string, prefix: string) {
    const items: Record<string, any>[] = [];
    let startKey: Record<string, any> | undefined = undefined;
    do {
        const result: any = await docClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: prefix === "" ? "PK = :pk" : "PK = :pk AND begins_with(SK, :prefix)",
            ExpressionAttributeValues: prefix === ""
                ? { ":pk": "USER#" + userId }
                : { ":pk": "USER#" + userId, ":prefix": prefix },
            ExclusiveStartKey: startKey
        }));
        items.push(...(result.Items ?? []));
        startKey = result.LastEvaluatedKey;
    } while (startKey !== undefined);
    return items;
}
