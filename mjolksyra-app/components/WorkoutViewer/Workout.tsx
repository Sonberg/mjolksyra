import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Card, CardHeader, CardDescription, CardContent } from "../ui/card";
import dayjs from "dayjs";
import { useMemo } from "react";

type Props = {
  workout: PlannedWorkout;
};

export function Workout({ workout }: Props) {
  const date = useMemo(() => {
    const [year, month, day] = workout.plannedAt.split("-");

    return dayjs()
      .year(Number(year))
      .month(Number(month) - 1)
      .date(Number(day));
  }, [workout.plannedAt]);

  const displayName = useMemo(() => {
    const today = dayjs();
    const diff = date.diff(today, "days");

    switch (diff) {
      case -1:
        return "Yesterday";

      case 0:
        return "Today";

      case 1:
        return "Tomorrow";

      default:
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  return (
    <Card data-today={displayName === "Today"} className="overflow-hidden">
      <CardHeader className="font-bold bg-black over p-4">
        <div className="flex items-center justify-between">
          {displayName}
          {displayName === "Today" ? (
            <div className="h-3 w-3 rounded-full bg-red-700" />
          ) : (
            <div />
          )}
        </div>
      </CardHeader>
      <CardDescription>{workout.note}</CardDescription>
      <CardContent className="p-4 grid gap-4 bg-gray-950/80">
        {workout.exercises.map((exercise, index) => (
          <div key={exercise.id} className="flex gap-4 items-center">
            <div className="bg-accent font-bold h-8 w-8 grid place-items-center rounded">
              {index + 1}
            </div>
            <div className="font-bold text-sm">{exercise.name}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
