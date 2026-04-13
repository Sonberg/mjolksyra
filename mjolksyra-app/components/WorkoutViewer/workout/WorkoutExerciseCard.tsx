import { CheckCircle2Icon, CircleIcon, ClipboardListIcon, GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ExerciseType, formatPrescription } from "@/lib/exercisePrescription";
import { WorkoutExerciseSetCard } from "./WorkoutExerciseSetCard";
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
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RemoveSetRowInput,
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutExercise,
  WorkoutSet,
} from "./types";

type Props = {
  exercise: WorkoutExercise;
  index: number;
  viewerMode: "athlete" | "coach";
  isDetailView: boolean;
  isEditMode: boolean;
  isToggleExerciseDonePending: boolean;
  isSetActionPending: boolean;
  onToggleExerciseDone: (input: ToggleExerciseDoneInput) => void;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  onAddSetRow?: (exerciseId: string) => void;
  onRemoveSetRow?: (input: RemoveSetRowInput) => void;
  onReorderSets?: (exerciseId: string, sets: WorkoutSet[]) => void;
};

const colHeaderCls =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]";

export function WorkoutExerciseCard({
  exercise,
  index,
  viewerMode,
  isDetailView,
  isEditMode,
  isToggleExerciseDonePending,
  isSetActionPending,
  onToggleExerciseDone,
  onToggleSetDone,
  onUpdateSetActual,
  onDeleteExercise,
  onAddSetRow,
  onRemoveSetRow,
  onReorderSets,
}: Props) {
  const targetType = exercise.prescription?.type as ExerciseType | undefined;
  const isSetsReps = targetType === ExerciseType.SetsReps;
  const isDurationSeconds = targetType === ExerciseType.DurationSeconds;
  const hasSets = isDetailView && !!exercise.prescription?.sets?.length;

  // Exercise-level sortable (participates in the parent DndContext)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = isEditMode
    ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  // Set-level drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleSetDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sets = exercise.prescription?.sets;
    if (!sets) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    onReorderSets?.(exercise.id, arrayMove(sets, oldIndex, newIndex));
  }

  const setIndices = exercise.prescription?.sets?.map((_, i) => i) ?? [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? attributes : {})}
      className="bg-[var(--shell-surface-strong)]"
    >
      {/* Exercise header row */}
      <div className="flex items-start gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
        {/* Drag handle — edit mode only */}
        {isEditMode && viewerMode === "athlete" ? (
          <button
            type="button"
            className="shrink-0 cursor-grab touch-none text-[var(--shell-muted)] active:cursor-grabbing"
            {...listeners}
            aria-label="Drag to reorder exercise"
          >
            <GripVerticalIcon className="h-4 w-4" />
          </button>
        ) : null}

        <div className="grid h-7 w-7 shrink-0 place-items-center bg-[var(--shell-accent)] text-xs font-bold text-[var(--shell-accent-ink)]">
          {index + 1}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={
                exercise.isDone
                  ? "text-sm font-semibold text-[var(--shell-muted)] line-through"
                  : "text-sm font-semibold text-[var(--shell-ink)]"
              }
            >
              {exercise.name}
            </p>
            {formatPrescription(exercise.prescription) ? (
              exercise.prescription?.sets?.length ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-0.5 inline-flex items-center gap-1 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-1.5 py-0.5 text-xs text-[var(--shell-muted)] transition hover:border-[var(--shell-ink)] hover:text-[var(--shell-ink)]"
                    >
                      <ClipboardListIcon className="h-3 w-3 shrink-0" />
                      {formatPrescription(exercise.prescription)}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="w-auto min-w-[11rem] p-0"
                  >
                    <div className="border-b border-[var(--shell-border)] px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                        Prescription
                      </p>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--shell-border)]">
                          <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                            Set
                          </th>
                          {isSetsReps ? (
                            <>
                              <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                                Kg
                              </th>
                              <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                                Reps
                              </th>
                            </>
                          ) : isDurationSeconds ? (
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                              Secs
                            </th>
                          ) : (
                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                              Meters
                            </th>
                          )}
                          <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--shell-border)]">
                        {exercise.prescription.sets.map((set, i) => (
                          <tr key={i}>
                            <td className="px-3 py-1.5 font-medium text-[var(--shell-ink)]">
                              {i + 1}
                            </td>
                            {isSetsReps ? (
                              <>
                                <td className="px-3 py-1.5 text-[var(--shell-ink)]">
                                  {set.target?.weightKg ?? "—"}
                                </td>
                                <td className="px-3 py-1.5 text-[var(--shell-ink)]">
                                  {set.target?.reps ?? "—"}
                                </td>
                              </>
                            ) : isDurationSeconds ? (
                              <td className="px-3 py-1.5 text-[var(--shell-ink)]">
                                {set.target?.durationSeconds ?? "—"}
                              </td>
                            ) : (
                              <td className="px-3 py-1.5 text-[var(--shell-ink)]">
                                {set.target?.distanceMeters ?? "—"}
                              </td>
                            )}
                            <td className="px-3 py-1.5 text-[var(--shell-muted)]">
                              {set.target?.note ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                  {formatPrescription(exercise.prescription)}
                </p>
              )
            ) : null}
          </div>

          {viewerMode === "athlete" && isDetailView ? (
            <div className="flex items-center gap-2">
              {/* Mark done — normal mode only */}
              {!isEditMode ? (
                <button
                  type="button"
                  disabled={isToggleExerciseDonePending}
                  onClick={() =>
                    onToggleExerciseDone({
                      exerciseId: exercise.id,
                      isDone: !(exercise.isDone ?? false),
                    })
                  }
                  className={
                    exercise.isDone
                      ? "inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition disabled:opacity-60"
                      : "inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-60"
                  }
                >
                  {exercise.isDone ? (
                    <CheckCircle2Icon className="h-3 w-3" />
                  ) : (
                    <CircleIcon className="h-3 w-3" />
                  )}
                  {exercise.isDone ? "Done" : "Mark done"}
                </button>
              ) : null}

              {/* Delete — edit mode only */}
              {isEditMode && onDeleteExercise ? (
                <button
                  type="button"
                  onClick={() => onDeleteExercise(exercise.id)}
                  className="inline-flex h-7 w-7 items-center justify-center border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-muted)] transition hover:border-red-300 hover:text-red-500"
                  title="Remove exercise"
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : exercise.isDone ? (
            <span className="inline-flex items-center gap-1.5 border border-transparent bg-[var(--shell-accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)]">
              <CheckCircle2Icon className="h-3 w-3" />
              Done
            </span>
          ) : null}
        </div>
      </div>

      {/* Exercise note */}
      {exercise.note?.trim() ? (
        <div className="mx-3 mb-3 border-l-2 border-[var(--shell-accent)] pl-3 sm:mx-4 sm:mb-4">
          <p className="text-xs text-[var(--shell-muted)]">{exercise.note}</p>
        </div>
      ) : null}

      {/* Sets table */}
      {hasSets ? (
        <div className="border-t border-[var(--shell-border)]">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 pb-1 pt-2 sm:px-4">
            {isEditMode ? (
              <div className="w-4 shrink-0" />
            ) : (
              <div className="w-6 shrink-0" />
            )}
            {isSetsReps ? (
              <>
                <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Kg</p>
                <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Reps</p>
              </>
            ) : isDurationSeconds ? (
              <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Secs</p>
            ) : (
              <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Meters</p>
            )}
            {isEditMode ? (
              <div className="ml-auto w-7 shrink-0" />
            ) : null}
          </div>

          {/* Set rows with sortable context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSetDragEnd}
          >
            <SortableContext items={setIndices} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-[var(--shell-border)]">
                {exercise.prescription!.sets!.map((set, setIndex) => (
                  <WorkoutExerciseSetCard
                    key={`${exercise.id}-${setIndex}`}
                    exerciseId={exercise.id}
                    set={set}
                    setIndex={setIndex}
                    targetType={targetType}
                    isEditable={viewerMode === "athlete"}
                    isEditMode={isEditMode}
                    isPending={isSetActionPending}
                    onToggleSetDone={onToggleSetDone}
                    onUpdateSetActual={onUpdateSetActual}
                    onRemoveSetRow={onRemoveSetRow}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add set — hidden in edit mode */}
          {viewerMode === "athlete" && onAddSetRow && !isEditMode ? (
            <div className="border-t border-[var(--shell-border)] px-3 py-2 sm:px-4">
              <button
                type="button"
                onClick={() => onAddSetRow(exercise.id)}
                className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
              >
                <PlusIcon className="h-3 w-3" />
                Add set
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Add set when no sets yet — hidden in edit mode */}
      {!hasSets && viewerMode === "athlete" && isDetailView && onAddSetRow && !isEditMode ? (
        <div className="border-t border-[var(--shell-border)] px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={() => onAddSetRow(exercise.id)}
            className="inline-flex items-center gap-1.5 border border-[var(--shell-border)] bg-[var(--shell-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
          >
            <PlusIcon className="h-3 w-3" />
            Add set
          </button>
        </div>
      ) : null}
    </div>
  );
}
