"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JwtPayload, verify } from "jsonwebtoken";
import { refresh } from "@/api/auth/refresh";

type Args = {
  redirect: boolean | string;
};

export async function getAuth(args?: Args) {
  const jwtSecret = process.env.JWT_SECRET;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const empty = () => {
    if (!args) {
      return null;
    }

    if (!args.redirect) {
      return null;
    }

    if (args.redirect === true) {
      redirect("/");
    }

    redirect(args.redirect);
  };

  const tryVerify = async (token: string | undefined) => {
    try {
      if (!jwtSecret) {
        return [false, null] as const;
      }

      if (!token) {
        return [false, null] as const;
      }

      const decoded = verify(token, jwtSecret, {});

      if (typeof decoded === "string") {
        return [false, null] as const;
      }

      return [true, decoded] as const;
    } catch (error) {
      console.log(error);

      return [false, null] as const;
    }
  };

  const ensureScope = (decoded: JwtPayload) => {
    if (!decoded.userId) {
      redirect("/");
    }
  };

  if (!refreshToken) {
    console.log("No refreshToken");

    return empty();
  }

  if (!jwtSecret) {
    console.log("No secreet");
    return empty();
  }

  const verify1 = await tryVerify(accessToken);

  if (verify1[0]) {
    ensureScope(verify1[1]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: verify1[1].userId ? `${verify1[1].userId}` : null,
      name: verify1[1].name ? `${verify1[1].name}` : null,
      email: verify1[1].email ? `${verify1[1].email}` : null,
    };
  }

  const refreshed = refreshToken
    ? await refresh({ refreshToken: refreshToken })
    : null;

  if (!refreshed) {
    console.log("Refresh unsuccessful");
    return empty();
  }

  if (refreshed.accessToken === accessToken) {
    console.log("Get same accessToken");
  }

  const verify2 = await tryVerify(refreshed.accessToken);

  if (verify2[0]) {
    ensureScope(verify2[1]);

    return {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
      userId: verify2[1].userId ? `${verify2[1].userId}` : null,
      name: verify2[1].name ? `${verify2[1].name}` : null,
      email: verify2[1].email ? `${verify2[1].email}` : null,
    };
  }

  console.log("Verify 2 was unsuccessful");
  return empty();
}
