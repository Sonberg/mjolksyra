import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { useState, type ReactNode } from "react";
import { CreditCardIcon, DumbbellIcon, SettingsIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";

type Tabs = "workouts" | "transactions" | "settings";
type Props = {
  coach: UserTrainee;
};

export function AthleteDashboard({ coach }: Props) {
  const [selectedTab, setSelectedTab] = useState<Tabs>("workouts");
  const cancel = useMutation({
    mutationKey: ["trainees", coach.traineeId, "cancel"],
    mutationFn: () => cancelTrainee({ traineeId: coach.traineeId }),
    onSettled: () => location.reload(),
  });
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
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-3">
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
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-8">
          <h3 className="text-lg font-semibold text-white">Transactions</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Billing and payment history will appear here.
          </p>
        </div>
      ) : null}
      {selectedTab === "settings" ? (
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-8">
          <h3 className="text-lg font-semibold text-white">Settings</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Coach relationship and preferences will be available here.
          </p>
          <div className="mt-6">
            <button
              type="button"
              disabled={cancel.isPending}
              onClick={() => cancel.mutateAsync()}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancel.isPending ? "Cancelling..." : "Cancel relationship"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
