import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

import { Accordion } from "../ui/accordion";
import { DayExercise } from "./DayExercise";
import { useMemo } from "react";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";

const DATE_FORMAT = "YYYY-MM-DD";

type Props = {
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout | null;
};

export function Day({ date, plannedWorkout }: Props) {
  const id = useMemo(() => date.format(DATE_FORMAT), [date]);

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      date,
      plannedWorkout,
      type: "workout",
    },
  });

  const isToday = useMemo(() => {
    return dayjs().format(DATE_FORMAT) === date?.format(DATE_FORMAT);
  }, [date]);

  const contentClass = cn({
    flex: true,
    "min-h-32": true,
    "flex-col": true,
    "bg-accent": isOver,
  });

  const dateClass = cn({
    "py-1": true,
    "px-2": true,
    "bg-red-800": isToday,
    "text-white": isToday,
    "rounded-full": true,
    "select-none": true,
  });

  return useMemo(
    () => (
      <div className="border" ref={setNodeRef}>
        <div className="font-bold text-xs p-2 border-b flex items-start">
          <div className={dateClass}>{date.date()}</div>
        </div>
        <div className={contentClass}>
          {plannedWorkout?.exercises.length ? (
            <Accordion type="multiple" className="w-full ">
              {plannedWorkout.exercises.map((x, index) => (
                <DayExercise
                  key={x.id}
                  index={index}
                  date={date}
                  plannedExercise={x}
                  plannedWorkout={plannedWorkout}
                  isLast={index === plannedWorkout.exercises.length - 1}
                />
              ))}
            </Accordion>
          ) : (
            <div className="text-muted-foreground text-sm  place-items-center grid transition-all min-h-32 px-4 text-center opacity-0 hover:opacity-100">
              <div className="select-none">
                Drag & drop exercises to start planning
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [date, plannedWorkout, dateClass, contentClass]
  );
}
