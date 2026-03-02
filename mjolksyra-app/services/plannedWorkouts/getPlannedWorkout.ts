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

export type GetPlannedWorkouts = typeof getPlannedWorkouts;
export type GetDraftPlannedExercises = typeof getDraftPlannedExercises;

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
  return getPlannedWorkoutsByPath({
    traineeId,
    fromDate,
    toDate,
    next,
    limit,
    signal,
    sortBy,
    order,
    path: "planned-workouts",
  });
}

export async function getDraftPlannedExercises({
  traineeId,
  fromDate,
  toDate,
  next,
  limit,
  signal,
  sortBy,
  order,
}: Args) {
  return getPlannedWorkoutsByPath({
    traineeId,
    fromDate,
    toDate,
    next,
    limit,
    signal,
    sortBy,
    order,
    path: "planned-exercises/draft",
  });
}

async function getPlannedWorkoutsByPath({
  traineeId,
  fromDate,
  toDate,
  next,
  limit,
  signal,
  sortBy,
  order,
  path,
}: Args & { path: string }) {
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

  const url = `/api/trainees/${traineeId}/${path}?${queryString}`;
  const response = await ApiClient.get(url, {
    signal,
  });

  const parsed = await paginated(workoutSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
