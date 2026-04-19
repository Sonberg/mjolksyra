"use client";

import { useState } from "react";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { ChangePaymentMethodDialog } from "@/components/ChangePaymentMethod/ChangePaymentMethodDialog";
import { getTrainee } from "@/services/trainees/getTrainee";
import { UserTrainee } from "@/services/users/type";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  coach: UserTrainee;
};

export function AthleteTransactions({ coach }: Props) {
  const [changeCardOpen, setChangeCardOpen] = useState(false);
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
    PaymentFailed: "Your last payment failed. Update your payment method to avoid cancellation.",
  }[data.billing.status];
  const billingStatusValue = {
    PriceNotSet: "Price not set",
    AwaitingAthletePaymentMethod: "Awaiting payment method",
    AwaitingCoachStripeSetup: "Awaiting coach setup",
    PriceSet: "Price set",
    SubscriptionActive: "Active",
    PaymentFailed: "Payment failed",
  }[data.billing.status];
  const formatBillingDate = (date: Date) => date.toLocaleDateString("sv-SE");

  return (
    <div className="flex flex-col gap-8">
      {data.billing.status === "PaymentFailed" ? (
        <Alert variant="destructive">
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Your last payment failed. Update your payment method to avoid cancellation.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setChangeCardOpen(true)}
            >
              Update payment method
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <ChangePaymentMethodDialog
        open={changeCardOpen}
        onClose={() => setChangeCardOpen(false)}
      />
      <PageSectionHeader
        eyebrow="Billing"
        title="Transactions"
        titleClassName="text-xl md:text-2xl"
        description="Your billing and payment history."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[var(--shell-surface-strong)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Status</p>
          <p className="mt-2 text-xl font-semibold text-[var(--shell-ink)]">{billingStatusValue}</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">{billingStatusText}</p>
        </div>

        <div className="bg-[var(--shell-surface-strong)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Monthly cost</p>
          <p className="mt-2 text-xl font-semibold text-[var(--shell-ink)]">
            {data.cost
              ? new Intl.NumberFormat("sv-SE", { style: "currency", currency: data.cost.currency.toUpperCase(), minimumFractionDigits: 0 }).format(data.cost.total)
              : "—"}
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Set by your coach</p>
        </div>

        <div className="bg-[var(--shell-surface-strong)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Last charge</p>
          <p className="mt-2 text-xl font-semibold text-[var(--shell-ink)]">
            {data.billing.lastChargedAt ? formatBillingDate(new Date(data.billing.lastChargedAt)) : "—"}
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Most recent successful charge</p>
        </div>

        <div className="bg-[var(--shell-surface-strong)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Next charge</p>
          <p className="mt-2 text-xl font-semibold text-[var(--shell-ink)]">
            {data.billing.nextChargedAt ? formatBillingDate(new Date(data.billing.nextChargedAt)) : "—"}
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Scheduled recurring payment</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[var(--shell-surface-strong)] p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Payment method</p>
          <p className="mt-1 text-sm text-[var(--shell-ink)]">
            {data.billing.status === "AwaitingAthletePaymentMethod"
              ? "No payment method added yet."
              : "Card on file with Stripe."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setChangeCardOpen(true)}
        >
          {data.billing.status === "AwaitingAthletePaymentMethod" ? "Add card" : "Update card"}
        </Button>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">History</p>
        {data.transactions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--shell-muted)]">No transactions yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--shell-border)]">
            {data.transactions.map((t) => {
              const statusColor =
                t.status === "Succeeded"
                  ? "font-semibold text-[var(--shell-ink)]"
                  : t.status === "Failed"
                    ? "text-destructive"
                    : "text-[var(--shell-muted)]";
              return (
                <li
                  key={t.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"
                >
                  <div className="flex items-center gap-6">
                    <p className={`w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] ${statusColor}`}>
                      {t.status}
                    </p>
                    <p className="text-xs text-[var(--shell-muted)]">
                      {new Date(t.createdAt).toLocaleDateString("sv-SE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <p className="w-20 text-sm font-semibold text-[var(--shell-ink)]">
                      {new Intl.NumberFormat("sv-SE", {
                        style: "currency",
                        currency: t.currency.toUpperCase(),
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(t.amount)}
                    </p>
                    <div className="w-24">
                      {t.receiptUrl ? (
                        <a
                          href={t.receiptUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)] underline-offset-2 hover:text-[var(--shell-ink)] hover:underline"
                        >
                          View receipt
                        </a>
                      ) : null}
                    </div>
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
