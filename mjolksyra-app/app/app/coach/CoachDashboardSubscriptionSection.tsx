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
};

export function CoachDashboardSubscriptionSection({
  coachPaymentStatus,
  includedAthletes,
  overagePriceSek,
  overageAthletes,
  isOpeningStripe,
  onOpenStripeDashboard,
}: Props) {
  const basePlanSek = 399;
  const overageTotalSek = overageAthletes * overagePriceSek;
  const estimatedTotalSek = basePlanSek + overageTotalSek;

  return (
    <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-7">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Payments
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Coach subscription
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Manage your Stripe connection, payouts, and monthly platform charge.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
              coachPaymentStatus.badgeClass,
            )}
          >
            {coachPaymentStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Monthly platform charge
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Base plan
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{basePlanSek} kr</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Overage
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {overageTotalSek} kr
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {overageAthletes} x {overagePriceSek} kr
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Estimated total
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {estimatedTotalSek} kr
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Includes {includedAthletes} athletes. Athlete roster management lives in
              the Athletes tab. Overage quantity is synced to Stripe as active athletes above {includedAthletes}.
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Stripe account
            </p>
            <p className="mt-2 text-sm text-zinc-300">{coachPaymentStatus.text}</p>
            <Button
              type="button"
              onClick={onOpenStripeDashboard}
              disabled={isOpeningStripe}
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-100 font-semibold text-black hover:bg-zinc-300 disabled:opacity-60"
            >
              {isOpeningStripe ? <Spinner size={14} /> : "Open Stripe"}
            </Button>
            <p className="mt-2 text-xs text-zinc-500">
              Use Stripe to review payouts and update account settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
