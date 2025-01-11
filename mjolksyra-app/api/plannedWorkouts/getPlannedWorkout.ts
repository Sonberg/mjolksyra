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
};

export async function getPlannedWorkouts({
  traineeId,
  fromDate,
  toDate,
  next,
  limit,
  signal,
}: Args) {
  const from = fromDate?.format(PLANNED_AT) ?? "";
  const to = toDate?.format(PLANNED_AT) ?? "";
  const url = next
    ? `/api/trainees/${traineeId}/planned-workouts?next=${next}`
    : `/api/trainees/${traineeId}/planned-workouts?from=${from}&to=${to}&limit=${limit}`;
  const response = await ApiClient.get(url, {
    signal,
  });

  const parsed = await paginated(workoutSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
