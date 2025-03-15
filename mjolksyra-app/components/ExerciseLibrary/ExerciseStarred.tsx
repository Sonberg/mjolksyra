import { ExerciseRow } from "./ExerciseRow";
import { useStarredExercises } from "./hooks/useStarredExercises";


export function ExerciseStarred() {
  const { data, isFetched } = useStarredExercises({
    mutationOnly: false,
  });

  if (!isFetched) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="font-bold">Starred</div>
      {data?.map((x) => (
        <ExerciseRow key={x.id} exercise={x} />
      ))}
    </div>
  );
}
