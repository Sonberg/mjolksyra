import { ApiClient } from "../client";
import { schema } from "./schema";
import { AxiosError } from "axios";

type Args = {
  email: string;
  monthlyPriceAmount: number;
  signal?: AbortSignal;
};

export async function inviteTrainee({ email, monthlyPriceAmount, signal }: Args) {
  try {
    const response = await ApiClient.post(
      `/api/trainee-invitations`,
      {
        email,
        monthlyPriceAmount,
      },
      {
        signal,
      },
    );
    const parsed = await schema.safeParseAsync(response.data);

    if (!parsed.success) {
      throw new Error("Failed to parse data");
    }

    return parsed.data!;
  } catch (error) {
    if (error instanceof AxiosError) {
      const detail =
        typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : null;
      const title =
        typeof error.response?.data?.title === "string"
          ? error.response.data.title
          : null;

      throw new Error(detail || title || "Unable to send invitation.");
    }

    throw error;
  }
}
