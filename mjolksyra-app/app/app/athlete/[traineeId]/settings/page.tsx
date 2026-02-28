import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { redirect } from "next/navigation";
import { PageContent } from "../../pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function Page({ params }: Props) {
  const auth = await getAuth({
    redirect: "/",
  });

  const routeParams = await params;
  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  if (!user.coaches.some((x) => x.traineeId === routeParams.traineeId)) {
    redirect("/app/athlete");
  }

  return (
    <PageContent
      user={user}
      initialCoachTraineeId={routeParams.traineeId}
      initialDashboardTab="settings"
    />
  );
}
