import { ApiClient } from "../client";

type Args = {
  id: string;
};

export async function deleteExercise({ id }: Args) {
  const response = await ApiClient.delete(`/api/exercises/${id}`);

  if (response.status > 299) {
    throw new Error("Failed to parse data");
  }

  return response.data;
}
