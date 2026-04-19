import {
  PlannedExercise,
  PlannedWorkout,
} from "@/services/plannedWorkouts/type";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useMemo } from "react";
import { useWorkouts } from "../Workouts";
import { monthId } from "@/lib/monthId";
import { arrayMove } from "@dnd-kit/sortable";
import { ExercisePrescription } from "@/lib/exercisePrescription";
import { ExercisePrescriptionEditor } from "@/components/ExercisePrescriptionEditor";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout;
  update: (_: PlannedWorkout) => void;
};

export function WorkoutEditorExercise({
  plannedExercise,
  plannedWorkout,
  update,
}: Props) {
  const { dispatch } = useWorkouts();
  const draftExercises = plannedWorkout.draftExercises ?? plannedWorkout.publishedExercises;
  const index = useMemo(
    () =>
      draftExercises.findIndex((x) => x.id === plannedExercise.id),
    [plannedExercise, draftExercises],
  );

  const canMoveUp = index !== 0;
  const canMoveDown = index !== draftExercises.length - 1;

  async function onMoveUp() {
    const updatedWorkout = {
      ...plannedWorkout,
      draftExercises: arrayMove(draftExercises, index, index - 1),
    };

    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onMoveDown() {
    const updatedWorkout = {
      ...plannedWorkout,
      draftExercises: arrayMove(draftExercises, index, index + 1),
    };

    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onUpdateNote(value: string) {
    const updatedWorkout = {
      ...plannedWorkout,
      draftExercises: draftExercises.map((x) =>
        x.id == plannedExercise.id
          ? { ...x, note: value, isPublished: false }
          : x,
      ),
    };
    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  async function onUpdatePrescription(
    prescription: ExercisePrescription | null,
  ) {
    const updatedWorkout = {
      ...plannedWorkout,
      draftExercises: draftExercises.map((x) =>
        x.id == plannedExercise.id
          ? { ...x, prescription, isPublished: false }
          : x,
      ),
    };
    update(updatedWorkout);
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: updatedWorkout,
      },
    });
  }

  return (
    <article className="group overflow-hidden rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--shell-muted)]">
            Exercise
          </p>
          <div className="truncate font-[var(--font-display)] text-lg text-[var(--shell-ink)]">
            {index + 1}.{"  "}
            {plannedExercise.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="size-9 rounded-none"
          >
            <ArrowUpIcon data-icon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="size-9 rounded-none"
          >
            <ArrowDownIcon data-icon />
          </Button>
        </div>
      </div>
      <Textarea
        className="min-h-[92px] mb-2 w-full resize-y rounded-none  bg-[var(--shell-surface)] border border-[var(--shell-border)] px-3 py-2 text-sm font-medium text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus-visible:ring-[var(--shell-accent)]"
        value={plannedExercise.note ?? ""}
        onChange={(ev) => onUpdateNote(ev.target.value)}
        placeholder="Exercise note (optional)"
      />

      <ExercisePrescriptionEditor
        prescription={plannedExercise.prescription}
        exerciseId={plannedExercise.id}
        onChange={onUpdatePrescription}
        size="default"
      />
    </article>
  );
}
