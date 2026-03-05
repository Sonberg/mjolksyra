import { getAuth } from "@/context/Auth";
import { getAdminStats } from "@/services/admin/getAdminStats";
import { getCoachRevenue } from "@/services/admin/getCoachRevenue";
import { UsersIcon, BriefcaseIcon, PersonStandingIcon, ActivityIcon, CircleDollarSignIcon } from "lucide-react";

export default async function AdminPage() {
  const auth = await getAuth({ redirect: true });
  const [stats, coachRevenue] = await Promise.all([
    getAdminStats({ accessToken: auth!.accessToken }),
    getCoachRevenue({ accessToken: auth!.accessToken }),
  ]);

  const formatted = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toString()}
          icon={<UsersIcon className="h-5 w-5 text-[var(--shell-muted)]" />}
        />
        <StatCard
          label="Coaches"
          value={stats.totalCoaches.toString()}
          icon={<BriefcaseIcon className="h-5 w-5 text-[var(--shell-muted)]" />}
        />
        <StatCard
          label="Athletes"
          value={stats.totalAthletes.toString()}
          icon={<PersonStandingIcon className="h-5 w-5 text-[var(--shell-muted)]" />}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions.toString()}
          icon={<ActivityIcon className="h-5 w-5 text-[var(--shell-muted)]" />}
        />
        <StatCard
          label="Total Revenue"
          value={formatted}
          icon={<CircleDollarSignIcon className="h-5 w-5 text-[var(--shell-muted)]" />}
        />
      </div>

      <section className="mt-8 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <div className="mb-4">
          <h2 className="text-lg text-[var(--shell-ink)]">Coach revenue and fee subscription</h2>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            Monthly athlete revenue, historical revenue, and coach platform fee status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[var(--shell-border)] text-xs uppercase tracking-[0.08em] text-[var(--shell-muted)]">
                <th className="px-3 py-2">Coach</th>
                <th className="px-3 py-2">Active subs</th>
                <th className="px-3 py-2">Monthly athlete revenue</th>
                <th className="px-3 py-2">Total athlete revenue</th>
                <th className="px-3 py-2">Billing setup</th>
                <th className="px-3 py-2">Platform fee</th>
              </tr>
            </thead>
            <tbody>
              {coachRevenue.map((coach) => (
                <tr key={coach.coachUserId} className="border-b border-[var(--shell-border)]/40 text-sm text-[var(--shell-ink)]">
                  <td className="px-3 py-3 align-top">
                    <p className="font-medium text-[var(--shell-ink)]">{coach.coachName}</p>
                    <p className="text-xs text-[var(--shell-muted)]">{coach.coachEmail}</p>
                  </td>
                  <td className="px-3 py-3">{coach.activeSubscriptions}</td>
                  <td className="px-3 py-3">
                    {formatSek(coach.monthlyAthleteRevenue)}
                  </td>
                  <td className="px-3 py-3">
                    {formatSek(coach.totalAthleteRevenue)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={billingSetupBadgeClass(coach.billingSetupStatus)}>
                      {coach.billingSetupStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={platformFeeBadgeClass(coach.platformFeeStatus)}
                      title={
                        coach.platformFeeTrialEndsAt
                          ? `Trial ends ${coach.platformFeeTrialEndsAt.toLocaleDateString("sv-SE")}`
                          : undefined
                      }
                    >
                      {coach.platformFeeStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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

function billingSetupBadgeClass(status: string) {
  if (status === "Configured") {
    return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-surface)]";
  }

  return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-ink)]";
}

function platformFeeBadgeClass(status: string) {
  if (status === "Active") {
    return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-surface)]";
  }

  if (status === "Trialing") {
    return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-ink)]";
  }

  if (status === "Not subscribed") {
    return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-ink)]";
  }

  return "inline-flex rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--shell-muted)]";
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--shell-muted)]">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">{value}</p>
    </div>
  );
}
