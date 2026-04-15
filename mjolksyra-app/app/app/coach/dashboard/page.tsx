import { Suspense } from "react";
import { redirect } from "next/navigation";
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

  if (user.onboarding.coach !== "Completed") {
    redirect("/app/onboard/coach");
  }

  const trainees = await getTrainees({ accessToken: auth!.accessToken! });

  return <DashboardPageContent user={user} trainees={trainees} />;
}
