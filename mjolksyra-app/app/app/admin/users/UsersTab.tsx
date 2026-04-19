"use client";

import { useMemo, useState } from "react";
import { type CoachRevenueItem } from "@/services/admin/schema";
import { grantCoachCredits } from "@/services/admin/grantCoachCredits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  initialCoaches: CoachRevenueItem[];
};

export function UsersTab({ initialCoaches }: Props) {
  const [coaches, setCoaches] = useState(initialCoaches);
  const [syncingCoachId, setSyncingCoachId] = useState<string | null>(null);
  const [syncingAthleteId, setSyncingAthleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    initialCoaches[0]?.coachUserId ?? "",
  );
  const [grantCreditsAmount, setGrantCreditsAmount] = useState<string>("50");
  const [grantReason, setGrantReason] = useState<string>("");
  const [grantingCredits, setGrantingCredits] = useState(false);

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
      const res = await fetch(`/api/admin/coaches/${coachUserId}/sync-subscriptions`, {
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

  async function syncAthlete(athleteUserId: string) {
    try {
      setError(null);
      setSyncSummary(null);
      setSyncingAthleteId(athleteUserId);
      const res = await fetch(`/api/admin/athletes/${athleteUserId}/sync-subscriptions`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.title ?? "Failed to sync athlete subscription.");
      }
      await refreshRevenue();
      setSyncSummary("Athlete subscription sync triggered.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sync athlete subscription.");
    } finally {
      setSyncingAthleteId(null);
    }
  }

  async function submitGrantCredits(coachUserId: string) {
    try {
      setError(null);
      setSyncSummary(null);
      setGrantingCredits(true);

      const purchasedCredits = Number(grantCreditsAmount);
      if (!Number.isFinite(purchasedCredits) || purchasedCredits <= 0) {
        throw new Error("Credits amount must be greater than 0.");
      }

      await grantCoachCredits({
        coachUserId,
        purchasedCredits,
        reason: grantReason.trim() || undefined,
      });

      setSyncSummary(`Granted ${purchasedCredits} purchased credits.`);
      setGrantReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to grant credits.");
    } finally {
      setGrantingCredits(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <div>
          <h2 className="text-lg text-[var(--shell-ink)]">Coachs & Athletes</h2>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            Monthly athlete revenue, coach billing setup, athlete statuses, and subscription sync actions.
          </p>
        </div>

        {syncSummary ? (
          <p className="mt-3 text-xs text-[var(--shell-muted)]">
            {syncSummary}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[19rem_1fr]">
        <aside className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
          <div className="border-b border-[var(--shell-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
            Coaches
          </div>
          <ScrollArea className="max-h-[36rem]">
          <ul>
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
                    <p className="text-sm text-[var(--shell-ink)]">{coach.coachName}</p>
                    <p className="text-xs text-[var(--shell-muted)]">{coach.coachEmail}</p>
                    <p className="mt-1 text-[11px] text-[var(--shell-muted)]">
                      {coach.activeSubscriptions} active subscriptions
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          </ScrollArea>
        </aside>

        <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
          {selectedCoach ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--shell-border)]/30 pb-3">
                <div>
                  <h3 className="text-lg text-[var(--shell-ink)]">{selectedCoach.coachName}</h3>
                  <p className="text-sm text-[var(--shell-muted)]">{selectedCoach.coachEmail}</p>
                </div>
                <SyncButton
                  onClick={() => void syncCoach(selectedCoach.coachUserId)}
                  loading={syncingCoachId === selectedCoach.coachUserId}
                  label="Sync"
                  size="md"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatusBox label="Billing setup" value={selectedCoach.billingSetupStatus} helper="Coach + platform subscription" />
                <StatusBox label="Platform fee" value={selectedCoach.platformFeeStatus} helper={selectedCoach.platformFeeTrialEndsAt
                  ? `Trial ends ${new Date(selectedCoach.platformFeeTrialEndsAt).toLocaleDateString("sv-SE")}`
                  : "Current platform fee status"} />
                <StatusBox label="Monthly revenue" value={formatSek(selectedCoach.monthlyAthleteRevenue)} helper="Active athlete subscriptions" />
                <StatusBox label="Total revenue" value={formatSek(selectedCoach.totalAthleteRevenue)} helper="Succeeded charges only" />
              </div>

              <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">Grant purchased credits</p>
                <div className="mt-3 grid gap-2 md:grid-cols-[9rem_1fr_auto]">
                  <input
                    value={grantCreditsAmount}
                    onChange={(event) => setGrantCreditsAmount(event.target.value)}
                    inputMode="numeric"
                    className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)] focus:outline-none"
                    placeholder="Credits"
                  />
                  <input
                    value={grantReason}
                    onChange={(event) => setGrantReason(event.target.value)}
                    className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)] focus:outline-none"
                    placeholder="Reason (optional)"
                  />
                  <SyncButton
                    onClick={() => void submitGrantCredits(selectedCoach.coachUserId)}
                    loading={grantingCredits}
                    label="Grant"
                    size="md"
                  />
                </div>
              </div>

              <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
                <div className="border-b border-[var(--shell-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="rounded-none">
                            {athlete.relationshipStatus}
                          </Badge>
                          <Badge variant="outline" className="rounded-none text-[var(--shell-muted)]">
                            {athlete.billingStatus}
                          </Badge>
                          {athlete.billingStatus === "Subscription missing" && (
                            <SyncButton
                              onClick={() => void syncAthlete(athlete.athleteUserId)}
                              loading={syncingAthleteId === athlete.athleteUserId}
                              label="Sync"
                              size="sm"
                            />
                          )}
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
    </div>
  );
}

function SyncButton({
  onClick,
  loading,
  label,
  size,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
  size: "sm" | "md";
}) {
  return (
    <Button
      type="button"
      size={size === "sm" ? "sm" : "default"}
      onClick={onClick}
      disabled={loading}
      className="rounded-none"
    >
      {loading ? "Syncing..." : label}
    </Button>
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
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">{label}</p>
        <p className="mt-2 text-lg font-semibold text-[var(--shell-ink)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--shell-muted)]">{helper}</p>
      </CardContent>
    </Card>
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
