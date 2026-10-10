import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./authContext";

// Wrap pages that need you to be logged in. Logged-out visitors get sent to /login,
// and come back to the page they wanted after logging in.
function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();

  if (token === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default RequireAuth;
