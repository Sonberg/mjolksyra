"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import type { Credits } from "@/services/coaches/getCredits";
import type { CreditLedgerItem } from "@/services/coaches/getCreditLedger";
import type { CreditPricingItem } from "@/services/coaches/getCreditPricing";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";

type Props = {
  credits: Credits | null;
  creditPricing: CreditPricingItem[];
  creditLedger: CreditLedgerItem[];
};

export function CoachCreditsSection({ credits, creditPricing, creditLedger }: Props) {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageSectionHeader
          eyebrow="Credits"
          title="Usage and balance"
          description="Track remaining credits, review action costs, and see how credits are spent over time."
        />
        <button
          type="button"
          onClick={() => setPurchaseDialogOpen(true)}
          className="shrink-0 border border-transparent bg-[var(--shell-accent)] px-4 py-2 text-sm font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95"
        >
          Buy credits
        </button>
      </div>

      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Balance + action costs */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Credits balance</p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <Metric label="Included" value={`${credits?.includedRemaining ?? 0}`} />
              <Metric label="Purchased" value={`${credits?.purchasedRemaining ?? 0}`} />
              <Metric label="Total" value={`${credits?.totalRemaining ?? 0}`} />
            </div>
            <p className="mt-2 text-xs text-[var(--shell-muted)]">
              {credits?.nextResetAt
                ? `Included credits reset on ${new Date(credits.nextResetAt).toLocaleDateString("sv-SE")}.`
                : "Included credits reset after successful subscription billing."}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Action costs</p>
            {creditPricing.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--shell-muted)]">No action pricing found.</p>
            ) : (
              <ul className="mt-2 divide-y divide-[var(--shell-border)]">
                {creditPricing.map((item) => (
                  <li key={item.action} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-[var(--shell-ink)]">{formatActionName(item.action)}</span>
                    <span className="text-[var(--shell-muted)]">{item.creditCost} credits</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Ledger */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Credits ledger</p>
          {creditLedger.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--shell-muted)]">No credit activity yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-[var(--shell-border)]">
              {creditLedger.map((entry) => {
                const delta = entry.includedCreditsChanged + entry.purchasedCreditsChanged;
                const isPositive = delta >= 0;
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p className="text-sm text-[var(--shell-ink)]">{formatLedgerTitle(entry.type, entry.action)}</p>
                      <p className="text-xs text-[var(--shell-muted)]">
                        {new Date(entry.createdAt).toLocaleString("sv-SE")}
                        {entry.referenceId ? ` · ${entry.referenceId}` : ""}
                      </p>
                    </div>
                    <p className={cn("shrink-0 text-xs font-semibold", isPositive ? "text-[var(--shell-ink)]" : "text-[var(--shell-accent)]")}>
                      {isPositive ? "+" : ""}{delta}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function formatActionName(action: string) {
  if (action === "AnalyzeWorkoutMedia") {
    return "Workout media analysis";
  }

  if (action === "GenerateWorkoutPlan") {
    return "AI workout plan generation";
  }

  return action;
}

function formatLedgerTitle(type: string, action?: string | null) {
  if (type === "Deduct") {
    return action ? `${formatActionName(action)} charge` : "Usage charge";
  }

  if (type === "Purchase") {
    return "Credits purchase";
  }

  if (type === "Reset") {
    return "Included credits reset";
  }

  if (type === "AdminGrant") {
    return "Admin granted credits";
  }

  return type;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--shell-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--shell-ink)]">{value}</p>
    </div>
  );
}
