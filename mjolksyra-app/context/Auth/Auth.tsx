"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type LoginRequest = {
  accessToken: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
};

export type AuthContextValue = {
  userId: string | null;
  name: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthContextValue>({
  login() {},
  logout() {},
  getAccessToken: async () => null,
  isAuthenticated: false,
  userId: null,
  name: null,
  email: null,
  givenName: null,
  familyName: null,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, getToken, userId } = useClerkAuth();
  const { user } = useUser();

  const login = useCallback((req: LoginRequest) => {
    void req;
    // Clerk owns login state; existing callers can keep invoking login safely.
  }, []);

  const logout = useCallback(() => {
    void clerk.signOut({ redirectUrl: "/" });
    router.replace("/");
  }, [clerk, router]);

  const getAccessToken = useCallback(async () => {
    const token = await getToken();
    return token ?? null;
  }, [getToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      login,
      logout,
      getAccessToken,
      userId: userId ?? null,
      name: user?.fullName ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      givenName: user?.firstName ?? null,
      familyName: user?.lastName ?? null,
      isAuthenticated: !!isSignedIn,
    }),
    [login, logout, getAccessToken, userId, user, isSignedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
