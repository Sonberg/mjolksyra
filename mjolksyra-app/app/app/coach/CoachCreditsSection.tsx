"use client";

import { cn } from "@/lib/utils";
import type { Credits } from "@/services/coaches/getCredits";
import type { CreditLedgerItem } from "@/services/coaches/getCreditLedger";
import type { CreditPricingItem } from "@/services/coaches/getCreditPricing";

type Props = {
  credits: Credits | null;
  creditPricing: CreditPricingItem[];
  creditLedger: CreditLedgerItem[];
};

export function CoachCreditsSection({ credits, creditPricing, creditLedger }: Props) {
  return (
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-7">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">Credits</p>
          <h2 className="mt-2 text-2xl text-[var(--shell-ink)] md:text-3xl">Usage and balance</h2>
          <p className="mt-2 text-sm text-[var(--shell-muted)]">
            Track remaining credits, review action costs, and see how credits are spent over time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">Credits balance</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Metric label="Included" value={`${credits?.includedRemaining ?? 0}`} />
              <Metric label="Purchased" value={`${credits?.purchasedRemaining ?? 0}`} />
              <Metric label="Total" value={`${credits?.totalRemaining ?? 0}`} />
            </div>
            <p className="mt-3 text-xs text-[var(--shell-muted)]">
              {credits?.nextResetAt
                ? `Included credits reset on ${new Date(credits.nextResetAt).toLocaleDateString("sv-SE")}.`
                : "Included credits reset after successful subscription billing."}
            </p>
            <div className="mt-3 border border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                Action costs
              </p>
              {creditPricing.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--shell-muted)]">No action pricing found.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-[var(--shell-ink)]">
                  {creditPricing.map((item) => (
                    <li key={item.action} className="flex items-center justify-between">
                      <span>{formatActionName(item.action)}</span>
                      <span className="text-[var(--shell-muted)]">{item.creditCost} credits</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--shell-muted)]">Credits ledger</p>
            {creditLedger.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--shell-muted)]">No credit activity yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {creditLedger.map((entry) => {
                  const delta = entry.includedCreditsChanged + entry.purchasedCreditsChanged;
                  const isPositive = delta >= 0;
                  return (
                    <li key={entry.id} className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-[var(--shell-ink)]">{formatLedgerTitle(entry.type, entry.action)}</p>
                        <p className={cn("text-xs font-semibold", isPositive ? "text-green-600" : "text-[var(--shell-accent)]")}>
                          {isPositive ? "+" : ""}
                          {delta}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[var(--shell-muted)]">
                        {new Date(entry.createdAt).toLocaleString("sv-SE")}
                        {entry.referenceId ? ` - ${entry.referenceId}` : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function formatActionName(action: string) {
  if (action === "AnalyzeWorkoutMedia") {
    return "Workout media analysis";
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
    <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--shell-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--shell-ink)]">{value}</p>
    </div>
  );
}
