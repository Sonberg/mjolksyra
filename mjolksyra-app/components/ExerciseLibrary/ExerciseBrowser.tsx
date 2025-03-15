import { useEffect } from "react";
import { ExerciseRow } from "./ExerciseRow";
import { useBrowseExercises } from "./hooks/useBrowserExercises";
import useOnScreen from "@/hooks/useOnScreen";

import { Spinner } from "../Spinner";

export function ExerciseBrowser() {
  const browser = useBrowseExercises();
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
        <ExerciseRow key={x.id} exercise={x} />
      ))}
      <div ref={end.measureRef} className="text-background">
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
