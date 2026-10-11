import { DynamoDBClient, TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand, type QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { requireEnv } from "../lib/env.js";
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TableName = requireEnv("TABLE_NAME");
export type Message = { id: string; senderId: string; text: string; createdAt: string };
const key = (owner: string, peer: string, id: string) => ({ PK: `USER#${owner}`, SK: `MESSAGE#${peer}#${id}` });
function view(item: Record<string, unknown>): Message {
  return { id: item.id as string, senderId: item.senderId as string, text: item.text as string, createdAt: item.createdAt as string };
}
// Copies live in each participant's folder, so normal account cleanup removes them.
export async function getConversation(userId: string, peer: string, matchedAt: string) {
  const messages: Message[] = [];
  let cursor: Record<string, any> | undefined;
  do {
    const result: QueryCommandOutput = await db.send(new QueryCommand({
      TableName, KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":prefix": `MESSAGE#${peer}#` },
      ExclusiveStartKey: cursor, ConsistentRead: true
    }));
    for (const item of result.Items ?? []) if (item.matchedAt === matchedAt) messages.push(view(item));
    cursor = result.LastEvaluatedKey;
  } while (cursor);
  // Keep the initial chat payload bounded; the UI calls out this recent-message window.
  return messages.sort((a,b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).slice(-100);
}
export async function saveMessage(userId: string, peer: string, matchedAt: string, id: string, text: string) {
  async function existing() {
    const result = await db.send(new GetCommand({ TableName, Key: key(userId, peer, id), ConsistentRead: true }));
    if (!result.Item) return undefined;
    if (result.Item.matchedAt !== matchedAt || result.Item.senderId !== userId || result.Item.text !== text) throw new Error("MESSAGE_ID_CONFLICT");
    return view(result.Item);
  }
  const previous = await existing();
  if (previous) return previous;
  const message: Message = { id, senderId: userId, text, createdAt: new Date().toISOString() };
  try {
    // Matching is checked again inside the transaction, preventing a send racing an unmatch.
    await db.send(new TransactWriteCommand({ TransactItems: [
      ...[[userId,peer],[peer,userId]].map(([owner,other]) => ({ ConditionCheck: {
        TableName, Key: { PK: `USER#${owner}`, SK: `MATCH#${other}` },
        ConditionExpression: "attribute_exists(PK) AND matchedAt = :matchedAt",
        ExpressionAttributeValues: { ":matchedAt": matchedAt }
      }})),
      ...[[userId,peer],[peer,userId]].map(([owner,other]) => ({ Put: {
        TableName, Item: { ...key(owner,other,id), ...message, matchedAt },
        ConditionExpression: "attribute_not_exists(PK)"
      }}))
    ] }));
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      const saved = await existing();
      if (saved) return saved;
      throw new Error("MATCH_ENDED");
    }
    throw error;
  }
  return message;
}
