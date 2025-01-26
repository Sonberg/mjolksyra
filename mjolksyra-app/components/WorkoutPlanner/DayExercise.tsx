import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical } from "lucide-react";
import { useMemo, useState } from "react";

import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
import { DraggingToolTip } from "../DraggingToolTip";

type Props = {
  plannedExercise: PlannedExercise;
  plannedWorkout: PlannedWorkout | null;
  index: number;
  isLast: boolean;
  isGhost: boolean;
  date: dayjs.Dayjs;
};

export function DayExercise({
  plannedWorkout,
  plannedExercise,
  index,
  isLast,
  isGhost,
  date,
}: Props) {
  const [isOpen, setOpen] = useState(false);

  const data = useMemo(
    () => ({
      date,
      index,
      plannedWorkout,
      plannedExercise,
      source: "workout",
      type: "plannedExercise",
      allowedTypes: ["plannedExercise"],
      label: plannedExercise.name,
    }),
    [date, index, plannedWorkout, plannedExercise]
  );

  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: plannedExercise.id,
    data,
  });

  return useMemo(
    () => (
      <>
        <div
          className={cn({
            "border-b-0": isLast,
            "opacity-40": isDragging || isGhost,
            "bg-background": isDragging || isGhost,
            "hover:bg-accent/80": true,
            "bg-accent/40": isOpen,
          })}
          ref={setNodeRef}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          {...attributes}
          role="row"
        >
          <div
            onClick={() => setOpen((open) => !open)}
            className="grid grid-cols-[auto_1fr_auto] justify-between w-full text-sm  py-2  items-center gap-1"
          >
            <DraggingToolTip
              listeners={listeners}
              icon={<EllipsisVertical className="h-4" />}
              onDelete={() => {
                throw new Error("Not implemented");
              }}
            />
            <div className="text-sm select-none text-left overflow-hidden whitespace-nowrap text-ellipsis">
              {plannedExercise.name}
            </div>
          </div>
        </div>
      </>
    ),
    [
      plannedExercise,
      transform,
      transition,
      setNodeRef,
      attributes,
      listeners,
      isDragging,
      isGhost,
      isLast,
      isOpen,
    ]
  );
}
