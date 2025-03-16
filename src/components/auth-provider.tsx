import { AuthContext } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { PropsWithChildren, useEffect, useState } from "react";
import { toast } from "sonner";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      fetchUserInfo();
    } else {
      setIsLoading(false);
    }

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originaRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originaRequest._retry &&
          refreshToken
        ) {
          originaRequest._retry = true;
          try {
            const response = await api.post("/auth/refresh", { refreshToken });
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data;

            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return api(originaRequest);
          } catch (refreshError) {
            await signOut();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post("/auth/signin", { email, password });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      await fetchUserInfo();

      toast("Welcome back!");
    } catch (error) {
      console.error("Sign in failed:", error);
      toast.error("Sign in failed", {
        description: "Please check your credentials and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      const { user: newUser, tokens } = response.data;

      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.accessToken}`;

      setUser(newUser);

      toast("Account created!", {
        description: "Your account has been successfully created.",
      });
    } catch (error) {
      console.error("Sign up failed:", error);
      toast.error("Sign up failed", {
        description: "Please check your information and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
