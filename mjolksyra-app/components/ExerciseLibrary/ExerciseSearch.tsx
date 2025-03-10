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

  const { data } = useSearchExercises({ freeText, exercises });

  return (
    <>
      {data?.data.map((x) => (
        <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
      ))}
    </>
  );
}
