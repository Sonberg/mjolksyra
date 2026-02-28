import { getAuth } from "@/context/Auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ traineeId: string }>;
  searchParams?: Promise<{ tab?: string; workoutId?: string; workoutTab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  await getAuth({
    redirect: "/",
  });

  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const workoutTab =
    query.workoutTab === "past" || query.workoutTab === "future"
      ? query.workoutTab
      : query.tab === "past" || query.tab === "future"
        ? query.tab
        : undefined;
  const target = new URLSearchParams({
    coachTraineeId: routeParams.traineeId,
  });

  if (workoutTab) {
    target.set("workoutTab", workoutTab);
  }

  if (query.workoutId) {
    target.set("workoutId", query.workoutId);
  }

  redirect(`/app/athlete?${target.toString()}`);
}
