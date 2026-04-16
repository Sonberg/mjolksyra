"use client";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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
  initialTab?: "planned" | "completed";
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
  const [mode, setMode] = useState<"planned" | "completed">(initialTab);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [endNode, setEndNode] = useState<HTMLDivElement | null>(null);
  const [isEndIntersecting, setIsEndIntersecting] = useState(false);
  const [missedExpanded, setMissedExpanded] = useState(true);

  const planned = useWorkouts({
    id: "planned",
    traineeId,
    fromDate: dayjs().startOf("day").subtract(12, "weeks"),
    sortBy: "PlannedAt",
    order: "asc",
    enabled: mode === "planned",
  });

  const completed = useCompletedWorkouts({
    id: "completed",
    traineeId,
    sortBy: "PlannedAt",
    order: "desc",
    enabled: mode === "completed",
  });

  const hasNextPage =
    mode === "planned" ? planned.hasNextPage : completed.hasNextPage;

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

    if (mode === "planned") {
      void planned.fetchNextPage();
      return;
    }

    void completed.fetchNextPage();
  }, [completed, hasNextPage, isEndIntersecting, mode, planned]);

  const emptyState = useMemo(() => {
    if (mode === "planned") {
      return {
        title: "No planned workouts",
        body: "Future and unscheduled prescriptions will appear here.",
      };
    }

    return {
      title: "No completed workouts",
      body: "Finished and ad hoc workout sessions will appear here.",
    };
  }, [mode]);

  function setModeWithUrl(nextMode: "planned" | "completed") {
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

  const hasPlannedContent =
    missedWorkouts.length > 0 || upcomingWorkouts.length > 0;

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
        title={mode === "planned" ? "Planned workouts" : "Completed workouts"}
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
            <>
              {missedWorkouts.length > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setMissedExpanded((prev) => !prev)}
                    className="mb-3 flex w-full items-center justify-between border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2.5 text-left"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                      Missed ({missedWorkouts.length})
                    </span>
                    {missedExpanded ? (
                      <ChevronUpIcon className="h-4 w-4 text-[var(--shell-muted)]" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-[var(--shell-muted)]" />
                    )}
                  </button>
                  {missedExpanded ? (
                    <div className="grid gap-4 sm:gap-8">
                      {missedWorkouts.map((workout) => (
                        <MissedWorkoutCard
                          key={workout.id}
                          workout={workout}
                          traineeId={traineeId}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {upcomingWorkouts.map((workout) =>
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
              )}
            </>
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
        (mode === "completed" && completed.data.length > 0)) &&
      !hasNextPage ? (
        <div className="mt-8 text-center text-lg text-muted">
          {mode === "planned"
            ? "No more planned workouts"
            : "No more completed workouts"}
        </div>
      ) : null}

      <div className="h-8 w-full opacity-0" ref={endRef}>
        d
      </div>
    </>
  );
}
