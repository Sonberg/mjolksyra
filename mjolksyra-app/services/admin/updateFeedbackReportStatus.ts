import { ApiClient } from "../client";
import { updateFeedbackStatusResultSchema, type UpdateFeedbackStatusResult } from "./schema";

type Args = {
  accessToken: string;
  id: string;
  status: string;
};

export async function updateFeedbackReportStatus({ accessToken, id, status }: Args): Promise<UpdateFeedbackStatusResult> {
  const response = await ApiClient.patch(
    `${process.env.API_URL}/api/admin/feedback-reports/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const parsed = await updateFeedbackStatusResultSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
