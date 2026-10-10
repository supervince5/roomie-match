import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

// Everyone I've matched with, newest first.
export async function getMatches(userId: string) {
    const items = await queryMyFolder(userId, "MATCH#");
    return items
        .map(item => ({ userId: (item.SK as string).replace("MATCH#", ""), matchedAt: item.matchedAt as string }))
        .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}

// All items in my folder whose SK starts with a prefix, following DynamoDB's pages.
async function queryMyFolder(userId: string, prefix: string) {
    const items: Record<string, any>[] = [];
    let startKey: Record<string, any> | undefined = undefined;
    do {
        const result: any = await docClient.send(new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
            ExpressionAttributeValues: { ":pk": "USER#" + userId, ":prefix": prefix },
            ExclusiveStartKey: startKey
        }));
        items.push(...(result.Items ?? []));
        startKey = result.LastEvaluatedKey;
    } while (startKey !== undefined);
    return items;
}
