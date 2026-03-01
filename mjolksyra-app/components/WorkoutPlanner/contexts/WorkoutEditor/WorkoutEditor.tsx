import { ReactNode, useMemo } from "react";
import { useWorkoutEditor } from "./WorkoutEditorContext";
import { useWorkouts } from "../Workouts";
import { WorkoutEditorExercise } from "./WorkoutEditorExercise";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlannedWorkoutActions } from "../PlannedWorkoutActions";
import dayjs from "dayjs";
import { RotateCcwIcon, UploadIcon } from "lucide-react";
import { monthId } from "@/lib/monthId";

export function WorkoutEditor({ children }: { children: ReactNode }) {
  const { data, dispatch } = useWorkouts();
  const { plannedWorkoutId, close } = useWorkoutEditor();
  const { update, delete: deleteWorkout } = usePlannedWorkoutActions();

  const plannedWorkout = useMemo(() => {
    if (!plannedWorkoutId) {
      return null;
    }

    return Object.values(data)
      .flatMap((x) => x)
      .find((x) => x.id == plannedWorkoutId);
  }, [data, plannedWorkoutId]);

  const updateDebounce = useDebounce(async (plannedWorkout: PlannedWorkout) => {
    await update({ plannedWorkout });
  }, 600);
  const isFutureWeek = dayjs(plannedWorkout?.plannedAt)
    .startOf("week")
    .isAfter(dayjs().startOf("week"));
  const isLocked = !!plannedWorkout?.completedAt || !isFutureWeek;
  const hasDraftExercises = !!plannedWorkout?.exercises.some((x) => !x.isPublished);

  async function onPublish() {
    if (!plannedWorkout) {
      return;
    }

    const publishedWorkout = {
      ...plannedWorkout,
      exercises: plannedWorkout.exercises.map((exercise) => ({
        ...exercise,
        isPublished: true,
      })),
    };

    await update({ plannedWorkout: publishedWorkout });
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: publishedWorkout,
      },
    });
  }

  async function onRevert() {
    if (!plannedWorkout) {
      return;
    }

    const publishedOnly = plannedWorkout.exercises.filter((exercise) => exercise.isPublished);

    if (publishedOnly.length === 0) {
      await deleteWorkout({ plannedWorkout });
      dispatch({
        type: "DELETE_WORKOUT",
        payload: {
          monthId: monthId(plannedWorkout.plannedAt),
          plannedWorkoutId: plannedWorkout.id,
        },
      });
      close();
      return;
    }

    const revertedWorkout = {
      ...plannedWorkout,
      exercises: publishedOnly,
    };

    await update({ plannedWorkout: revertedWorkout });
    dispatch({
      type: "SET_WORKOUT",
      payload: {
        monthId: monthId(plannedWorkout.plannedAt),
        plannedWorkout: revertedWorkout,
      },
    });
  }

  if (!plannedWorkout) {
    return children;
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 justify-between border-b px-6 py-6">
        <div className="flex flex-col gap-2">
          <div className="font-bold text-2xl flex items-center gap-4">
            {dayjs(plannedWorkout.plannedAt).format("MMMM D, YYYY")}
            {!isLocked && hasDraftExercises ? (
              <span className="h-2 w-2 rounded-full bg-sky-400" title="Draft changes" />
            ) : null}
          </div>
          {!isLocked && hasDraftExercises ? (
            <div className="flex items-center gap-2">
              <button
                style={{ fontSize: "0.75rem" }}
                className="inline-flex items-center gap-1 py-1 px-3 rounded-full border border-sky-700/60 bg-sky-900/20 text-sky-200 hover:bg-sky-900/35"
                onClick={onPublish}
                title="Publish drafts to athlete view"
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Publish
              </button>
              <button
                style={{ fontSize: "0.75rem" }}
                className="inline-flex items-center gap-1 py-1 px-3 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                onClick={onRevert}
                title="Revert and keep only published exercises"
              >
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Revert
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            style={{ fontSize: "0.75rem" }}
            className="py-1 px-3 bg-accent  hover:bg-accent-foreground hover:text-accent rounded-full"
            onClick={close}
          >
            Close
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        <div className="flex flex-col gap-8 px-6 py-8">
          {plannedWorkout.exercises.map((x) => (
            <WorkoutEditorExercise
              key={x.id}
              plannedExercise={x}
              plannedWorkout={plannedWorkout}
              update={updateDebounce}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
