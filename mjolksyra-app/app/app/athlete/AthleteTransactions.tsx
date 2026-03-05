import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { getTrainee } from "@/services/trainees/getTrainee";
import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";

type Props = {
  coach: UserTrainee;
};

export function AthleteTransactions({ coach }: Props) {
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
  );
}
