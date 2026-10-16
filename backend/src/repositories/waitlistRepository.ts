import { createHash } from "node:crypto";
import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { requireEnv } from "../lib/env.js";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// This namespace has no school index or profile fields. Only owner/admin tools
// can retrieve these records; the application exposes no waitlist read route.
export async function joinWaitlist(email: string): Promise<void> {
    try {
        await docClient.send(new PutCommand({
            TableName: requireEnv("TABLE_NAME"),
            Item: {
                PK: `WAITLIST#${createHash("sha256").update(email).digest("hex")}`,
                SK: "SIGNUP",
                email,
                createdAt: new Date().toISOString(),
                consentVersion: "waitlist-v1"
            },
            ConditionExpression: "attribute_not_exists(PK)"
        }));
    } catch (error) {
        // A single conditional write covers retries and concurrent submissions.
        // Keep the first consent timestamp and never reveal membership.
        if (error instanceof ConditionalCheckFailedException) return;
        throw error;
    }
}
