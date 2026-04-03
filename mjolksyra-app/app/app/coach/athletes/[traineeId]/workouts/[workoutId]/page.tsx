import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

type Props = {
  params: Promise<{ traineeId: string; workoutId: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  await getAuth({
    redirect: "/",
  });

  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const backTab =
    query.tab === "past" || query.tab === "future" || query.tab === "changes"
      ? query.tab
      : undefined;

  return (
    <PageContent
      traineeId={routeParams.traineeId}
      workoutId={routeParams.workoutId}
      backTab={backTab}
    />
  );
}
