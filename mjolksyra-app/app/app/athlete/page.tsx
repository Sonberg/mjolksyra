import { getUserMe } from "@/services/users/getUserMe";
import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{
    coachTraineeId?: string;
    workoutId?: string;
    workoutTab?: string;
    tab?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const auth = await getAuth({
    redirect: true,
  });

  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  const query = (await searchParams) ?? {};
  const initialWorkoutTab =
    query.workoutTab === "past" || query.workoutTab === "future"
      ? query.workoutTab
      : query.tab === "past" || query.tab === "future"
        ? query.tab
        : undefined;

  if (user.coaches.length > 0) {
    const selectedCoachId =
      query.coachTraineeId &&
      user.coaches.some((x) => x.traineeId === query.coachTraineeId)
        ? query.coachTraineeId
        : user.coaches[0].traineeId;

    const target = new URLSearchParams();
    if (initialWorkoutTab) {
      target.set("workoutTab", initialWorkoutTab);
    }

    const suffix = target.toString() ? `?${target.toString()}` : "";
    if (query.workoutId) {
      redirect(`/app/athlete/${selectedCoachId}/workouts/${query.workoutId}${suffix}`);
    }

    redirect(`/app/athlete/${selectedCoachId}/workouts${suffix}`);
  }

  return (
    <PageContent
      user={user}
      initialCoachTraineeId={query.coachTraineeId}
      focusWorkoutId={query.workoutId}
      initialWorkoutTab={initialWorkoutTab}
    />
  );
}
