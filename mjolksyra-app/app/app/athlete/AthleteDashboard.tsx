import { UserTrainee } from "@/services/users/type";
import { CalendarIcon, DumbbellIcon, TrendingUpIcon } from "lucide-react";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import dayjs from "dayjs";
import { WorkoutViewer } from "@/components/WorkoutViewer";

type Props = {
  coach: UserTrainee;
};

export function AthleteDashboard({ coach }: Props) {
  const { data } = useQuery({
    queryKey: ["trainees", coach.traineeId],
    queryFn: ({ signal }) => getTrainee({ id: coach.traineeId, signal }),
    initialData: null,
  });

  if (!data) {
    return null;
  }

  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="rounded-xl border border-gray-800/50 bg-gray-950/50 p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Your Workouts</h2>
          <p className="text-sm text-gray-400 mt-1">
            View and track your workout progress
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Weekly Progress", icon: TrendingUpIcon, value: "--" },
          { name: "Active Programs", icon: DumbbellIcon, value: "--" },
          {
            name: "Next Session",
            icon: CalendarIcon,
            value: data.nextWorkoutAt
              ? dayjs(data.nextWorkoutAt).format("ddd DD/MM")
              : "--",
          },
        ].map((stat) => (
          <div
            key={stat.name}
            className="p-6 rounded-xl border border-gray-800/50 bg-gray-950/80 hover:bg-gray-900/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 grid place-items-center">
                <stat.icon className="w-5 h-5 text-stone-200" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">
                  {stat.name}
                </h3>
                <p className="text-lg font-semibold text-gray-100">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <AthleteWorkouts traineeId={data.id} /> */}
      <WorkoutViewer traineeId={data.id} />
    </div>
  );
}
