import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { Accordion } from "../ui/accordion";
import { DayExercise } from "./DayExercise";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlannedWorkout } from "@/api/plannedWorkouts/type";
import { RectangleEllipsisIcon } from "lucide-react";
import { DraggingToolTip } from "../DraggingToolTip";
import { draggingStyle } from "@/lib/draggingStyle";
import { PLANNED_AT } from "@/constants/dateFormats";

const DATE_FORMAT = "YYYY-MM-DD";

type Props = {
  date: dayjs.Dayjs;
  plannedWorkout: PlannedWorkout | null;
};

export function Day({ date, plannedWorkout }: Props) {
  // const id = useMemo(() => date.format(PLANNED_AT), [date]);
  // const data = useMemo(
  //   () => ({
  //     date,
  //     plannedWorkout,
  //     type: "plannedWorkout",
  //     allowedTypes: ["plannedExercise", "plannedWorkout", "exercise"],
  //     label: date.format("dddd, D MMM YYYY"),
  //   }),
  //   [date, plannedWorkout]
  // );

  // const {
  //   over,
  //   isOver,
  //   active,
  //   listeners,
  //   setDraggableNodeRef,
  //   setDroppableNodeRef,
  // } = useSortable({
  //   id,
  //   data,
  // });

  // const isOverContainer = useMemo(
  //   () => !!plannedWorkout?.exercises.find((x) => x.id === over?.id),
  //   [plannedWorkout, over]
  // );

  // const canDrop = data.allowedTypes.includes(active?.data.current?.type);

  const isToday = useMemo(() => {
    return dayjs().format(DATE_FORMAT) === date?.format(DATE_FORMAT);
  }, [date]);

  return useMemo(
    () => (
      <>
        <div className="border-l border-r border-b flex flex-col">
          <div
            className="font-bold text-xs p-2 border-b flex items-center justify-between"
            // ref={setDraggableNodeRef}
          >
            <div
              className={cn({
                "py-1 px-2 rounded-full select-none": true,
                "bg-red-800 text-white": isToday,
              })}
            >
              {date.date()}
            </div>
            {/* {plannedWorkout ? (
              <DraggingToolTip
                trigger={<RectangleEllipsisIcon className="h-4" />}
                listeners={listeners}
                onDelete={() => {}}
              />
            ) : null} */}
          </div>
          {/* <div className={contentClass} ref={setDroppableNodeRef}> */}
          <div
            className={cn({
              "flex flex-1 h-full min-h-32 flex-col": true,
              //   ...draggingStyle({ canDrop, isOver: isOverContainer || isOver }),
            })}
          >
            {plannedWorkout?.exercises.length ? (
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={plannedWorkout?.exercises.map((x) => x.id) ?? []}
              >
                {/* <Accordion type="multiple" className="w-full "> */}
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
                {/* </Accordion> */}
              </SortableContext>
            ) : (
              <div className="text-muted-foreground text-sm  place-items-center grid transition-all min-h-32 px-4 text-center opacity-0 hover:opacity-100">
                <div className="select-none">
                  Drag & drop exercises to start planning
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    ),
    [date, plannedWorkout]
  );
}
