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
    <div className="mb-24">
      <div className="font-bold">Browser</div>
      {browser.data.map((x) => (
        <ExerciseRow key={x.id} exercise={x} exercises={exercies} />
      ))}
      <div ref={end.measureRef} className="text-black">
        end
      </div>
      {browser.hasNextPage ? (
        <div className="grid place-items-center py-4">
          <Spinner size={24} />
        </div>
      ) : null}
    </div>
  );
}
