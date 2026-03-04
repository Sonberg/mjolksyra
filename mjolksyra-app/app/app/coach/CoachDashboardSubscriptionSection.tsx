"use client";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CoachPaymentStatus = {
  label: string;
  text: string;
  badgeClass: string;
};

type Props = {
  coachPaymentStatus: CoachPaymentStatus;
  includedAthletes: number;
  overagePriceSek: number;
  overageAthletes: number;
  isOpeningStripe: boolean;
  onOpenStripeDashboard: () => Promise<void> | void;
  trialEndsAt?: Date | null;
};

export function CoachDashboardSubscriptionSection({
  coachPaymentStatus,
  includedAthletes,
  overagePriceSek,
  overageAthletes,
  isOpeningStripe,
  onOpenStripeDashboard,
  trialEndsAt,
}: Props) {
  const basePlanSek = 399;
  const overageTotalSek = overageAthletes * overagePriceSek;
  const estimatedTotalSek = basePlanSek + overageTotalSek;

  const now = new Date();
  const isTrialing = trialEndsAt != null && trialEndsAt > now;
  const trialDaysRemaining = isTrialing
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-7">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
              Payments
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--shell-ink)] md:text-3xl">
              Coach subscription
            </h2>
            <p className="mt-2 text-sm text-[var(--shell-muted)]">
              Manage your Stripe connection, payouts, and monthly platform charge.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-none border-2 px-2.5 py-1 text-xs font-semibold",
              coachPaymentStatus.badgeClass,
            )}
          >
            {coachPaymentStatus.label}
          </span>
        </div>

        {isTrialing && (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3 text-sm text-[var(--shell-ink)]">
            Free trial active. Your first charge starts on{" "}
            <span className="font-semibold">
              {trialEndsAt!.toLocaleDateString("sv-SE")}
            </span>{" "}
            ({trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} remaining).
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              Monthly platform charge
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Base plan
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--shell-ink)]">{basePlanSek} kr</p>
              </div>
              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Overage
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--shell-ink)]">
                  {overageTotalSek} kr
                </p>
                <p className="mt-1 text-xs text-[var(--shell-muted)]">
                  {overageAthletes} x {overagePriceSek} kr
                </p>
              </div>
              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Estimated total
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--shell-ink)]">
                  {estimatedTotalSek} kr
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--shell-muted)]">
              Includes {includedAthletes} athletes. Athlete roster management lives in
              the Athletes tab. Overage quantity is synced to Stripe as active athletes above {includedAthletes}.
            </p>
          </div>

          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">
              Stripe account
            </p>
            <p className="mt-2 text-sm text-[var(--shell-ink)]">{coachPaymentStatus.text}</p>
            <Button
              type="button"
              onClick={onOpenStripeDashboard}
              disabled={isOpeningStripe}
              className="mt-4 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] font-semibold text-[var(--shell-surface)] hover:bg-[#ce2f10] disabled:opacity-60"
            >
              {isOpeningStripe ? <Spinner size={14} /> : "Open Stripe"}
            </Button>
            <p className="mt-2 text-xs text-[var(--shell-muted)]">
              Use Stripe to review payouts and update account settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
