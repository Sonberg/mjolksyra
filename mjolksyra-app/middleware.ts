import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { refresh } from "./services/auth/refresh";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(_: NextRequest) {
  const response = NextResponse.next();
  const secret = new TextEncoder().encode(`${process.env.JWT_SECRET}`);

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

    await jwtVerify(accessToken, secret, {
      clockTolerance: 5,
    });

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
