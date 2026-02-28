import { getUserMe } from "@/services/users/getUserMe";
import { getAuth } from "@/context/Auth";
import { redirect } from "next/navigation";

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

  if (!user.coaches.some((x) => x.traineeId === routeParams.traineeId)) {
    redirect("/app/athlete");
  }

  const target = new URLSearchParams();
  if (query.workoutId) {
    target.set("workoutId", query.workoutId);
  }
  if (query.workoutTab === "past" || query.workoutTab === "future") {
    target.set("workoutTab", query.workoutTab);
  } else if (query.tab === "past" || query.tab === "future") {
    target.set("workoutTab", query.tab);
  }

  const suffix = target.toString() ? `?${target.toString()}` : "";
  redirect(`/app/athlete/${routeParams.traineeId}/workouts${suffix}`);
}
