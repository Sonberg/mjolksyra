import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { redirect } from "next/navigation";
import { PageContent } from "../../../pageContent";

type Props = {
  params: Promise<{ traineeId: string; workoutId: string }>;
  searchParams?: Promise<{ tab?: string; workoutTab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
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

  const query = (await searchParams) ?? {};
  const backTab =
    query.tab === "past" || query.tab === "future"
      ? query.tab
      : query.workoutTab === "past" || query.workoutTab === "future"
        ? query.workoutTab
        : undefined;

  return (
    <PageContent
      user={user}
      initialDashboardTab="workouts"
      initialCoachTraineeId={routeParams.traineeId}
      detailWorkoutId={routeParams.workoutId}
      initialWorkoutTab={backTab}
      detailBackTab={backTab}
    />
  );
}
