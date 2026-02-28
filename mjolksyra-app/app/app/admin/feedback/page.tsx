import { getAuth } from "@/context/Auth";
import { getFeedbackReports } from "@/services/admin/getFeedbackReports";
import { FeedbackReportList } from "./FeedbackReportList";

export default async function FeedbackPage() {
  const auth = await getAuth({ redirect: true });
  const reports = await getFeedbackReports({ accessToken: auth!.accessToken });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <FeedbackReportList reports={reports} accessToken={auth!.accessToken} />
    </div>
  );
}
