import { ApiClient } from "../client";
import { feedbackReportResponseSchema } from "./schema";

type Args = {
  message: string;
  pageUrl?: string | null;
};

export async function createFeedbackReport({ message, pageUrl }: Args) {
  const response = await ApiClient.post("/api/feedback-reports", {
    message,
    pageUrl,
  });

  const parsed = await feedbackReportResponseSchema.safeParseAsync(
    response.data,
  );
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
