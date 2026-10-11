import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { getMatch } from "../repositories/swipeRepository.js";
import { getConversation, saveMessage } from "../repositories/messageRepository.js";
import { withErrorHandling } from "../lib/withErrorHandling.js";
import { parseBody } from "../validation/parseBody.js";
import { messageSchema } from "../validation/messageSchemas.js";
export const handler = withErrorHandling(async (event: APIGatewayProxyEventV2WithJWTAuthorizer) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub as string;
  const peer = event.pathParameters?.userId;
  if (!peer || peer === userId) return { statusCode: 400, body: JSON.stringify({message:"Choose a match to start a conversation."}) };
  const [mine, theirs] = await Promise.all([getMatch(userId,peer),getMatch(peer,userId)]);
  if (!mine || !theirs || mine.matchedAt !== theirs.matchedAt) return {statusCode:403,body:JSON.stringify({message:"Messaging is only available between current mutual matches."})};
  if (event.requestContext.http.method === "GET") {
    return {statusCode:200,body:JSON.stringify({messages:await getConversation(userId,peer,mine.matchedAt)})};
  }
  const parsed = parseBody(event.body,messageSchema);
  if (!parsed.success) return parsed.response;
  try {
    const message = await saveMessage(userId,peer,mine.matchedAt,parsed.data.clientId,parsed.data.text);
    return {statusCode:201,body:JSON.stringify({message})};
  } catch(error) {
    if(error instanceof Error && error.message === "MATCH_ENDED") return {statusCode:403,body:JSON.stringify({message:"This match has ended. Your message was not sent."})};
    if(error instanceof Error && error.message === "MESSAGE_ID_CONFLICT") return {statusCode:409,body:JSON.stringify({message:"This message changed during a retry. Edit it and send again."})};
    throw error;
  }
});
