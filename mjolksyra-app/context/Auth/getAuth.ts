"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Args = {
  redirect?: boolean | string;
};

type AuthResult = {
  accessToken: string;
  userId: string | null;
};

export async function getAuth(args?: Args): Promise<AuthResult | null> {
  const { getToken } = await auth();
  const accessToken = (await getToken()) ?? "";

  if (!accessToken) {
    if (args?.redirect) {
      if (args.redirect === true) {
        redirect("/");
      }

      redirect(args.redirect);
    }

    return null;
  }

  let userId: string | null = null;

  try {
    const res = await fetch(`${process.env.API_URL}/api/users/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (args?.redirect) {
        if (args.redirect === true) {
          redirect("/");
        }

        redirect(args.redirect);
      }

      throw new Error(`Ensure user failed with status ${res.status}`);
    }

    const data = await res.json();
    userId = data.userId ?? null;
  } catch {
    if (args?.redirect) {
      if (args.redirect === true) {
        redirect("/");
      }

      redirect(args.redirect);
    }
  }

  return { accessToken, userId };
}
