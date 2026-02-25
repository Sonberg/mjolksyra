import { ApiClient } from "../client";

type Args = {
  id: string;
  accessToken?: string | null;
};

export async function markNotificationRead({ id, accessToken }: Args) {
  await ApiClient.post(
    `/api/notifications/${id}/read`,
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
