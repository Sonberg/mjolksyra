"use client";

import Link from "next/link";
import type { Credits } from "@/services/coaches/getCredits";
import type { CreditPricingItem } from "@/services/coaches/getCreditPricing";
import { formatActionName } from "./CoachCreditsSection";

type Props = {
  credits: Credits | null;
  creditPricing: CreditPricingItem[];
};

export function CoachCreditsSummaryCard({ credits, creditPricing }: Props) {
  const analyzeCost = creditPricing.find((x) => x.action === "AnalyzeWorkoutMedia")?.creditCost;

  return (
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">Credits</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--shell-ink)]">{credits?.totalRemaining ?? 0}</p>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">Total credits remaining</p>
        </div>
        <Link
          href="/app/coach/credits"
          className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
        >
          Open credits
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
          <p className="uppercase tracking-[0.12em] text-[var(--shell-muted)]">Included</p>
          <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">{credits?.includedRemaining ?? 0}</p>
        </div>
        <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2">
          <p className="uppercase tracking-[0.12em] text-[var(--shell-muted)]">Purchased</p>
          <p className="mt-1 text-sm font-semibold text-[var(--shell-ink)]">{credits?.purchasedRemaining ?? 0}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--shell-muted)]">
        {credits?.nextResetAt
          ? `Included credits reset on ${new Date(credits.nextResetAt).toLocaleDateString("sv-SE")}.`
          : "Included credits reset after successful subscription billing."}
      </p>

      {analyzeCost ? (
        <p className="mt-2 text-xs text-[var(--shell-muted)]">
          {formatActionName("AnalyzeWorkoutMedia")}: {analyzeCost} credits
        </p>
      ) : null}
    </section>
  );
}
