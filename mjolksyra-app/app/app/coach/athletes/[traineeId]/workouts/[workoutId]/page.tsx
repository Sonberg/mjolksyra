import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { completedWorkoutSchema } from "@/services/completedWorkouts/schema";
import { schema as traineeSchema } from "@/services/trainees/schema";

type Props = {
  params: Promise<{ traineeId: string; workoutId: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const auth = await getAuth({ redirect: "/" });

  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const backTab =
    query.tab === "planned" || query.tab === "completed"
      ? query.tab
      : undefined;

  const [workoutRes, traineeRes] = await Promise.all([
    fetch(
      `${process.env.API_URL}/api/trainees/${routeParams.traineeId}/workouts/${routeParams.workoutId}`,
      { headers: { Authorization: `Bearer ${auth!.accessToken}` }, cache: "no-store" },
    ),
    fetch(
      `${process.env.API_URL}/api/trainees/${routeParams.traineeId}`,
      { headers: { Authorization: `Bearer ${auth!.accessToken}` }, cache: "no-store" },
    ),
  ]);

  const [workoutJson, traineeJson] = await Promise.all([
    workoutRes.ok ? workoutRes.json() : null,
    traineeRes.ok ? traineeRes.json() : null,
  ]);

  const workoutParsed = workoutJson ? await completedWorkoutSchema.safeParseAsync(workoutJson) : null;
  const traineeParsed = traineeJson ? await traineeSchema.safeParseAsync(traineeJson) : null;

  return (
    <PageContent
      traineeId={routeParams.traineeId}
      workoutId={routeParams.workoutId}
      backTab={backTab}
      initialWorkoutResponse={workoutParsed?.success ? workoutParsed.data : null}
      initialTrainee={traineeParsed?.success ? traineeParsed.data : null}
    />
  );
}
