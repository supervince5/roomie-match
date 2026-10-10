import { z } from "zod";

type ParseResult<T> =
    | { success: true; data: T }
    | { success: false; response: { statusCode: number; body: string } };

// Turns a raw request body into validated, typed data,
// or into a ready-to-return 400 response explaining what's wrong.
export function parseBody<T>(rawBody: string | undefined, schema: z.ZodType<T>): ParseResult<T> {
    if (rawBody === undefined) {
        return badRequest("Missing request body");
    }

    let json: unknown;
    try {
        json = JSON.parse(rawBody);
    } catch {
        return badRequest("Request body is not valid JSON");
    }

    const result = schema.safeParse(json);
    if (!result.success) {
        const errors = result.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
        }));
        return badRequest("Invalid request body", errors);
    }

    return { success: true, data: result.data };
}

export function badRequest(message: string, errors?: { field: string; message: string }[]) {
    return {
        success: false as const,
        response: {
            statusCode: 400,
            body: JSON.stringify({ message: message, errors: errors })
        }
    };
}
