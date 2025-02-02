import { ApiClient } from "../client";
import { Exercise } from "./type";

type Args = {
  exerciseId: string;
  state: boolean;
};

export type StarExercise = typeof starExercises;

export async function starExercises({ exerciseId, state }: Args) {
  const response = await ApiClient.put<Exercise>(
    `/api/exercises/${exerciseId}/star`,
    { state }
  );

  if (response.status !== 204) {
    throw new Error("Failed to parse data");
  }
}
