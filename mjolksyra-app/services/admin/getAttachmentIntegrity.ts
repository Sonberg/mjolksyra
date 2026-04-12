import { ApiClient } from "../client";
import { attachmentIntegrityReportSchema, type AttachmentIntegrityReport } from "./schema";

type Args = {
  accessToken: string;
};

export async function getAttachmentIntegrity({ accessToken }: Args): Promise<AttachmentIntegrityReport> {
  const response = await ApiClient.get(`${process.env.API_URL}/api/admin/attachment-integrity`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsed = await attachmentIntegrityReportSchema.safeParseAsync(response.data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
