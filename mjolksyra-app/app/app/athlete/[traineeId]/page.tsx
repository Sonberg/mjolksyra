import { getUserMe } from "@/services/users/getUserMe";
import { getAuth } from "@/context/Auth";
import { redirect } from "next/navigation";
import { PageContent } from "../pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
  searchParams?: Promise<{ workoutId?: string; workoutTab?: string; tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });
  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const initialWorkoutTab =
    query.workoutTab === "past" || query.workoutTab === "future"
      ? query.workoutTab
      : query.tab === "past" || query.tab === "future"
        ? query.tab
        : undefined;

  if (!user.coaches.some((x) => x.traineeId === routeParams.traineeId)) {
    redirect("/app/athlete");
  }

  return (
    <PageContent
      user={user}
      initialCoachTraineeId={routeParams.traineeId}
      focusWorkoutId={query.workoutId}
      initialWorkoutTab={initialWorkoutTab}
    />
  );
}
