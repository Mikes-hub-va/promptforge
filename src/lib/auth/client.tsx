"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthUser } from "@/types";

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = LoginInput & {
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  signup: (input: SignupInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Request failed.");
  }
  return payload as T;
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const payload = await readResponse<{ user: AuthUser | null }>(
        await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        }),
      );
      setUser(payload.user);
      return payload.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (input: SignupInput) => {
    setIsLoading(true);
    try {
      const payload = await readResponse<{ user: AuthUser }>(
        await fetch("/api/auth/signup", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }),
      );
      setUser(payload.user);
      return payload.user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const payload = await readResponse<{ user: AuthUser }>(
        await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }),
      );
      setUser(payload.user);
      return payload.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await readResponse(
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }),
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      refresh,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
