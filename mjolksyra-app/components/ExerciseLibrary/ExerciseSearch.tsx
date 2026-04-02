import { useSearchExercises } from "./hooks/useSearchExercises";
import { ExerciseRow } from "./ExerciseRow";

import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { SearchExercises } from "@/services/exercises/searchExercises";

type Props = {
  freeText: string;
  filters: {
    sports: string[];
    levels: string[];
    createdByMe: boolean;
  };
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
    delete: DeleteExercise;
    search: SearchExercises;
  };
};

export function ExerciseSearch({ freeText, filters, exercises }: Props) {
  const { data, isFetching } = useSearchExercises({ freeText, filters, exercises });
  const hasQuery = freeText.trim().length > 0
    || filters.sports.length > 0
    || filters.levels.length > 0
    || filters.createdByMe;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm tracking-[0.08em] text-[var(--shell-ink)]">
          Search
        </h3>
        <span className="text-xs text-[var(--shell-muted)]">
          {hasQuery ? data?.data.length ?? 0 : 0}
        </span>
      </div>

      {!hasQuery ? (
        <div className="rounded-none border border-dashed border-[var(--shell-border)] px-3 py-4 text-xs text-[var(--shell-muted)]">
          Type or use filters to search exercises.
        </div>
      ) : (
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
          {data?.data.map((x) => (
            <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
          ))}
          {!isFetching && data?.data.length === 0 ? (
            <div className="px-3 py-4 text-xs text-[var(--shell-muted)]">
              No exercises match &quot;{freeText}&quot;.
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
