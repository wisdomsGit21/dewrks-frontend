import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { appRouter } from "./config/routes.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./components/auth-provider.tsx";
import { Toaster } from "sonner";

const routes = createBrowserRouter(appRouter());
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <RouterProvider router={routes} />
    </AuthProvider>
  </StrictMode>
);
