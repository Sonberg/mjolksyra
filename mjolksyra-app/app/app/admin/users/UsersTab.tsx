"use client";

import { useMemo, useState } from "react";
import { type CoachRevenueItem } from "@/services/admin/schema";

type Props = {
  initialCoaches: CoachRevenueItem[];
};

export function UsersTab({ initialCoaches }: Props) {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [syncingCoachId, setSyncingCoachId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    initialCoaches[0]?.coachUserId ?? "",
  );

  const sorted = useMemo(
    () =>
      [...coaches].sort((a, b) =>
        a.coachName.localeCompare(b.coachName, "sv-SE", { sensitivity: "base" }),
      ),
    [coaches],
  );
  const selectedCoach =
    sorted.find((coach) => coach.coachUserId === selectedCoachId) ?? sorted[0] ?? null;

  async function refreshRevenue() {
    const res = await fetch("/api/admin/coaches/revenue");
    if (!res.ok) {
      throw new Error("Failed to refresh user billing data.");
    }
    const data = (await res.json()) as CoachRevenueItem[];
    setCoaches(data);
  }

  async function syncCoach(coachUserId: string) {
    try {
      setError(null);
      setSyncSummary(null);
      setSyncingCoachId(coachUserId);
      const res = await fetch(`/api/admin/coaches/${coachUserId}/ensure-platform-subscription`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Failed to sync coach subscription.");
      }
      await refreshRevenue();
      setSyncSummary("Coach subscription synced.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync coach subscription.");
    } finally {
      setSyncingCoachId(null);
    }
  }

  async function syncAll() {
    try {
      setError(null);
      setSyncSummary(null);
      setIsSyncingAll(true);
      const res = await fetch("/api/admin/coaches/ensure-platform-subscriptions", {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Failed to sync all coach subscriptions.");
      }
      const body = (await res.json()) as { total: number; success: number; failed: number };
      await refreshRevenue();
      setSyncSummary(`Synced ${body.success}/${body.total} coaches. Failed: ${body.failed}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync all coach subscriptions.");
    } finally {
      setIsSyncingAll(false);
    }
  }

  return (
    <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg text-[var(--shell-ink)]">Coach revenue and fee subscription</h2>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            Monthly athlete revenue, coach billing setup, athlete statuses, and subscription sync actions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void syncAll()}
          disabled={isSyncingAll}
          className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)] disabled:opacity-50"
        >
          {isSyncingAll ? "Syncing..." : "Sync all subscriptions"}
        </button>
      </div>

      {syncSummary ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
          {syncSummary}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-accent)]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
        <aside className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
          <div className="border-b-2 border-[var(--shell-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
            Coaches
          </div>
          <ul className="max-h-[36rem] overflow-y-auto">
            {sorted.map((coach) => {
              const isActive = selectedCoach?.coachUserId === coach.coachUserId;
              return (
                <li key={coach.coachUserId} className="border-b border-[var(--shell-border)]/30 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCoachId(coach.coachUserId)}
                    className={`w-full px-3 py-2 text-left transition ${
                      isActive
                        ? "bg-[var(--shell-surface-strong)]"
                        : "bg-[var(--shell-surface)] hover:bg-[var(--shell-surface-strong)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">{coach.coachName}</p>
                    <p className="text-xs text-[var(--shell-muted)]">{coach.coachEmail}</p>
                    <p className="mt-1 text-[11px] text-[var(--shell-muted)]">
                      {coach.activeSubscriptions} active subscriptions
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
          {selectedCoach ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[var(--shell-border)]/30 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--shell-ink)]">{selectedCoach.coachName}</h3>
                  <p className="text-sm text-[var(--shell-muted)]">{selectedCoach.coachEmail}</p>
                </div>
                <button
                  type="button"
                  disabled={syncingCoachId === selectedCoach.coachUserId || isSyncingAll}
                  onClick={() => void syncCoach(selectedCoach.coachUserId)}
                  className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)] disabled:opacity-50"
                >
                  {syncingCoachId === selectedCoach.coachUserId ? "Syncing..." : "Ensure setup"}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatusBox label="Billing setup" value={selectedCoach.billingSetupStatus} helper="Coach + platform subscription" />
                <StatusBox label="Platform fee" value={selectedCoach.platformFeeStatus} helper={selectedCoach.platformFeeTrialEndsAt
                  ? `Trial ends ${new Date(selectedCoach.platformFeeTrialEndsAt).toLocaleDateString("sv-SE")}`
                  : "Current platform fee status"} />
                <StatusBox label="Monthly revenue" value={formatSek(selectedCoach.monthlyAthleteRevenue)} helper="Active athlete subscriptions" />
                <StatusBox label="Total revenue" value={formatSek(selectedCoach.totalAthleteRevenue)} helper="Succeeded charges only" />
              </div>

              <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)]">
                <div className="border-b-2 border-[var(--shell-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
                  Athletes and status
                </div>
                {selectedCoach.athletes.length === 0 ? (
                  <p className="p-3 text-sm text-[var(--shell-muted)]">No athletes connected.</p>
                ) : (
                  <ul className="divide-y divide-[var(--shell-border)]/30">
                    {selectedCoach.athletes.map((athlete) => (
                      <li key={athlete.athleteUserId} className="flex flex-wrap items-start justify-between gap-2 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--shell-ink)]">{athlete.athleteName}</p>
                          <p className="text-xs text-[var(--shell-muted)]">{athlete.athleteEmail}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]">
                            {athlete.relationshipStatus}
                          </span>
                          <span className="inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                            {athlete.billingStatus}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--shell-muted)]">No coaches found.</p>
          )}
        </section>
      </div>
    </section>
  );
}

function StatusBox({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--shell-ink)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--shell-muted)]">{helper}</p>
    </div>
  );
}

function formatSek(amount: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
