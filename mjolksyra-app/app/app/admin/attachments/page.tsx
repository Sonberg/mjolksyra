import { getAuth } from "@/context/Auth";
import { getAttachmentIntegrity } from "@/services/admin/getAttachmentIntegrity";
import { AttachmentIntegrityTab } from "../media/AttachmentIntegrityTab";

export default async function AdminAttachmentsPage() {
  const auth = await getAuth({ redirect: true });
  const report = await getAttachmentIntegrity({ accessToken: auth!.accessToken });

  return <AttachmentIntegrityTab report={report} />;
}
