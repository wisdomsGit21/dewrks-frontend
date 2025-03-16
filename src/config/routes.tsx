import ProtectedRoute from "@/components/protected-route";
import Dashboard from "@/domain/dashboard";
import Signin from "@/domain/signin";
import SignUp from "@/domain/signup";
import { Navigate, RouteObject } from "react-router-dom";

export function appRouter(): RouteObject[] {
  return [
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/signin",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ];
}
