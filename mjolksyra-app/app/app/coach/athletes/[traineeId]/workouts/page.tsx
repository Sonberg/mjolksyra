import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ traineeId: string }>;
  searchParams?: Promise<{ tab?: string; workoutId?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  await getAuth({
    redirect: "/",
  });

  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const initialTab =
    query.tab === "planned" || query.tab === "completed"
      ? query.tab
      : undefined;

  if (query.workoutId) {
    const target = new URLSearchParams();
    if (initialTab) {
      target.set("tab", initialTab);
    }
    const suffix = target.toString() ? `?${target.toString()}` : "";
    redirect(`/app/coach/athletes/${routeParams.traineeId}/workouts/${query.workoutId}${suffix}`);
  }

  return (
    <PageContent
      traineeId={routeParams.traineeId}
      initialTab={initialTab}
    />
  );
}
