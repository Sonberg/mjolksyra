import { ExerciseRow } from "./ExerciseRow";
import { useStarredExercises } from "./hooks/useStarredExercises";

import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";

type Props = {
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
    delete: DeleteExercise;
  };
};

export function ExerciseStarred({ exercises }: Props) {
  const { data, isFetched } = useStarredExercises({
    mutationOnly: false,
    exercises,
  });

  if (!isFetched) {
    return null;
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-[0.08em] text-zinc-100">
          Starred
        </h3>
        <span className="text-xs text-zinc-500">{data?.length ?? 0}</span>
      </div>

      {data?.length ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80">
          {data.map((x) => (
            <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-4 text-xs text-zinc-500">
          No starred exercises yet.
        </div>
      )}
    </section>
  );
}
