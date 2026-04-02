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
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm tracking-[0.08em] text-[var(--shell-ink)]">
          Starred
        </h3>
        <span className="text-xs text-[var(--shell-muted)]">{data?.length ?? 0}</span>
      </div>

      {data?.length ? (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
          {data.map((x) => (
            <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
          ))}
        </div>
      ) : (
        <div className="rounded-none border border-dashed border-[var(--shell-border)] px-3 py-4 text-xs text-[var(--shell-muted)]">
          No starred exercises yet.
        </div>
      )}
    </section>
  );
}
