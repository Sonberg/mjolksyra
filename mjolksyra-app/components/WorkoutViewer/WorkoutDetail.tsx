"use client";

import { CompletedWorkout } from "@/services/completedWorkouts/type";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { CheckCircle2Icon, MessageSquareIcon, PlusIcon, SparklesIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ExerciseQuickSearchOverlay } from "@/components/ExerciseLibrary/ExerciseQuickSearchOverlay";
import { WorkoutExerciseCard } from "./workout/WorkoutExerciseCard";
import { WorkoutChatPanel } from "@/components/WorkoutChat/WorkoutChatPanel";
import { WorkoutAnalysis } from "./workout/WorkoutAnalysisSection";
import { StatusBadge } from "./StatusBadge";
import { useWorkout } from "@/hooks/useWorkout";
import { v4 } from "uuid";
import { ExerciseType } from "@/lib/exercisePrescription";
import { ToggleExerciseDoneInput, ToggleSetDoneInput, UpdateSetActualInput } from "./workout/types";

type Props = {
  workout: CompletedWorkout;
  viewerMode?: "athlete" | "coach";
};

export function WorkoutDetail({
  workout,
  viewerMode = "athlete",
}: Props) {
  const {
    saveCompletion,
    toggleExerciseDone,
    toggleSetDone,
    updateSetWeight,
    addExercise,
    removeExercise,
    addSetRow,
    removeSetRow,
  } = useWorkout({ workout });

  const [chatOpen, setChatOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);

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
      case -1:
        return "Yesterday";
      case 0:
        return "Today";
      case 1:
        return "Tomorrow";
      default:
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const isCompleted = !!workout.completedAt;

  const chatPanel = (
    <WorkoutChatPanel
      traineeId={workout.traineeId}
      completedWorkoutId={workout.id}
      viewerMode={viewerMode}
    />
  );

  return (
    <article className="flex h-full flex-col overflow-hidden bg-[var(--shell-surface)]">
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
              ) : (
                <span className="text-[11px] text-[var(--shell-muted)]">
                  Session started {new Date(workout.createdAt ?? new Date()).toLocaleString()}
                </span>
              )}
              {workout.plannedWorkoutId ? (
                <span className="text-[11px] text-[var(--shell-muted)]">
                  Linked to planned workout
                </span>
              ) : (
                <span className="text-[11px] text-[var(--shell-muted)]">
                  Ad hoc session
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusBadge variant="default">
              <CheckCircle2Icon className="h-3 w-3" />
              {isCompleted ? "Completed" : "In progress"}
            </StatusBadge>
            {viewerMode === "athlete" ? (
              <>
                <button
                  type="button"
                  onClick={() => setAddExerciseOpen(true)}
                  className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Add exercise
                </button>
                <button
                  type="button"
                  disabled={saveCompletion.isPending}
                  onClick={() =>
                    saveCompletion.mutate({
                      completedAt: isCompleted ? null : new Date(),
                      markAllExercisesDone: !isCompleted,
                    })
                  }
                  className="inline-flex items-center border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95"
                >
                  {isCompleted ? "Mark incomplete" : "Complete workout"}
                </button>
              </>
            ) : null}

            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] md:hidden"
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-3 p-4 md:flex-[2] md:border-r md:border-[var(--shell-border)]">
          {viewerMode === "coach" ? (
            <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)]">
              <div className="flex items-center gap-2 border-b border-[var(--shell-border)] px-4 py-3">
                <SparklesIcon className="h-4 w-4 text-[var(--shell-accent)]" />
                <span className="text-sm font-semibold text-[var(--shell-ink)]">AI analysis</span>
              </div>
              <div className="px-4 py-4">
                <WorkoutAnalysis
                  traineeId={workout.traineeId}
                  completedWorkoutId={workout.id}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {workout.exercises.length === 0 && viewerMode === "athlete" ? (
              <div className="border border-dashed border-[var(--shell-border)] px-6 py-8 text-center">
                <p className="text-sm font-semibold text-[var(--shell-ink)]">No exercises yet</p>
                <p className="mt-1 text-xs text-[var(--shell-muted)]">
                  Add exercises to start building this session.
                </p>
              </div>
            ) : null}

            {workout.exercises.map((exercise, index) => (
              <WorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                viewerMode={viewerMode}
                isDetailView
                isToggleExerciseDonePending={toggleExerciseDone.isPending}
                isSetActionPending={
                  toggleSetDone.isPending ||
                  updateSetWeight.isPending ||
                  addSetRow.isPending ||
                  removeSetRow.isPending
                }
                onToggleExerciseDone={(input: ToggleExerciseDoneInput) => toggleExerciseDone.mutate(input)}
                onToggleSetDone={(input: ToggleSetDoneInput) => toggleSetDone.mutate(input)}
                onUpdateSetActual={(input: UpdateSetActualInput) => updateSetWeight.mutate(input)}
                onDeleteExercise={viewerMode === "athlete" ? (exerciseId) => removeExercise.mutate({ exerciseId }) : undefined}
                onAddSetRow={viewerMode === "athlete" ? (exerciseId) => addSetRow.mutate({ exerciseId }) : undefined}
                onRemoveSetRow={viewerMode === "athlete" ? (input) => removeSetRow.mutate(input) : undefined}
              />
            ))}
          </div>

          <ExerciseQuickSearchOverlay
            open={addExerciseOpen}
            onOpenChange={setAddExerciseOpen}
            title="Add exercise"
            onSelectExercise={(exercise) => {
              const prescriptionType =
                (exercise.type as ExerciseType | null) ?? ExerciseType.SetsReps;

              addExercise.mutate({
                exercise: {
                  id: v4(),
                  exerciseId: exercise.id,
                  name: exercise.name,
                  note: null,
                  isDone: false,
                  prescription: {
                    type: prescriptionType,
                    sets: [
                      { target: null, actual: null },
                      { target: null, actual: null },
                      { target: null, actual: null },
                    ],
                  },
                },
              });
            }}
          />
        </div>

        <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex md:flex-[1]">
          {chatPanel}
        </div>
      </div>
    </article>
  );
}
