"use client";

import { useCookies } from "next-client-cookies";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { refresh } from "@/api/auth/refresh";
import { redirect } from "next/navigation";

type LoginRequest = {
  accessToken: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
};

type AuthContextValue = {
  userId: string | null;
  name: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue>({
  login(req: LoginRequest) {},
  logout() {},
  getAccessToken: async () => Promise.any(""),
  isAuthenticated: false,
  userId: null,
  name: null,
  email: null,
  givenName: null,
  familyName: null,
});

type AuthProviderProps = {
  children: ReactNode;
};

type Jwt = JwtPayload & {
  userId: string | null;
  name: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
};

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: AuthProviderProps) {
  const cookies = useCookies();

  const [accessToken, setAccessToken] = useState<string | null>(
    () => cookies.get("accessToken") ?? null
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => cookies.get("refreshToken") ?? null
  );

  const content = useMemo(() => {
    return accessToken ? jwtDecode<Jwt>(accessToken) : null;
  }, [accessToken]);

  const getDiff = useCallback(
    () => (content ? content.exp! * 1000 - Date.now() : 0),
    [content]
  );

  const login = useCallback(
    (req: LoginRequest) => {
      if (!req.accessToken) return;
      if (!req.refreshToken) return;
      if (!req.refreshTokenExpiresAt) return;

      setAccessToken(req.accessToken);
      setRefreshToken(req.refreshToken);

      console.log("Setting new token");

      cookies.set("accessToken", req.accessToken, {
        secure: location.hostname !== "localhost",
        expires: req.refreshTokenExpiresAt,
      });

      cookies.set("refreshToken", req.refreshToken, {
        secure: location.hostname !== "localhost",
        expires: req.refreshTokenExpiresAt,
      });
    },
    [cookies]
  );

  const logout = useCallback(() => {
    console.log("logout");

    setAccessToken(null);
    setRefreshToken(null);
    cookies.remove("accessToken");
    cookies.remove("refreshToken");
  }, [cookies]);

  const getAccessToken = useCallback(async () => {
    if (!accessToken) {
      redirect("/app");
    }

    if (getDiff() > 5000) {
      return accessToken;
    }

    const res = await refresh({ refreshToken: refreshToken! });

    if (!res) {
      redirect("/app");
    }

    login(res);

    return res.accessToken;
  }, [accessToken, getDiff, refreshToken, login]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        getAccessToken,
        userId: content?.userId ?? null,
        name: content?.name ?? null,
        email: content?.email ?? null,
        givenName: content?.givenName ?? null,
        familyName: content?.familyName ?? null,
        isAuthenticated: !!content?.userId,
      }}
      children={children}
    />
  );
}
