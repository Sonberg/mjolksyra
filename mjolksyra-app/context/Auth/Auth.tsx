"use client";

import { useCookies } from "next-client-cookies";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { accessTokenStore } from "@/services/client";

type LoginRequest = {
  accessToken?: string | null | undefined;
  refreshToken?: string | null | undefined;
  refreshTokenExpiresAt?: Date | null | undefined;
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
};

const AuthContext = createContext<AuthContextValue>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(_: LoginRequest) {},
  logout() {},
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

  const content = useMemo(() => {
    return accessToken ? jwtDecode<Jwt>(accessToken) : null;
  }, [accessToken]);

  const login = useCallback(
    (req: LoginRequest) => {
      if (!req.accessToken) return;
      if (!req.refreshToken) return;
      if (!req.refreshTokenExpiresAt) return;

      setAccessToken(req.accessToken);

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
    cookies.remove("accessToken");
    cookies.remove("refreshToken");
  }, [cookies]);

  useEffect(() => {
    accessTokenStore.setState(accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
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
