import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
  searchParams?: Promise<{ tab?: string; workoutId?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  await getAuth({
    redirect: "/",
  });

  const query = (await searchParams) ?? {};
  const initialTab =
    query.tab === "past" || query.tab === "future" ? query.tab : undefined;

  return (
    <PageContent
      traineeId={(await params).traineeId}
      initialTab={initialTab}
      focusWorkoutId={query.workoutId ?? null}
    />
  );
}
