import { z } from "zod";
export const messageSchema = z.object({
  text: z.string().trim().min(1, "Write a message first.").max(2000, "Keep messages under 2,000 characters."),
  clientId: z.uuid()
}).strict();
