import { useMemo } from "react";
import { Star } from "lucide-react";
import { Exercise } from "@/api/exercises/type";
import { useStarredExercises } from "./hooks/useStarredExercises";
import { cn } from "@/lib/utils";

type Props = {
  exercise: Exercise;
};

export function ExerciseRowStar({ exercise }: Props) {
  const starred = useStarredExercises();
  const isStarred = useMemo(
    () => starred.data?.find((x) => x.id == exercise.id),
    [exercise, starred.data]
  );

  const className = cn({
    "h-4": true,
    "hover:text-zinc-500 ": !isStarred,
    "text-zinc-600": !isStarred,
    "text-white": isStarred,
    "cursor-pointer": true,
  });

  return (
    <Star
      fill={isStarred ? "#FFF" : undefined}
      className={className}
      onClick={() =>
        isStarred ? starred.unstar(exercise.id) : starred.star(exercise.id)
      }
    />
  );
}
