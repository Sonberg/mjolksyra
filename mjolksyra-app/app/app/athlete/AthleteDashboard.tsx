import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { WorkoutViewer } from "@/components/WorkoutViewer";
import { WorkoutDetails } from "@/components/WorkoutViewer/WorkoutDetails";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";

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
  const billingStatusValue = {
    PriceNotSet: "Price not set",
    AwaitingAthletePaymentMethod: "Awaiting payment method",
    AwaitingCoachStripeSetup: "Awaiting coach setup",
    PriceSet: "Price set",
    SubscriptionActive: "Active",
  }[data.billing.status];
  const formatBillingDate = (date: Date) => date.toLocaleDateString("sv-SE");

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
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 md:p-5">
            <PageSectionHeader
              title="Transactions"
              titleClassName="text-xl md:text-2xl"
              description="Your billing and payment history."
            />
            <div className="mt-4 border-t-2 border-[var(--shell-border)]/30 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--shell-muted)]">
                Billing status
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                    Status
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
                    {billingStatusValue}
                  </p>
                  <p className="mt-1 text-sm text-[var(--shell-muted)]">
                    {billingStatusText}
                  </p>
                </div>
                <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                    Last charge
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
                    {data.billing.lastChargedAt
                      ? formatBillingDate(new Date(data.billing.lastChargedAt))
                      : "—"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--shell-muted)]">
                    Most recent successful charge
                  </p>
                </div>
                <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
                    Next charge
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--shell-ink)]">
                    {data.billing.nextChargedAt
                      ? formatBillingDate(new Date(data.billing.nextChargedAt))
                      : "—"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--shell-muted)]">
                    Scheduled recurring payment
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
            {data.transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[var(--shell-muted)]">
                  No transactions yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--shell-border)]/30">
                {data.transactions.map((t) => {
                  const statusColor =
                    t.status === "Succeeded"
                      ? "text-green-600 dark:text-green-400"
                      : t.status === "Failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-[var(--shell-muted)]";
                  return (
                    <li
                      key={t.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${statusColor}`}>
                          {t.status}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                          {new Date(t.createdAt).toLocaleDateString("sv-SE")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--shell-ink)]">
                          {new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: t.currency.toUpperCase(),
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(t.amount)}
                        </p>
                        {t.receiptUrl ? (
                          <a
                            href={t.receiptUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)] underline-offset-2 hover:text-[var(--shell-ink)] hover:underline"
                          >
                            View receipt
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
      {selectedTab === "settings" ? (
        <div className="space-y-4">
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 md:p-5">
            <PageSectionHeader
              title="Settings"
              titleClassName="text-xl md:text-2xl"
              description="Manage your relationship and billing information."
            />
          </div>
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8">
            <div className="divide-y divide-[var(--shell-border)]/30 border-t-2 border-[var(--shell-border)]/30">
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
        </div>
      ) : null}
    </div>
  );
}
