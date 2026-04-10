import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { getPlannedWorkoutById } from "@/services/plannedWorkouts/getPlannedWorkoutById";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { PlannedWorkoutDetail } from "@/components/WorkoutViewer/PlannedWorkoutDetail";

type Props = {
  params: Promise<{ traineeId: string; plannedWorkoutId: string }>;
  searchParams?: Promise<{ tab?: string; workoutTab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const auth = await getAuth({ redirect: "/" });
  const routeParams = await params;
  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  if (!user.coaches.some((coach) => coach.traineeId === routeParams.traineeId)) {
    redirect("/app/athlete");
  }

  const query = (await searchParams) ?? {};
  const backTab =
    query.tab === "planned" || query.tab === "completed"
      ? query.tab
      : query.workoutTab === "planned" || query.workoutTab === "completed"
        ? query.workoutTab
        : "planned";

  const workout = await getPlannedWorkoutById({
    traineeId: routeParams.traineeId,
    plannedWorkoutId: routeParams.plannedWorkoutId,
  }).catch(() => null);

  if (!workout) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[600px] w-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
        <Link
          href={`/app/athlete/${routeParams.traineeId}/workouts?tab=${backTab}`}
          className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
          aria-label="Back to workouts"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Planned workout</p>
          <p className="truncate text-base font-semibold text-[var(--shell-ink)]">Workout details</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <PlannedWorkoutDetail workout={workout} viewerMode="athlete" />
      </div>
    </div>
  );
}
