import { ApiClient } from "../client";
import { feedbackReportListSchema, type FeedbackReportItem } from "./schema";

type Args = {
  accessToken: string;
};

export async function getFeedbackReports({ accessToken }: Args): Promise<FeedbackReportItem[]> {
  const response = await ApiClient.get(`${process.env.API_URL}/api/admin/feedback-reports`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await feedbackReportListSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
