// The one place that knows how to talk to the backend.
// Every page calls apiRequest(...) instead of fetch(...) directly, so the API address,
// the login token, and error handling all live here.

const API_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "roomie.token";

export type FieldError = { field: string; message: string };

// Thrown when the API answers with an error status (400, 404, 409, 500, ...)
export class ApiError extends Error {
  status: number;
  errors: FieldError[];

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token !== null) {
    headers["Authorization"] = "Bearer " + token;
  }

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method: options.method ?? "GET",
      headers: headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your internet connection.");
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Token missing or expired: forget it and let the app send you to the login screen
    setToken(null);
    window.dispatchEvent(new Event("roomie:logged-out"));
  }
  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? data.error ?? "Something went wrong.", data.errors);
  }
  return data as T;
}
