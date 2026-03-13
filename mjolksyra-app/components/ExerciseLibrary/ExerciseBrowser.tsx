import { useCallback, useEffect, useState } from "react";
import { ExerciseRow } from "./ExerciseRow";
import { useBrowseExercises } from "./hooks/useBrowserExercises";

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
  const [endNode, setEndNode] = useState<HTMLDivElement | null>(null);
  const [isEndIntersecting, setIsEndIntersecting] = useState(false);
  const endRef = useCallback((node: HTMLDivElement | null) => {
    setEndNode(node);
    if (!node) {
      setIsEndIntersecting(false);
    }
  }, []);

  useEffect(() => {
    if (!endNode) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsEndIntersecting(entry.isIntersecting);
    });

    observer.observe(endNode);
    return () => observer.disconnect();
  }, [endNode]);

  useEffect(() => {
    if (!isEndIntersecting) {
      return;
    }

    if (!browser.hasNextPage) {
      return;
    }

    browser.fetchNextPage();
  }, [browser, isEndIntersecting]);

  console.log(browser);

  if (!browser.isFetched) {
    return null;
  }

  return (
    <section className="mb-24">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-sm tracking-[0.08em] text-[var(--shell-ink)]">
          Browser
        </h3>
        <span className="text-xs text-[var(--shell-muted)]">
          {browser.data.length}
        </span>
      </div>

      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
        {browser.data.map((x) => (
          <ExerciseRow key={x.id} exercise={x} exercises={exercies} />
        ))}
      </div>

      <div ref={endRef} className="h-1 text-transparent">
        end
      </div>
      {browser.hasNextPage ? (
        <div className="grid place-items-center py-4 text-[var(--shell-muted)]">
          <Spinner size={20} />
        </div>
      ) : null}
    </section>
  );
}
