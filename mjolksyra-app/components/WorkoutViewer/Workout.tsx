import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Card, CardHeader, CardContent } from "../ui/card";
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
    <Card
      data-today={displayName === "Today"}
      className="overflow-hidden bg-white/10"
    >
      <CardHeader className="font-bold over p-4">
        <div className="flex items-center justify-between">
          {displayName}
          {displayName === "Today" ? (
            <div className="h-3 w-3 rounded-full bg-red-700" />
          ) : (
            <div />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 grid gap-4 bg-black rounded-t-lg">
        {workout.note?.trim() ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Note
            </p>
            <p className="mt-1 text-sm text-zinc-200">{workout.note}</p>
          </div>
        ) : null}
        {workout.exercises.map((exercise, index) => (
          <div key={exercise.id} className="grid gap-2">
            <div className="flex items-center gap-4">
              <div className="bg-accent font-bold h-8 w-8 grid place-items-center rounded">
                {index + 1}
              </div>
              <div className="font-bold text-sm">{exercise.name}</div>
            </div>
            {exercise.note?.trim() ? (
              <div className="ml-12 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                {exercise.note}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
