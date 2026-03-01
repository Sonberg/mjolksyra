import { useDraggable } from "@dnd-kit/core";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Exercise } from "@/services/exercises/type";
import { useCallback, useId, useMemo } from "react";
import { capitalizeFirstLetter } from "@/lib/capitalizeFirstLetter";
import { GripVertical } from "lucide-react";

import { ExerciseRowStar } from "./ExerciseRowStar";
import { ExerciseRowDelete } from "./ExerciseRowDelete";

import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { StarExercise } from "@/services/exercises/starExercise";
import { StarredExercises } from "@/services/exercises/starredExercises";

type Props = {
  exercise: Exercise;
  exercises: {
    starred: StarredExercises;
    star: StarExercise;
    delete: DeleteExercise;
  };
};

export function ExerciseRow({ exercise, exercises }: Props) {
  const id = useId();
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: exercise.id + id,
    data: {
      label: exercise.name,
      exercise: exercise,
      source: "library",
      type: "exercise",
    },
  });

  const hoverCard = useCallback((title: string, value: string | null) => {
    if (!value) {
      return null;
    }

    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1">
        <div className="mb-1 text-xs font-semibold text-zinc-300">{title}</div>
        <div className="text-xs text-zinc-400">{capitalizeFirstLetter(value)}</div>
      </div>
    );
  }, []);

  return useMemo(
    () => (
      <>
        <div className="text-sm border-b border-zinc-800 last:border-b-0">
          <HoverCard openDelay={500}>
            <div
              ref={setNodeRef}
              className="flex items-center justify-between gap-2 px-2 py-2.5 text-sm transition hover:bg-zinc-900/70"
            >
              <div
                {...listeners}
                {...attributes}
                className="grid h-6 w-6 shrink-0 cursor-move place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="flex-1 truncate text-left font-medium text-zinc-200 hover:text-white"
                  title={exercise.name}
                >
                  {exercise.name}
                </button>
              </HoverCardTrigger>
              <div className="flex shrink-0 items-center gap-2">
                <ExerciseRowDelete exercise={exercise} exercises={exercises} />
                <ExerciseRowStar exercise={exercise} exercises={exercises} />
              </div>
            </div>
            <HoverCardContent className="z-30 w-72 border-zinc-700 bg-zinc-950 text-zinc-100">
              <div className="mb-4 font-semibold">{exercise.name}</div>
              <div className="grid grid-cols-2 gap-2">
                {hoverCard("Category", exercise.category)}
                {hoverCard("Force", exercise.force)}
                {hoverCard("Level", exercise.level)}
                {hoverCard("Mechanic", exercise.mechanic)}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </>
    ),
    [setNodeRef, listeners, attributes, exercise, exercises, hoverCard]
  );
}
