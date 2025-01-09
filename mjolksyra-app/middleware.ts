import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { refresh } from "./api/auth/refresh";

export async function middleware(_: NextRequest) {
  const response = NextResponse.next();
  const jwtSecret = `${process.env.JWT_SECRET}`;

  const store = await cookies();
  const accessToken = store.get("accessToken")?.value;
  const refreshToken = store.get("refreshToken")?.value;

  if (!refreshToken) {
    return response;
  }

  try {
    if (!accessToken) {
      throw new Error();
    }

    verify(accessToken, jwtSecret, {});

    return response;
  } catch {
    const secure = process.env.NODE_ENV === "production";
    const refreshed = await refresh({ refreshToken: refreshToken });

    if (!refreshed?.isSuccessful) {
      return response;
    }

    store.set("accessToken", refreshed.accessToken!, {
      secure: secure,
      expires: refreshed.refreshTokenExpiresAt!,
    });

    store.set("refreshToken", refreshed.refreshToken!, {
      secure: secure,
      expires: refreshed.refreshTokenExpiresAt!,
    });
  }

  return response;
}
