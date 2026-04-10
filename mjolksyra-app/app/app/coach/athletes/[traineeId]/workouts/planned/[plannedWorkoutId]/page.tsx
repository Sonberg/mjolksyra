import { getAuth } from "@/context/Auth";
import { CoachWorkspaceShell } from "../../../../../CoachWorkspaceShell";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { PlannedWorkoutLoader } from "@/components/WorkoutViewer/PlannedWorkoutLoader";
import { schema as traineeSchema } from "@/services/trainees/schema";

type Props = {
  params: Promise<{ traineeId: string; plannedWorkoutId: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const auth = await getAuth({ redirect: "/" });
  const routeParams = await params;
  const query = (await searchParams) ?? {};
  const backTab = query.tab === "planned" || query.tab === "completed" ? query.tab : "planned";

  const traineeRes = await fetch(`${process.env.API_URL}/api/trainees/${routeParams.traineeId}`, {
    headers: { Authorization: `Bearer ${auth!.accessToken}` },
    cache: "no-store",
  });

  const traineeJson = traineeRes.ok ? await traineeRes.json() : null;
  const traineeParsed = traineeJson ? await traineeSchema.safeParseAsync(traineeJson) : null;
  const trainee = traineeParsed?.success ? traineeParsed.data : null;

  const athleteName = trainee?.athlete?.givenName || trainee?.athlete?.familyName
    ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
    : trainee?.athlete?.name || "Athlete";

  const backHref = `/app/coach/athletes/${routeParams.traineeId}/workouts?tab=${backTab}`;

  return (
    <CoachWorkspaceShell fullBleed>
      <div className="flex h-[calc(100dvh-7.5rem)] min-h-[600px] w-full flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 md:px-6">
          <Link
            href={backHref}
            className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            aria-label="Back to workouts"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Planned workout</p>
            <p className="truncate text-base font-semibold text-[var(--shell-ink)]">{athleteName}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <PlannedWorkoutLoader
            traineeId={routeParams.traineeId}
            plannedWorkoutId={routeParams.plannedWorkoutId}
            viewerMode="coach"
          />
        </div>
      </div>
    </CoachWorkspaceShell>
  );
}
