import { useSearchExercises } from "./hooks/useSearchExercises";
import { ExerciseRow } from "./ExerciseRow";

import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { SearchExercises } from "@/services/exercises/searchExercises";

type Props = {
  freeText: string;
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
    delete: DeleteExercise;
    search: SearchExercises;
  };
};

export function ExerciseSearch({ freeText, exercises }: Props) {
  const { data, isFetching } = useSearchExercises({ freeText, exercises });
  const hasQuery = freeText.trim().length > 0;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-[0.08em] text-zinc-100">
          Search
        </h3>
        <span className="text-xs text-zinc-500">
          {hasQuery ? data?.data.length ?? 0 : 0}
        </span>
      </div>

      {!hasQuery ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-4 text-xs text-zinc-500">
          Type to search exercises.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80">
          {data?.data.map((x) => (
            <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
          ))}
          {!isFetching && data?.data.length === 0 ? (
            <div className="px-3 py-4 text-xs text-zinc-500">
              No exercises match &quot;{freeText}&quot;.
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
