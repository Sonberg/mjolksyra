import { ExerciseRow } from "./ExerciseRow";
import { useStarredExercises } from "./hooks/useStarredExercises";

import { DeleteExercise } from "@/api/exercises/deleteExercise";
import { StarExercise } from "@/api/exercises/starExercise";
import { StarredExercises } from "@/api/exercises/starredExercises";

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
    <div className="mb-4">
      <div className="font-bold">Starred</div>
      {data?.map((x) => (
        <ExerciseRow key={x.id} exercise={x} exercises={exercises} />
      ))}
    </div>
  );
}
