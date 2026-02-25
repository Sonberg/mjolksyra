import { ApiClient } from "../client";
import { notificationsResponseSchema } from "./schema";

type Args = {
  accessToken?: string | null;
};

export async function getNotifications({ accessToken }: Args = {}) {
  const response = await ApiClient.get("/api/notifications", {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });

  const parsed = await notificationsResponseSchema.safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
