"use client";

import { useState } from "react";
import Link from "next/link";
import type { Credits } from "@/services/coaches/getCredits";
import type { CreditPricingItem } from "@/services/coaches/getCreditPricing";
import { formatActionName } from "./CoachCreditsSection";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import { Button } from "@/components/ui/button";

type Props = {
  credits: Credits | null;
  creditPricing: CreditPricingItem[];
};

export function CoachCreditsSummaryCard({ credits, creditPricing }: Props) {
  const analyzeCost = creditPricing.find((x) => x.action === "AnalyzeCompletedWorkoutMedia")?.creditCost;
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  return (
    <div className="bg-[var(--shell-surface-strong)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Credits</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={() => setPurchaseDialogOpen(true)}>
            Buy credits
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/app/coach/credits">Open credits</Link>
          </Button>
        </div>
      </div>

      <p className="mt-3 font-mono text-3xl font-semibold text-[var(--shell-ink)]">{credits?.totalRemaining ?? 0}</p>
      <p className="mt-1 text-xs text-[var(--shell-muted)]">Total credits remaining</p>

      <div className="mt-3 h-1 w-full bg-[var(--shell-border)]">
        <div
          className="h-1 bg-[var(--shell-accent)]"
          style={{ width: `${Math.min(100, ((credits?.includedRemaining ?? 0) / Math.max(1, credits?.totalRemaining ?? 1)) * 100)}%` }}
        />
      </div>

      <div className="mt-4 border-t border-[var(--shell-border)] pt-4 flex gap-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Included</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--shell-ink)]">{credits?.includedRemaining ?? 0}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Purchased</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[var(--shell-ink)]">{credits?.purchasedRemaining ?? 0}</p>
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

      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />
    </div>
  );
}
