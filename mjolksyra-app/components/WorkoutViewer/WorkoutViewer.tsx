"use client";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { SelectionTabs } from "@/components/Navigation/SelectionTabs";
import { WorkoutCard } from "./WorkoutCard";
import { MissedWorkoutCard } from "./MissedWorkoutCard";
import { NewSessionDialog } from "./NewSessionDialog";
import { useWorkouts } from "./useWorkouts";
import { useCompletedWorkouts } from "./useCompletedWorkouts";
import { CompletedWorkoutCard } from "./CompletedWorkoutCard";

type Props = {
  traineeId: string;
  mode?: "athlete" | "coach";
  initialTab?: "planned" | "completed" | "missed";
  focusWorkoutId?: string | null;
};

export function WorkoutViewer({
  traineeId,
  mode: viewerMode = "athlete",
  initialTab = "completed",
  focusWorkoutId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"planned" | "completed" | "missed">(initialTab);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [endNode, setEndNode] = useState<HTMLDivElement | null>(null);
  const [isEndIntersecting, setIsEndIntersecting] = useState(false);

  const planned = useWorkouts({
    id: "planned",
    traineeId,
    fromDate: dayjs().startOf("day").subtract(12, "weeks"),
    sortBy: "PlannedAt",
    order: "asc",
    enabled: true,
  });

  const completed = useCompletedWorkouts({
    id: "completed",
    traineeId,
    sortBy: "PlannedAt",
    order: "desc",
    enabled: mode === "completed",
  });

  const hasNextPage =
    mode === "completed" ? completed.hasNextPage : planned.hasNextPage;

  const endRef = useCallback((node: HTMLDivElement | null) => {
    setEndNode(node);
    if (!node) {
      setIsEndIntersecting(false);
    }
  }, []);

  useEffect(() => {
    if (!endNode) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsEndIntersecting(entry.isIntersecting);
    });

    observer.observe(endNode);
    return () => observer.disconnect();
  }, [endNode]);

  useEffect(() => {
    if (!isEndIntersecting || !hasNextPage) {
      return;
    }

    if (mode === "completed") {
      void completed.fetchNextPage();
      return;
    }

    void planned.fetchNextPage();
  }, [completed, hasNextPage, isEndIntersecting, mode, planned]);

  const emptyState = useMemo(() => {
    if (mode === "planned") {
      return {
        title: "No planned workouts",
        body: "Future and unscheduled prescriptions will appear here.",
      };
    }

    if (mode === "missed") {
      return {
        title: "No missed workouts",
        body: "Past workouts that need a decision will appear here.",
      };
    }

    return {
      title: "No completed workouts",
      body: "Finished and ad hoc workout sessions will appear here.",
    };
  }, [mode]);

  function setModeWithUrl(nextMode: "planned" | "completed" | "missed") {
    setMode(nextMode);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextMode);

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  function handleSessionCreated(workoutId: string) {
    router.push(
      `/app/athlete/${traineeId}/workouts/${workoutId}?tab=completed`,
    );
  }

  const today = dayjs().startOf("day");

  const plannedData = planned.data.filter(
    (workout) => !focusWorkoutId || workout.id === focusWorkoutId || true,
  );

  const missedWorkouts = useMemo(() => {
    if (viewerMode !== "athlete") return [];
    return plannedData
      .filter((w) => {
        const [year, month, day] = w.plannedAt.split("-");
        const date = dayjs()
          .year(Number(year))
          .month(Number(month) - 1)
          .date(Number(day))
          .startOf("day");
        return date.isBefore(today) && !w.skippedAt && !w.hasActiveSession;
      })
      .sort((a, b) => b.plannedAt.localeCompare(a.plannedAt));
  }, [plannedData, today, viewerMode]);

  const upcomingWorkouts = useMemo(() => {
    return plannedData.filter((w) => {
      const [year, month, day] = w.plannedAt.split("-");
      const date = dayjs()
        .year(Number(year))
        .month(Number(month) - 1)
        .date(Number(day))
        .startOf("day");
      return !date.isBefore(today) || w.skippedAt || w.hasActiveSession;
    });
  }, [plannedData, today]);

  const hasPlannedContent = upcomingWorkouts.length > 0;

  return (
    <>
      {viewerMode === "athlete" ? (
        <NewSessionDialog
          traineeId={traineeId}
          open={newSessionOpen}
          onOpenChange={setNewSessionOpen}
          onCreated={handleSessionCreated}
        />
      ) : null}

      <PageSectionHeader
        className="mb-4"
        titleClassName="text-xl md:text-2xl"
        title={mode === "planned" ? "Planned workouts" : mode === "missed" ? "Missed workouts" : "Completed workouts"}
        actions={
          <div className="flex w-full items-center gap-3">
            <SelectionTabs
              items={[
                {
                  key: "completed",
                  label: "Completed",
                  onSelect: () => setModeWithUrl("completed"),
                },
                {
                  key: "planned",
                  label: "Planned",
                  onSelect: () => setModeWithUrl("planned"),
                },
                ...(viewerMode === "athlete" && missedWorkouts.length > 0
                  ? [
                      {
                        key: "missed" as const,
                        label: `Missed (${missedWorkouts.length})`,
                        onSelect: () => setModeWithUrl("missed"),
                      },
                    ]
                  : []),
              ]}
              activeKey={mode}
              size="md"
              fullWidth={viewerMode !== "coach"}
              className="w-full max-w-[24rem]"
            />
            {viewerMode === "athlete" ? (
              <button
                type="button"
                onClick={() => setNewSessionOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                New session
              </button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:gap-8">
        {mode === "planned" ? (
          !hasPlannedContent ? (
            <section className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-8 text-center">
              <p className="text-lg font-semibold text-[var(--shell-ink)]">
                {emptyState.title}
              </p>
              <p className="mt-2 text-sm text-[var(--shell-muted)]">
                {emptyState.body}
              </p>
            </section>
          ) : (
            upcomingWorkouts.map((workout) =>
              workout.publishedExercises.length > 0 ? (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  viewerMode={viewerMode}
                  traineeId={traineeId}
                  isHighlighted={focusWorkoutId === workout.id}
                  backTab="planned"
                />
              ) : null,
            )
          )
        ) : mode === "missed" ? (
          missedWorkouts.length === 0 ? (
            <section className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-8 text-center">
              <p className="text-lg font-semibold text-[var(--shell-ink)]">
                {emptyState.title}
              </p>
              <p className="mt-2 text-sm text-[var(--shell-muted)]">
                {emptyState.body}
              </p>
            </section>
          ) : (
            missedWorkouts.map((workout) => (
              <MissedWorkoutCard
                key={workout.id}
                workout={workout}
                traineeId={traineeId}
              />
            ))
          )
        ) : completed.data.length === 0 ? (
          <section className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-6 py-8 text-center">
            <p className="text-lg font-semibold text-[var(--shell-ink)]">
              {emptyState.title}
            </p>
            <p className="mt-2 text-sm text-[var(--shell-muted)]">
              {emptyState.body}
            </p>
          </section>
        ) : (
          completed.data.map((workout) => (
            <CompletedWorkoutCard
              key={workout.id}
              workout={workout}
              viewerMode={viewerMode}
              traineeId={traineeId}
              isHighlighted={focusWorkoutId === workout.id}
              backTab="completed"
            />
          ))
        )}
      </div>

      {((mode === "planned" && hasPlannedContent) ||
        (mode === "missed" && missedWorkouts.length > 0) ||
        (mode === "completed" && completed.data.length > 0)) &&
      !hasNextPage ? (
        <div className="mt-8 text-center text-lg text-muted">
          {mode === "planned"
            ? "No more planned workouts"
            : mode === "missed"
              ? "No more missed workouts"
              : "No more completed workouts"}
        </div>
      ) : null}

      <div className="h-8 w-full opacity-0" ref={endRef}>
        d
      </div>
    </>
  );
}
