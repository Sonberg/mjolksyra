import dayjs from "dayjs";
import { z } from "zod";
import { ApiClient } from "../client";
import { workoutSchema } from "./schema";
import { PLANNED_AT } from "@/constants/dateFormats";

type Args = {
  traineeId: string;
  fromDate: dayjs.Dayjs;
  toDate: dayjs.Dayjs;
  signal?: AbortSignal;
};

export async function getPlannedWorkouts({
  traineeId,
  fromDate,
  toDate,
  signal,
}: Args) {
  const from = fromDate.format(PLANNED_AT);
  const to = toDate.format(PLANNED_AT);
  const url = `/api/trainees/${traineeId}/planned-workouts?from=${from}&to=${to}`;
  const response = await ApiClient.get(url, {
    signal,
  });

  const parsed = await z.array(workoutSchema).safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
