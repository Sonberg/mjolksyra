import { UserTrainee } from "@/services/users/type";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { WorkoutDetails } from "@/components/WorkoutViewer/WorkoutDetails";

type Props = {
  coach: UserTrainee;
  focusWorkoutId?: string;
  detailWorkoutId?: string;
  detailBackTab?: "past" | "future";
  initialWorkoutTab?: "past" | "future";
};

export function AthleteDashboard({
  coach,
  focusWorkoutId,
  detailWorkoutId,
  detailBackTab,
  initialWorkoutTab,
}: Props) {
  return detailWorkoutId ? (
    <WorkoutDetails
      traineeId={coach.traineeId}
      workoutId={detailWorkoutId}
      backTab={detailBackTab ?? initialWorkoutTab}
    />
  ) : (
    <WorkoutViewer
      traineeId={coach.traineeId}
      initialTab={initialWorkoutTab}
      focusWorkoutId={focusWorkoutId}
    />
  );
}
