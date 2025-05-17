import { getPlannedWorkouts } from "@/services/plannedWorkouts/getPlannedWorkout";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { usePlannedWorkouts } from "./hooks/usePlannedWorkouts";

type Props = {
  traineeId: string;
};

export function AthleteWorkouts({ traineeId }: Props) {
  const [mode, setMode] = useState<"past" | "future">("future");

  const past = usePlannedWorkouts({
    toDate: dayjs().add(-1, "day"),
    limit: 10,
    traineeId,
  });

  const future = usePlannedWorkouts({
    fromDate: dayjs(),
    limit: 10,
    traineeId,
  });

  console.log({ past, future });

  return (
    <div>
      <div className="text-2xl font-bold">Workouts</div>
    </div>
  );
}
