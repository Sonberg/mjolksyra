import { AxiosResponse } from "axios";
import { ApiClient } from "../client";
import { Exercise } from "./type";

type Args = {
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  category: string | null;
};

export async function createExercise(body: Args) {
  const response = await ApiClient.post<Args, AxiosResponse<Exercise>>(
    `/api/exercises`,
    body
  );

  if (response.status > 299) {
    throw new Error("Failed to parse data");
  }

  return response.data;
}
