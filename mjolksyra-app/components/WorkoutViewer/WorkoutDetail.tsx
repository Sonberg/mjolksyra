"use client";

import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { CheckCircle2Icon, MessageSquareIcon, SparklesIcon } from "lucide-react";
import { WorkoutExerciseCard } from "./workout/WorkoutExerciseCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
} from "./workout/types";
import { WorkoutChatPanel } from "@/components/WorkoutChat/WorkoutChatPanel";
import { WorkoutAnalysis } from "./workout/WorkoutAnalysisSection";
import { StatusBadge } from "./StatusBadge";
import { useWorkout } from "@/hooks/useWorkout";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  traineeId: string;
  backTab?: "past" | "future" | "changes";
};

export function WorkoutDetail({
  workout,
  viewerMode = "athlete",
  traineeId,
  backTab,
}: Props) {
  const {
    saveCompletion,
    saveReview,
    toggleExerciseDone,
    toggleSetDone,
    updateSetWeight,
  } = useWorkout({ workout });

  const [chatOpen, setChatOpen] = useState(false);

  const date = useMemo(() => {
    const [year, month, day] = workout.plannedAt.split("-");
    return dayjs()
      .year(Number(year))
      .month(Number(month) - 1)
      .date(Number(day));
  }, [workout.plannedAt]);

  const displayName = useMemo(() => {
    const today = dayjs();
    const diff = date.diff(today, "days");
    switch (diff) {
      case -1: return "Yesterday";
      case 0:  return "Today";
      case 1:  return "Tomorrow";
      default: return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const isCompleted = !!workout.completedAt;
  const isReviewed = !!workout.reviewedAt;

  const chatPanel = (
    <WorkoutChatPanel
      traineeId={workout.traineeId}
      plannedWorkoutId={workout.id}
      viewerMode={viewerMode}
    />
  );

  return (
    <article
      id={`workout-${workout.id}`}
      data-today={displayName === "Today"}
      className="flex h-full flex-col overflow-hidden bg-[var(--shell-surface)]"
    >
      {/* Header — non-scrolling */}
      <div className="flex-none border-b border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-[var(--shell-ink)]">
              {displayName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              {workout.completedAt ? (
                <span className="text-[11px] text-[var(--shell-muted)]">
                  Completed {new Date(workout.completedAt).toLocaleString()}
                </span>
              ) : null}
              {viewerMode === "coach" && workout.reviewedAt ? (
                <span className="text-[11px] text-[var(--shell-muted)]">
                  Reviewed {new Date(workout.reviewedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isCompleted ? (
              <StatusBadge variant="default">
                <CheckCircle2Icon className="h-3 w-3" />
                Completed
              </StatusBadge>
            ) : null}
            {viewerMode === "coach" && isReviewed ? (
              <StatusBadge variant="solid">Reviewed</StatusBadge>
            ) : null}
            {viewerMode === "athlete" && (
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() =>
                  saveCompletion.mutate({
                    completedAt: isCompleted ? null : new Date(),
                    markAllExercisesDone: !isCompleted,
                  })
                }
                className="inline-flex items-center rounded-none border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95"
              >
                {isCompleted ? "Mark incomplete" : "Complete workout"}
              </button>
            )}
            {viewerMode === "coach" && isCompleted ? (
              !isReviewed ? (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() => saveReview.mutate({ reviewedAt: new Date() })}
                  className="rounded-none border border-transparent bg-[var(--shell-accent)] px-3 py-2 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Mark reviewed"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() => saveReview.mutate({ reviewedAt: null })}
                  className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Unmark reviewed"}
                </button>
              )
            ) : null}

            {/* Chat button — mobile only */}
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] md:hidden"
                  aria-label="Open chat"
                >
                  <MessageSquareIcon className="h-3.5 w-3.5" />
                  Chat
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
                <SheetTitle className="sr-only">Chat</SheetTitle>
                {chatPanel}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Body — two independently scrolling panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel: exercises + AI analysis — full width on mobile, 2/3 on desktop */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-3 p-4 md:flex-[2] md:border-r md:border-[var(--shell-border)]">
          {workout.note?.trim() ? (
            <div className="border-l-2 border-[var(--shell-accent)] pl-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                Coach note
              </p>
              <p className="mt-1 text-sm text-[var(--shell-ink)]">{workout.note}</p>
            </div>
          ) : null}
          {viewerMode === "coach" && isCompleted ? (
            <Accordion type="single" collapsible className="-mx-4 w-[calc(100%+2rem)]">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4">
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-[var(--shell-accent)]" />
                    AI analysis
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 px-4">
                  <WorkoutAnalysis
                    traineeId={workout.traineeId}
                    plannedWorkoutId={workout.id}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
          <div className="space-y-2">
            {workout.exercises.map((exercise, index) => (
              <WorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                viewerMode={viewerMode}
                isDetailView
                isToggleExerciseDonePending={toggleExerciseDone.isPending}
                isSetActionPending={toggleSetDone.isPending || updateSetWeight.isPending}
                onToggleExerciseDone={(input: ToggleExerciseDoneInput) =>
                  toggleExerciseDone.mutate(input)
                }
                onToggleSetDone={(input: ToggleSetDoneInput) =>
                  toggleSetDone.mutate(input)
                }
                onUpdateSetActual={(input: UpdateSetActualInput) =>
                  updateSetWeight.mutate(input)
                }
              />
            ))}
          </div>
        </div>

        {/* Right panel: chat — desktop only */}
        <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex md:flex-[1]">
          {chatPanel}
        </div>
      </div>
    </article>
  );
}
