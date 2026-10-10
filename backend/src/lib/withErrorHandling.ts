export type HttpResponse = { statusCode: number; body: string };

// The safety net. Wrap any handler with this, and if anything inside it
// throws an error nobody planned for, we:
//   1. log the real error to CloudWatch, so we can find out what broke
//   2. send the user a calm, consistent 500 instead of a crash
export function withErrorHandling<E>(handler: (event: E) => Promise<HttpResponse>) {
    return async (event: E): Promise<HttpResponse> => {
        try {
            return await handler(event);
        } catch (error) {
            console.error("Unhandled error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Something went wrong on our end. Please try again." })
            };
        }
    };
}
