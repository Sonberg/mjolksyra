import { ApiClient } from "../client";

type Args = {
  completedWorkoutId: string;
  accessToken?: string | null;
};

export async function markNotificationsReadByWorkout({ completedWorkoutId, accessToken }: Args) {
  await ApiClient.post(
    `/api/notifications/read-by-workout/${completedWorkoutId}`,
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
