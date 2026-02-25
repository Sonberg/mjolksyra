import { ApiClient } from "../client";

type Args = {
  accessToken?: string | null;
};

export async function markAllNotificationsRead({ accessToken }: Args = {}) {
  await ApiClient.post(
    "/api/notifications/read-all",
    {},
    {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    },
  );
}
