import { Suspense } from "react";
import { getAuth } from "@/context/Auth";
import { getTrainees } from "@/services/trainees/getTrainees";
import { getUserMe } from "@/services/users/getUserMe";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardPageContent } from "./pageContent";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}

async function DashboardPage() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees =
    user.onboarding.coach === "Completed"
      ? await getTrainees({ accessToken: auth!.accessToken! })
      : [];

  return <DashboardPageContent user={user} trainees={trainees} />;
}
