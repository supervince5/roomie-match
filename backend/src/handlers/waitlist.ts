import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { joinWaitlist } from "../repositories/waitlistRepository.js";
import { waitlistSchema } from "../validation/waitlistSchema.js";

const MAX_BODY_BYTES = 2048;
const response = (statusCode: number, message: string) => ({
    statusCode,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify({ message })
});
const success = () => response(200, "You're on the list. We'll email you when Matcharoomie is ready.");
const invalid = () => response(400, "Please enter a valid email address.");

export async function handler(event: APIGatewayProxyEventV2) {
    const raw = event.body;
    if (typeof raw !== "string" || !raw) return invalid();
    const encodedLimit = Math.ceil(MAX_BODY_BYTES / 3) * 4;
    if (Buffer.byteLength(raw, "utf8") > (event.isBase64Encoded ? encodedLimit : MAX_BODY_BYTES)) {
        return response(413, "Request body is too large.");
    }

    let input: unknown;
    try {
        let json = raw;
        if (event.isBase64Encoded) {
            const bytes = Buffer.from(raw, "base64");
            // Buffer decoding is permissive; require canonical API Gateway base64.
            if (bytes.toString("base64") !== raw) return invalid();
            if (bytes.length > MAX_BODY_BYTES) return response(413, "Request body is too large.");
            json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        }
        input = JSON.parse(json);
    } catch {
        return invalid();
    }
    const parsed = waitlistSchema.safeParse(input);
    if (!parsed.success) return invalid();
    if (parsed.data.website?.trim()) return success();

    try {
        await joinWaitlist(parsed.data.email);
        return success();
    } catch {
        // Avoid the shared error wrapper: SDK errors can contain request details.
        console.error("Waitlist storage failed");
        return response(500, "We couldn't save your email. Please try again.");
    }
}
