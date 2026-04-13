"use client";

import { CompletedWorkout } from "@/services/completedWorkouts/type";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { PlusIcon, SparklesIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ExerciseQuickSearchOverlay } from "@/components/ExerciseLibrary/ExerciseQuickSearchOverlay";
import { WorkoutExerciseCard } from "./workout/WorkoutExerciseCard";
import { WorkoutChatPanel } from "@/components/WorkoutChat/WorkoutChatPanel";
import { WorkoutAnalysis } from "./workout/WorkoutAnalysisSection";
import { WorkoutDetailHeader } from "./WorkoutDetailHeader";
import { useWorkout } from "@/hooks/useWorkout";
import { v4 } from "uuid";
import { ExerciseType } from "@/lib/exercisePrescription";
import { ToggleExerciseDoneInput, ToggleSetDoneInput, UpdateSetActualInput, WorkoutSet } from "./workout/types";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

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
    reorderExercises,
    reorderSets,
    restore,
  } = useWorkout({ workout });

  const [chatOpen, setChatOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  function handleExerciseDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const exercises = workout.exercises;
    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderExercises.mutate({ exercises: arrayMove(exercises, oldIndex, newIndex) });
  }

  const exerciseIds = workout.exercises.map((e) => e.id);

  return (
    <article className="flex h-full flex-col overflow-hidden bg-[var(--shell-surface)]">
      <WorkoutDetailHeader
        displayName={displayName}
        isCompleted={isCompleted}
        createdAt={workout.createdAt}
        completedAt={workout.completedAt}
        plannedWorkoutId={workout.plannedWorkoutId}
        viewerMode={viewerMode}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onRestoreToPlanned={() => restore.mutate()}
        isRestoring={restore.isPending}
        onToggleCompletion={() =>
          saveCompletion.mutate({
            completedAt: isCompleted ? null : new Date(),
            markAllExercisesDone: !isCompleted,
          })
        }
        isSavingCompletion={saveCompletion.isPending}
        onOpenChat={() => setChatOpen(true)}
      />
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
          <SheetTitle className="sr-only">Chat</SheetTitle>
          <WorkoutChatPanel
            traineeId={workout.traineeId}
            completedWorkoutId={workout.id}
            viewerMode={viewerMode}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-2 md:flex-[2] md:border-r md:border-[var(--shell-border)]">
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleExerciseDragEnd}
          >
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {workout.exercises.map((exercise, index) => (
                  <WorkoutExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    viewerMode={viewerMode}
                    isDetailView
                    isEditMode={isEditMode}
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
                    onReorderSets={
                      viewerMode === "athlete"
                        ? (exerciseId, sets) => reorderSets.mutate({ exerciseId, sets: sets as Parameters<typeof reorderSets.mutate>[0]["sets"] })
                        : undefined
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Empty state or Add exercise button */}
          {viewerMode === "athlete" && !isEditMode ? (
            workout.exercises.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <button
                  type="button"
                  onClick={() => setAddExerciseOpen(true)}
                  className="inline-flex items-center gap-2 border border-dashed border-[var(--shell-border)] px-6 py-3 text-sm font-semibold text-[var(--shell-muted)] transition hover:border-[var(--shell-ink)] hover:text-[var(--shell-ink)]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add exercise
                </button>
              </div>
            ) : (
              <div className="mt-2 px-1">
                <button
                  type="button"
                  onClick={() => setAddExerciseOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-[var(--shell-border)] py-3 text-sm font-semibold text-[var(--shell-muted)] transition hover:border-[var(--shell-ink)] hover:text-[var(--shell-ink)]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add exercise
                </button>
              </div>
            )
          ) : null}

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
          <WorkoutChatPanel
            traineeId={workout.traineeId}
            completedWorkoutId={workout.id}
            viewerMode={viewerMode}
          />
        </div>
      </div>
    </article>
  );
}
