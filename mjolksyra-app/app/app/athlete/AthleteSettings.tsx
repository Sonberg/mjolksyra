"use client";

import { useState } from "react";
import { PageHeader } from "@/components/Navigation/PageHeader";
import { ChangePaymentMethodDialog } from "@/components/ChangePaymentMethod/ChangePaymentMethodDialog";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";
import { getTrainee } from "@/services/trainees/getTrainee";
import { UserTrainee } from "@/services/users/type";
import { useMutation, useQuery } from "@tanstack/react-query";

type Props = {
  coach: UserTrainee;
};

export function AthleteSettings({ coach }: Props) {
  const [changeCardOpen, setChangeCardOpen] = useState(false);
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        titleClassName="text-xl md:text-2xl"
        description="Manage your relationship and billing information."
        sectionClassName="p-4 md:p-5"
      />
      <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-8">
        <div className="divide-y divide-[var(--shell-border)]/30">
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

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-[var(--shell-ink)]">
                Payment method
              </p>
              <p className="text-xs text-[var(--shell-muted)]">
                Card used for monthly billing
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChangeCardOpen(true)}
              className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
            >
              Change card
            </button>
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
      <ChangePaymentMethodDialog
        open={changeCardOpen}
        onClose={() => setChangeCardOpen(false)}
      />
    </div>
  );
}
