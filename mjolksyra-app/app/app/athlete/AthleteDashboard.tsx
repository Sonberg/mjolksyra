import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useState, type ReactNode } from "react";
import { CreditCardIcon, DumbbellIcon, SettingsIcon } from "lucide-react";

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

  const tabs: Array<{
    key: Tabs;
    label: string;
    icon: ReactNode;
  }> = [
    { key: "workouts", label: "Workouts", icon: <DumbbellIcon className="h-4 w-4" /> },
    {
      key: "transactions",
      label: "Transactions",
      icon: <CreditCardIcon className="h-4 w-4" />,
    },
    { key: "settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTab === "workouts" ? (
        <WorkoutViewer traineeId={data.id} />
      ) : null}
      {selectedTab === "transactions" ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-8">
          <h3 className="text-lg font-semibold text-white">Transactions</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Billing and payment history will appear here.
          </p>
        </div>
      ) : null}
      {selectedTab === "settings" ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-8">
          <h3 className="text-lg font-semibold text-white">Settings</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Coach relationship and preferences will be available here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
