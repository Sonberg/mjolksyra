import { CheckCircle2Icon, CircleIcon, ClipboardListIcon } from "lucide-react";
import { ExerciseType, formatPrescription } from "@/lib/exercisePrescription";
import { WorkoutExerciseSetCard } from "./WorkoutExerciseSetCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ToggleExerciseDoneInput,
  ToggleSetDoneInput,
  UpdateSetActualInput,
  WorkoutExercise,
} from "./types";

type Props = {
  exercise: WorkoutExercise;
  index: number;
  viewerMode: "athlete" | "coach";
  isDetailView: boolean;
  isToggleExerciseDonePending: boolean;
  isSetActionPending: boolean;
  onToggleExerciseDone: (input: ToggleExerciseDoneInput) => void;
  onToggleSetDone: (input: ToggleSetDoneInput) => void;
  onUpdateSetActual: (input: UpdateSetActualInput) => void;
};

const colHeaderCls =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]";

export function WorkoutExerciseCard({
  exercise,
  index,
  viewerMode,
  isDetailView,
  isToggleExerciseDonePending,
  isSetActionPending,
  onToggleExerciseDone,
  onToggleSetDone,
  onUpdateSetActual,
}: Props) {
  const targetType = exercise.prescription?.type as ExerciseType | undefined;
  const isSetsReps = targetType === ExerciseType.SetsReps;
  const isDurationSeconds = targetType === ExerciseType.DurationSeconds;
  const hasSets = isDetailView && !!exercise.prescription?.sets?.length;

  return (
    <div className="bg-[var(--shell-surface-strong)]">
      {/* Exercise header row */}
      <div className="flex items-start gap-3 p-3 sm:items-center sm:gap-4 sm:p-4">
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
                                Reps
                              </th>
                              <th className="px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                                Kg
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
                                  {set.target?.reps ?? "—"}
                                </td>
                                <td className="px-3 py-1.5 text-[var(--shell-ink)]">
                                  {set.target?.weightKg ?? "—"}
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
            <div className="w-6 shrink-0" />
            {isSetsReps ? (
              <>
                <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Reps</p>
                <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Kg</p>
              </>
            ) : isDurationSeconds ? (
              <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Secs</p>
            ) : (
              <p className={`w-[4.5rem] shrink-0 ${colHeaderCls}`}>Meters</p>
            )}
            <p className={`flex-1 ${colHeaderCls}`}>Note</p>
            <div className="w-[3.5rem] shrink-0" />
          </div>

          {/* Set rows */}
          <div className="divide-y divide-[var(--shell-border)]">
            {exercise.prescription!.sets!.map((set, setIndex) => (
              <WorkoutExerciseSetCard
                key={`${exercise.id}-${setIndex}-${set.actual?.reps ?? ""}-${set.actual?.weightKg ?? ""}-${set.actual?.durationSeconds ?? ""}-${set.actual?.distanceMeters ?? ""}-${set.actual?.note ?? ""}-${set.actual?.isDone ? "done" : "todo"}`}
                exerciseId={exercise.id}
                set={set}
                setIndex={setIndex}
                targetType={targetType}
                isEditable={viewerMode === "athlete"}
                isPending={isSetActionPending}
                onToggleSetDone={onToggleSetDone}
                onUpdateSetActual={onUpdateSetActual}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
