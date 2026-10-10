import { z } from "zod";

// The one place that defines what a valid profile looks like.
// .strict() rejects any field not listed here (like "isAdmin").
export const profileSchema = z.object({
    name: z.string().trim().min(1, "Name can't be empty").max(50),
    age: z.number().int().min(17).max(100)
}).strict();

// The TypeScript type, generated from the schema so the two can never drift apart.
export type ProfileInput = z.infer<typeof profileSchema>;
