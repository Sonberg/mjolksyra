import { useWorkouts } from "./useWorkouts";
import dayjs from "dayjs";
import { Workout } from "./Workout";

type Props = {
  traineeId: string;
};

export function WorkoutViewer({ traineeId }: Props) {
  const { data } = useWorkouts({ traineeId, fromDate: dayjs() });

  return (
    <div className="overflow-y-auto p-6 grid gap-8">
      {data.map((x) => (
        <Workout key={x.id} workout={x} />
      ))}
    </div>
  );
}
