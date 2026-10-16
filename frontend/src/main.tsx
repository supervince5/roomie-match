import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App";
import AuthProvider from "./auth/AuthProvider";
import "./index.css";
import "./theme.css";
import "./design-system.css";
import "./matcha.css";

// A data router provides native, interruptible view transitions for navigation.
const router = createBrowserRouter([
  { path: "*", element: <AuthProvider><App /></AuthProvider> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
