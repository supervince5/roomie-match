import { z } from "zod";

export const swipeSchema = z.object({
    targetId: z.string().min(1, "Who are you swiping on?"),
    direction: z.enum(["like", "pass"])
}).strict();

export type SwipeInput = z.infer<typeof swipeSchema>;
