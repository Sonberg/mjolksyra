import dayjs from "dayjs";
import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PLANNED_AT } from "@/constants/dateFormats";
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

export async function getPlannedWorkouts({
  traineeId,
  fromDate,
  toDate,
  next,
  limit,
  signal,
  sortBy,
  order,
}: Args) {
  const from = fromDate?.format(PLANNED_AT) ?? "";
  const to = toDate?.format(PLANNED_AT) ?? "";
  const query = {
    next,
    from,
    to,
    limit,
    sortBy,
    order,
  };

  const queryString = Object.entries(query)
    .reduce<string[]>((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`
        );
      }
      return acc;
    }, [])
    .join("&");

  const url = `/api/trainees/${traineeId}/planned-workouts?${queryString}`;
  const response = await ApiClient.get(url, {
    signal,
  });

  const parsed = await paginated(workoutSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
