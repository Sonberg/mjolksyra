import { useEffect } from "react";
import { ExerciseRow } from "./ExerciseRow";
import { useBrowseExercises } from "./hooks/useBrowserExercises";
import useOnScreen from "@/hooks/useOnScreen";

import { GetExercises } from "@/services/exercises/getExercises";
import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { Spinner } from "../Spinner";

type Props = {
  exercies: {
    get: GetExercises;
    starred: StarredExercises;
    star: StarExercise;
    delete: DeleteExercise;
  };
};

export function ExerciseBrowser({ exercies }: Props) {
  const browser = useBrowseExercises({ exercies });
  const end = useOnScreen();

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    if (!browser.hasNextPage) {
      return;
    }

    browser.fetchNextPage();
  }, [browser, end.isIntersecting]);

  if (!browser.isFetched) {
    return null;
  }

  return (
    <section className="mb-24">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-[0.08em] text-zinc-100">
          Browser
        </h3>
        <span className="text-xs text-zinc-500">{browser.data.length}</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80">
        {browser.data.map((x) => (
          <ExerciseRow key={x.id} exercise={x} exercises={exercies} />
        ))}
      </div>

      <div ref={end.measureRef} className="h-1 text-transparent">
        end
      </div>
      {browser.hasNextPage ? (
        <div className="grid place-items-center py-4 text-zinc-500">
          <Spinner size={20} />
        </div>
      ) : null}
    </section>
  );
}
