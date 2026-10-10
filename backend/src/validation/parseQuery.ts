import { z } from "zod";
import { badRequest } from "./parseBody.js";

type ParseResult<T> =
    | { success: true; data: T }
    | { success: false; response: { statusCode: number; body: string } };

// Same bouncer as parseBody, but for the ?key=value part of the URL.
export function parseQuery<T>(params: Record<string, string | undefined> | undefined, schema: z.ZodType<T>): ParseResult<T> {
    const result = schema.safeParse(params ?? {});
    if (!result.success) {
        const errors = result.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
        }));
        return badRequest("Invalid filters", errors);
    }
    return { success: true, data: result.data };
}
