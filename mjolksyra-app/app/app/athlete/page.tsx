import { getUserMe } from "@/services/users/getUserMe";
import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

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

  return (
    <PageContent
      user={user}
      initialCoachTraineeId={query.coachTraineeId}
      focusWorkoutId={query.workoutId}
      initialWorkoutTab={initialWorkoutTab}
    />
  );
}
