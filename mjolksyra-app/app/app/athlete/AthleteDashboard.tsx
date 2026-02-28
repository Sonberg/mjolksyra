import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import type { ReactNode } from "react";
import { CreditCardIcon, DumbbellIcon, SettingsIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { useRouter } from "next/navigation";

type Tabs = "workouts" | "transactions" | "settings";
type Props = {
  coach: UserTrainee;
  focusWorkoutId?: string;
  initialWorkoutTab?: "past" | "future";
  selectedTab: Tabs;
};

export function AthleteDashboard({
  coach,
  focusWorkoutId,
  initialWorkoutTab,
  selectedTab,
}: Props) {
  const router = useRouter();
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

  const billingStatusText = {
    PriceNotSet: "Your coach has not set a monthly price yet.",
    AwaitingAthletePaymentMethod: "Add a payment method to activate billing.",
    AwaitingCoachStripeSetup: "Your coach needs to finish Stripe setup before billing can start.",
    PriceSet: "Price is set. Billing will activate when setup is complete.",
    SubscriptionActive: "Monthly billing is active.",
  }[data.billing.status];

  const tabs: Array<{
    key: Tabs;
    label: string;
    icon: ReactNode;
    href: string;
  }> = [
    {
      key: "workouts",
      label: "Workouts",
      icon: <DumbbellIcon className="h-4 w-4" />,
      href: `/app/athlete/${coach.traineeId}/workouts`,
    },
    {
      key: "transactions",
      label: "Transactions",
      icon: <CreditCardIcon className="h-4 w-4" />,
      href: `/app/athlete/${coach.traineeId}/transactions`,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingsIcon className="h-4 w-4" />,
      href: `/app/athlete/${coach.traineeId}/settings`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Billing status
        </p>
        <p className="mt-2 text-sm text-zinc-200">{billingStatusText}</p>
        {data.billing.lastChargedAt ? (
          <p className="mt-1 text-xs text-zinc-500">
            Last charge: {new Date(data.billing.lastChargedAt).toLocaleDateString()}
          </p>
        ) : null}
      </div>

      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => router.push(tab.href)}
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
        <WorkoutViewer
          traineeId={data.id}
          initialTab={initialWorkoutTab}
          focusWorkoutId={focusWorkoutId}
        />
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

          <div className="mt-6 divide-y divide-zinc-800 border-t border-zinc-800">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Monthly price
                </p>
                <p className="text-xs text-zinc-500">
                  Total charged each month
                </p>
              </div>
              {data.cost ? (
                <p className="text-sm font-semibold text-zinc-100">
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: data.cost.currency.toUpperCase(),
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(data.cost.total)}
                  <span className="ml-1 text-xs font-normal text-zinc-400">
                    / month
                  </span>
                </p>
              ) : (
                <p className="text-sm text-zinc-500">Not set</p>
              )}
            </div>
          </div>

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
