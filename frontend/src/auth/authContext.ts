import { createContext, useContext } from "react";

export type AuthState = {
  token: string | null;
  userId: string | null; // the "sub" claim inside the token: your Cognito user id
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (auth === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return auth;
}

// A JWT is three base64 chunks: header.payload.signature. The payload holds the claims.
// (Reading it is fine; only the backend can *verify* it.)
export function readTokenClaims(token: string): { sub?: string; exp?: number } {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export function isExpired(token: string) {
  const exp = readTokenClaims(token).exp;
  return exp === undefined || exp * 1000 < Date.now();
}
