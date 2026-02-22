"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

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

  const [success, payload] = await tryVerify(accessToken);

  if (!success) {
  }

  if (success) {
    ensureScope(payload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: payload.userId ? `${payload.userId}` : null,
      name: payload.name ? `${payload.name}` : null,
      email: payload.email ? `${payload.email}` : null,
    };
  }

  const headersList = await headers();
  const path = headersList.get("x-pathname");

  if (path) {
    redirect(path);
  }

  return empty();
}
