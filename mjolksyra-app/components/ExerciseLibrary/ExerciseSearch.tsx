import { useSearchExercises } from "./hooks/useSearchExercises";
import { ExerciseRow } from "./ExerciseRow";

type Props = {
  freeText: string;
};

export function ExerciseSearch({ freeText }: Props) {
  const search = useSearchExercises({ freeText });

  return (
    <>
      {search.data?.map((x) => (
        <ExerciseRow key={x.id} exercise={x} />
      ))}
    </>
  );
}
