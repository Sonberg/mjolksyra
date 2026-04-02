import { getAuth } from "@/context/Auth";
import { getAdminStats } from "@/services/admin/getAdminStats";
import { UsersIcon, BriefcaseIcon, PersonStandingIcon, ActivityIcon, CircleDollarSignIcon } from "lucide-react";

export default async function AdminPage() {
  const auth = await getAuth({ redirect: true });
  const stats = await getAdminStats({ accessToken: auth!.accessToken });

  const formatted = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue);

  return (
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
  );
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
    <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--shell-muted)]">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">{value}</p>
    </div>
  );
}
