import { PlannedWorkout } from "@/api/plannedWorkouts/type";
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
    <Card>
      <CardHeader className=" font-bold bg-accent/50">{displayName}</CardHeader>
      <CardDescription>{workout.note}</CardDescription>
      <CardContent className="pt-8 grid gap-4">
        {workout.exercises.map((exercise, index) => (
          <div key={exercise.id} className="flex gap-4 items-center">
            <div className="bg-accent font-bold h-10 w-10 grid place-items-center rounded">
              {index + 1}
            </div>
            <div>{exercise.name}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
