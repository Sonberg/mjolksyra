import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/stores/plannerStore";
import { useDroppable } from "@dnd-kit/core";

import { Accordion } from "../ui/accordion";
import { DayExercise } from "./DayExercise";

const DATE_FORMAT = "YYYY-MM-DD";

type Props = {
  date: dayjs.Dayjs | undefined;
};

export function Day({ date }: Props) {
  const id = date?.format(DATE_FORMAT) ?? "";
  const workout = usePlannerStore((state) =>
    state.workouts.find((x) => x.date === id)
  );

  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      workoutId: workout?.id,
      workoutDate: id,
      type: "workout",
    },
  });

  const contentClass = cn({
    flex: true,
    "pr-2": true,
    "min-h-32": true,
    "flex-col": true,
    "bg-zinc-900": isOver,
  });

  if (!date) {
    return <div />;
  }

  return (
    <div className="border" ref={setNodeRef}>
      <div className={"font-bold text-xs pt-1 pl-2 pr-2 px-2"}>
        {date?.date()}
      </div>
      <div className={contentClass}>
        <Accordion type="multiple" className="w-full ">
          {workout?.exercises.map((x, index) => (
            <DayExercise
              key={x.id}
              exercise={x}
              index={index}
              workout={workout}
              isLast={index === workout.exercises.length - 1}
            />
          ))}{" "}
        </Accordion>
      </div>
    </div>
  );
}
