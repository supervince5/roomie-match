import { useEffect, useState, type ReactNode } from "react";
import { apiRequest, getToken, setToken } from "../lib/api";
import { clearApiCache } from "../lib/useApi";
import { AuthContext, isExpired, readTokenClaims } from "./authContext";

function startingToken() {
  const saved = getToken();
  if (saved !== null && isExpired(saved)) {
    setToken(null);
    return null;
  }
  return saved;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(startingToken);

  // If any API call comes back 401, api.ts fires this event and we log out here.
  useEffect(() => {
    function handleLoggedOut() {
      clearApiCache();
      setTokenState(null);
    }
    window.addEventListener("roomie:logged-out", handleLoggedOut);
    return () => window.removeEventListener("roomie:logged-out", handleLoggedOut);
  }, []);

  async function login(email: string, password: string) {
    const result = await apiRequest<{ token: string }>("/login", {
      method: "POST",
      body: { email: email, password: password },
    });
    clearApiCache();
    setToken(result.token);
    setTokenState(result.token);
  }

  function logout() {
    clearApiCache();
    setToken(null);
    setTokenState(null);
  }

  const userId = token === null ? null : (readTokenClaims(token).sub ?? null);

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
