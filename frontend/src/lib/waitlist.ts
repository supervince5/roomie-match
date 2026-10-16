export async function submitWaitlist(endpoint: string | undefined, email: string, website = "", request: typeof fetch = fetch) {
  if (!endpoint) throw new Error("the waitlist isn’t available right now. please try again later.");
  let response: Response;
  try {
    response = await request(`${endpoint.replace(/\/$/, "")}/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), website }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("we couldn’t confirm your spot. check your connection and try again.");
  }
  if (!response.ok) {
    throw new Error(response.status === 400 ? "please check your email address and try again."
      : response.status === 429 ? "a few too many tries. give it a moment, then try again."
      : "we couldn’t save your email. please try again.");
  }
  // A proxy error page must never masquerade as a saved signup.
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object" || !("message" in body) || typeof body.message !== "string") {
    throw new Error("we couldn’t confirm your spot. please try again.");
  }
}
