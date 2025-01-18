import { useEffect } from "react";
import { ExerciseRow } from "./ExerciseRow";
import { useBrowseExercises } from "./hooks/useBrowserExercises";
import useOnScreen from "@/hooks/useOnScreen";
import { cn } from "@/lib/utils";

import { GetExercises } from "@/api/exercises/getExercises";
import { DeleteExercise } from "@/api/exercises/deleteExercise";
import { StarExercise } from "@/api/exercises/starExercise";
import { StarredExercises } from "@/api/exercises/starredExercises";

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
    <div className="mb-24">
      <div className="font-bold">Browser</div>
      {browser.data.map((x) => (
        <ExerciseRow key={x.id} exercise={x} exercises={exercies} />
      ))}
      <div ref={end.measureRef} className="text-background">
        end
      </div>
      {browser.hasNextPage ? (
        <div className="grid place-items-center py-4">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}

const Spinner = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
