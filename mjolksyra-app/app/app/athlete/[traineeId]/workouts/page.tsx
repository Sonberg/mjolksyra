import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { redirect } from "next/navigation";
import { PageContent } from "../../pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
  searchParams?: Promise<{ tab?: string; workoutId?: string; workoutTab?: string }>;
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
  const initialWorkoutTab =
    query.workoutTab === "past" || query.workoutTab === "future"
      ? query.workoutTab
      : query.tab === "past" || query.tab === "future"
        ? query.tab
        : undefined;

  if (query.workoutId) {
    const target = new URLSearchParams();
    if (initialWorkoutTab) {
      target.set("tab", initialWorkoutTab);
    }

    const suffix = target.toString() ? `?${target.toString()}` : "";
    redirect(`/app/athlete/${routeParams.traineeId}/workouts/${query.workoutId}${suffix}`);
  }

  return (
    <PageContent
      user={user}
      initialCoachTraineeId={routeParams.traineeId}
      initialDashboardTab="workouts"
      initialWorkoutTab={initialWorkoutTab}
    />
  );
}
