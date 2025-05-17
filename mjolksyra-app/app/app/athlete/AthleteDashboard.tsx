import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useState } from "react";
import { SettingsIcon } from "lucide-react";

type Tabs = "workouts" | "transactions" | "settings";
type Props = {
  coach: UserTrainee;
};

export function AthleteDashboard({ coach }: Props) {
  const [selectedTab, setSelectedTab] = useState<Tabs>("workouts");
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
      <div className="border-b pb-4 flex gap-6 items-center">
        <div
          onClick={() => setSelectedTab("workouts")}
          className={`relative text-2xl font-bold cursor-pointer transition-opacity ${
            selectedTab === "workouts"
              ? "opacity-100 after:absolute after:bottom-[-1rem] after:left-0 after:right-0 after:h-0.5 after:bg-white"
              : "opacity-70 hover:opacity-60"
          }`}
          children="Workouts"
        />
        <div
          onClick={() => setSelectedTab("transactions")}
          className={`relative text-2xl font-bold cursor-pointer transition-opacity ${
            selectedTab === "transactions"
              ? "opacity-100 after:absolute after:bottom-[-1rem] after:left-0 after:right-0 after:h-0.5 after:bg-white"
              : "opacity-70 hover:opacity-60"
          }`}
          children="Transactions"
        />

        <div
          onClick={() => setSelectedTab("settings")}
          className={`relative text-2xl font-bold cursor-pointer transition-opacity ${
            selectedTab === "settings"
              ? "opacity-100 after:absolute after:bottom-[-1rem] after:left-0 after:right-0 after:h-0.5 after:bg-white"
              : "opacity-70 hover:opacity-60"
          }`}
          children={<SettingsIcon />}
        />
      </div>
      {selectedTab === "workouts" ? (
        <WorkoutViewer traineeId={data.id} />
      ) : null}
    </div>
  );
}
