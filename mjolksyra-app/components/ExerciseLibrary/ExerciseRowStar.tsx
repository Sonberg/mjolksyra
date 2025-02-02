import { useMemo } from "react";
import { Star } from "lucide-react";
import { Exercise } from "@/services/exercises/type";
import { useStarredExercises } from "./hooks/useStarredExercises";
import { cn } from "@/lib/utils";
import { StarredExercises } from "@/services/exercises/starredExercises";
import { StarExercise } from "@/services/exercises/starExercise";

type Props = {
  exercise: Exercise;
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
  };
};

export function ExerciseRowStar({ exercise, exercises }: Props) {
  const starred = useStarredExercises({ mutationOnly: true, exercises });
  const isStarred = useMemo(
    () => starred.data?.find((x) => x.id == exercise.id),
    [exercise, starred.data]
  );
  const className = cn({
    "h-4": true,
    "hover:text-accent-foreground": !isStarred,
    "text-accent-foreground": isStarred,
    "text-accent": !isStarred,
    "cursor-pointer": true,
  });

  return (
    <Star
      fill={isStarred ? "#FFF" : "transparent"}
      className={className}
      onClick={() =>
        isStarred ? starred.unstar(exercise.id) : starred.star(exercise.id)
      }
    />
  );
}
