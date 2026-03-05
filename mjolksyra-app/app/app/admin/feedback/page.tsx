import { getAuth } from "@/context/Auth";
import { getFeedbackReports } from "@/services/admin/getFeedbackReports";
import { FeedbackReportList } from "./FeedbackReportList";

export default async function FeedbackPage() {
  const auth = await getAuth({ redirect: true });
  const reports = await getFeedbackReports({ accessToken: auth!.accessToken });

  return (
    <div className="max-w-5xl">
      <FeedbackReportList reports={reports} accessToken={auth!.accessToken} />
    </div>
  );
}
