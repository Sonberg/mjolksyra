import { useSearchExercises } from "./hooks/useSearchExercises";
import { ExerciseRow } from "./ExerciseRow";

type Props = {
  freeText: string;
};

export function ExerciseSearch({ freeText }: Props) {
  const { data } = useSearchExercises({ freeText });

  return (
    <>
      {data?.data.map((x) => (
        <ExerciseRow key={x.id} exercise={x} />
      ))}
    </>
  );
}
