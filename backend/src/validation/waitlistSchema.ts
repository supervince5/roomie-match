import { z } from "zod";

export const waitlistSchema = z.object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    website: z.string().max(512).optional()
}).strict();
