import { ExerciseRow } from "./ExerciseRow";
import { useStarredExercises } from "./hooks/useStarredExercises";

export function ExerciseStarred() {
  const { data } = useStarredExercises();

  return (
    <div className="mb-8">
      <div className="font-bold">Starred</div>
      {data?.map((x) => (
        <ExerciseRow key={x.id} exercise={x} />
      ))}
    </div>
  );
}
