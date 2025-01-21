import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ChevronDown, EllipsisVertical } from "lucide-react";
import { useMemo, useState } from "react";

import { PlannedExercise, PlannedWorkout } from "@/api/plannedWorkouts/type";
// import { useMonthPlanner } from "./contexts/MonthPlanner";
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
  // const { update } = useMonthPlanner();
  // const [note, setNote] = useState(plannedExercise.note ?? "");
  const [isOpen, setOpen] = useState(false);

  // const updateNote = useDebounce((note: string) => {
  //   // update({
  //   //   ...plannedWorkout,
  //   //   exercises: plannedWorkout.exercises.map((x) =>
  //   //     x.id == plannedExercise.id
  //   //       ? {
  //   //           ...x,
  //   //           note,
  //   //         }
  //   //       : x
  //   //   ),
  //   // });
  // }, 1000);

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
        >
          <div
            onClick={() => setOpen((open) => !open)}
            className="grid grid-cols-[auto_1fr_auto] justify-between w-full text-sm  py-2  items-center gap-1"
          >
            <DraggingToolTip
              listeners={listeners}
              icon={<EllipsisVertical className="h-4" />}
              onDelete={() => {
                // update({
                //   ...plannedWorkout,
                //   exercises: plannedWorkout.exercises.filter(
                //     (x) => x.id !== plannedExercise.id
                //   ),
                // });
              }}
            />
            <div className="text-sm select-none text-left overflow-hidden whitespace-nowrap text-ellipsis">
              {plannedExercise.name}
            </div>

            <ChevronDown className="h-4" />
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
  // return useMemo(
  //   () => (
  //     <>
  //       <AccordionItem
  //         value={plannedExercise.id}
  //         className={cn({
  //           "border-b-0": isLast,
  //           "opacity-40": isDragging,
  //           "bg-background": isDragging,
  //         })}
  //         ref={setNodeRef}
  //         style={{ transform: CSS.Translate.toString(transform), transition }}
  //         {...attributes}
  //       >
  //         <AccordionTrigger className="text-sm py-2">
  //           <div className="flex items-center gap-1">
  //             <DraggingToolTip
  //               listeners={listeners}
  //               trigger={<EllipsisVertical className="h-4" />}
  //               onDelete={() => {
  //                 // update({
  //                 //   ...plannedWorkout,
  //                 //   exercises: plannedWorkout.exercises.filter(
  //                 //     (x) => x.id !== plannedExercise.id
  //                 //   ),
  //                 // });
  //               }}
  //             />
  //             <div className="text-sm select-none text-left">
  //               {plannedExercise.name}
  //             </div>
  //           </div>
  //         </AccordionTrigger>
  //         <AccordionContent className="px-2 pb-3">
  //           <Textarea
  //             value={note}
  //             className=" pt-0"
  //             placeholder="Sets, reps, tempo etc"
  //             onChange={(ev) => {
  //               setNote(ev.target.value);
  //               updateNote(ev.target.value);
  //             }}
  //           />
  //         </AccordionContent>
  //       </AccordionItem>
  //     </>
  //   ),
  //   [
  //     plannedExercise,
  //     transform,
  //     transition,
  //     setNodeRef,
  //     attributes,
  //     listeners,
  //     note,
  //     // update,
  //     updateNote,
  //   ]
  // );
}
