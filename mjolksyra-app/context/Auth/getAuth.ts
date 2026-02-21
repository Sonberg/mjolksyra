"use server";

import { auth } from "@clerk/nextjs/server";

type Args = {
  redirect?: boolean | string;
};

type AuthResult = {
  accessToken: string;
  userId: string | null;
};

export async function getAuth(_args?: Args): Promise<AuthResult> {
  const { getToken } = await auth();
  const accessToken = (await getToken()) ?? "";

  let userId: string | null = null;

  if (accessToken) {
    try {
      const res = await fetch(`${process.env.API_URL}/api/users/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        userId = data.userId ?? null;
      }
    } catch {
      // Ignore errors - userId will remain null
    }
  }

  return { accessToken, userId };
}
