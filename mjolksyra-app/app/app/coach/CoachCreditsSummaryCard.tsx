"use client";

import { useState } from "react";
import Link from "next/link";
import type { Credits } from "@/services/coaches/getCredits";
import type { CreditPricingItem } from "@/services/coaches/getCreditPricing";
import { formatActionName } from "./CoachCreditsSection";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";

type Props = {
  credits: Credits | null;
  creditPricing: CreditPricingItem[];
};

export function CoachCreditsSummaryCard({ credits, creditPricing }: Props) {
  const analyzeCost = creditPricing.find((x) => x.action === "AnalyzeCompletedWorkoutMedia")?.creditCost;
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  return (
    <div className="bg-[var(--shell-surface-strong)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Credits</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--shell-ink)]">{credits?.totalRemaining ?? 0}</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Total credits remaining</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setPurchaseDialogOpen(true)}
            className="border border-transparent bg-[var(--shell-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95"
          >
            Buy credits
          </button>
          <Link
            href="/app/coach/credits"
            className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]"
          >
            Open credits
          </Link>
        </div>
      </div>

      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--shell-muted)]">Included</p>
          <p className="mt-1 text-lg font-semibold text-[var(--shell-ink)]">{credits?.includedRemaining ?? 0}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--shell-muted)]">Purchased</p>
          <p className="mt-1 text-lg font-semibold text-[var(--shell-ink)]">{credits?.purchasedRemaining ?? 0}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--shell-muted)]">
        {credits?.nextResetAt
          ? `Resets on ${new Date(credits.nextResetAt).toLocaleDateString("sv-SE")}.`
          : "Resets after successful subscription billing."}
      </p>

      {analyzeCost ? (
        <p className="mt-1 text-xs text-[var(--shell-muted)]">
          {formatActionName("AnalyzeCompletedWorkoutMedia")}: {analyzeCost} credits
        </p>
      ) : null}
    </div>
  );
}
