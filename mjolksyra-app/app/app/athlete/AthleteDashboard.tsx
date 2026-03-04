import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { WorkoutDetails } from "@/components/WorkoutViewer/WorkoutDetails";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";

type Tabs = "workouts" | "transactions" | "settings";
type Props = {
  coach: UserTrainee;
  focusWorkoutId?: string;
  detailWorkoutId?: string;
  detailBackTab?: "past" | "future";
  initialWorkoutTab?: "past" | "future";
  selectedTab: Tabs;
};

export function AthleteDashboard({
  coach,
  focusWorkoutId,
  detailWorkoutId,
  detailBackTab,
  initialWorkoutTab,
  selectedTab,
}: Props) {
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

  return (
    <div className="space-y-6">
      {selectedTab === "workouts" ? (
        detailWorkoutId ? (
          <WorkoutDetails
            traineeId={data.id}
            workoutId={detailWorkoutId}
            backTab={detailBackTab ?? initialWorkoutTab}
          />
        ) : (
          <WorkoutViewer
            traineeId={data.id}
            initialTab={initialWorkoutTab}
            focusWorkoutId={focusWorkoutId}
          />
        )
      ) : null}
      {selectedTab === "transactions" ? (
        <div className="space-y-4">
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--shell-muted)]">
              Billing status
            </p>
            <p className="mt-2 text-sm text-[var(--shell-ink)]">{billingStatusText}</p>
            {data.billing.lastChargedAt ? (
              <p className="mt-1 text-xs text-[var(--shell-muted)]">
                Last charge: {new Date(data.billing.lastChargedAt).toLocaleDateString()}
              </p>
            ) : null}
          </div>
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8">
          <h3 className="text-lg font-semibold text-[var(--shell-ink)]">Transactions</h3>
          <p className="mt-2 text-sm text-[var(--shell-muted)]">
            Billing and payment history will appear here.
          </p>
        </div>
        </div>
      ) : null}
      {selectedTab === "settings" ? (
        <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8">
          <h3 className="text-lg font-semibold text-[var(--shell-ink)]">Settings</h3>

          <div className="mt-6 divide-y divide-[var(--shell-border)]/30 border-t-2 border-[var(--shell-border)]/30">
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-[var(--shell-ink)]">
                  Monthly price
                </p>
                <p className="text-xs text-[var(--shell-muted)]">
                  Total charged each month
                </p>
              </div>
              {data.cost ? (
                <p className="text-sm font-semibold text-[var(--shell-ink)]">
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: data.cost.currency.toUpperCase(),
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(data.cost.total)}
                  <span className="ml-1 text-xs font-normal text-[var(--shell-muted)]">
                    / month
                  </span>
                </p>
              ) : (
                <p className="text-sm text-[var(--shell-muted)]">Not set</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              disabled={cancel.isPending}
              onClick={() => cancel.mutateAsync()}
              className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancel.isPending ? "Cancelling..." : "Cancel relationship"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
