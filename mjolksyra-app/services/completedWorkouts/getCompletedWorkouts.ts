import dayjs from "dayjs";
import { ApiClient } from "../client";
import { completedWorkoutSchema } from "./schema";
import { paginated } from "../schema";

type Args = {
  traineeId: string;
  fromDate?: dayjs.Dayjs;
  toDate?: dayjs.Dayjs;
  limit?: number;
  next?: string;
  signal?: AbortSignal;
  sortBy?: string;
  order?: "asc" | "desc";
};

export async function getCompletedWorkouts({
  traineeId,
  fromDate,
  toDate,
  next,
  limit,
  signal,
  sortBy,
  order,
}: Args) {
  const query = {
    next,
    from: fromDate?.format("YYYY-MM-DD") ?? "",
    to: toDate?.format("YYYY-MM-DD") ?? "",
    limit,
    sortBy,
    order,
  };

  const queryString = Object.entries(query)
    .reduce<string[]>((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
      }
      return acc;
    }, [])
    .join("&");

  const response = await ApiClient.get(`/api/trainees/${traineeId}/workouts?${queryString}`, {
    signal,
  });

  const parsed = await paginated(completedWorkoutSchema).safeParseAsync(response.data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
