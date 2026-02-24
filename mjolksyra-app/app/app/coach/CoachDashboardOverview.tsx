"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { ApiClient } from "@/services/client";
import { Trainee } from "@/services/trainees/type";
import { User } from "@/services/users/type";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  user: User;
  trainees: Trainee[];
};

export function CoachDashboardOverview({ user, trainees }: Props) {
  const [isOpeningStripe, setIsOpeningStripe] = useState(false);
  const includedAthletes = 10;
  const overageAthletes = Math.max(0, trainees.length - includedAthletes);
  const billedTrainees = trainees.filter((x) => x.cost);
  const revenue = billedTrainees.reduce(
    (acc, trainee) => {
      if (!trainee.cost) return acc;

      acc.gross += trainee.cost.total;
      acc.coach += trainee.cost.coach;
      acc.fee += trainee.cost.applicationFee;
      return acc;
    },
    { gross: 0, coach: 0, fee: 0 },
  );
  const openStripeDashboard = useCallback(async () => {
    setIsOpeningStripe(true);
    try {
      const { data } = await ApiClient.get<{ url: string }>("/api/stripe/dashboard");
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } finally {
      setIsOpeningStripe(false);
    }
  }, []);
  const coachPaymentStatus =
    user.onboarding.coach === "Completed"
      ? {
          label: "Stripe connected",
          text: "Payouts and coach billing setup are active.",
          badgeClass: "border-emerald-800 bg-emerald-950 text-emerald-200",
        }
      : user.onboarding.coach === "Started"
        ? {
            label: "Setup in progress",
            text: "Complete your Stripe onboarding to enable coach billing and payouts.",
            badgeClass: "border-amber-800 bg-amber-950 text-amber-200",
          }
        : {
            label: "Not connected",
            text: "Connect Stripe to receive payouts and manage coach billing settings.",
            badgeClass: "border-zinc-700 bg-zinc-900 text-zinc-300",
          };

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Monthly recurring
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {revenue.gross.toLocaleString("sv-SE")} kr
          </p>
          <p className="mt-1 text-sm text-zinc-400">Projected athlete billing</p>
        </div>
        <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Coach payout
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {revenue.coach.toLocaleString("sv-SE")} kr
          </p>
          <p className="mt-1 text-sm text-zinc-400">Before Stripe transfer timing</p>
        </div>
        <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Platform fee
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {revenue.fee.toLocaleString("sv-SE")} kr
          </p>
          <p className="mt-1 text-sm text-zinc-400">Current trainee-based model</p>
        </div>
        <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Priced athletes
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {billedTrainees.length}/{trainees.length}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Billing starts after setting a price
          </p>
        </div>
      </section>

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
                coachPaymentStatus.badgeClass
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
                  <p className="mt-2 text-lg font-semibold text-white">$39</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                    Overage
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    ${overageAthletes * 4}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {overageAthletes} x $4
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                    Estimated total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    ${39 + overageAthletes * 4}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Includes {includedAthletes} athletes. Athlete roster management lives in the Athletes tab.
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Stripe account
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {coachPaymentStatus.text}
              </p>
              <Button
                type="button"
                onClick={openStripeDashboard}
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
    </div>
  );
}
