"use client";

import { usePathname, useRouter } from "next/navigation";
import { UserTrainee } from "@/services/users/type";
import { NavigationTabs } from "@/components/Navigation/NavigationTabs";

type AthleteTab = "workouts" | "transactions" | "settings" | "insights";

function getActiveTab(pathname: string): AthleteTab {
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/transactions")) return "transactions";
  if (pathname.includes("/insights")) return "insights";
  return "workouts";
}

type Props = {
  traineeId: string;
  coaches: UserTrainee[];
  onCoachChange: (coach: UserTrainee) => void;
};

export function AthleteSectionTabs({ traineeId, coaches, onCoachChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  const tabs: Array<{ key: AthleteTab; href: string; label: string }> = [
    { key: "workouts", href: `/app/athlete/${traineeId}/workouts`, label: "Workouts" },
    {
      key: "transactions",
      href: `/app/athlete/${traineeId}/transactions`,
      label: "Transactions",
    },
    { key: "insights", href: `/app/athlete/${traineeId}/insights`, label: "Insights" },
    { key: "settings", href: `/app/athlete/${traineeId}/settings`, label: "Settings" },
  ];

  return (
    <div className="flex w-full items-center gap-2 overflow-hidden">
      <div className="min-w-0 flex-1">
        <NavigationTabs tabs={tabs} activeTab={activeTab} />
      </div>
      {coaches.length > 1 ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="sr-only text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
            Coach
          </span>
          <select
            value={traineeId}
            onChange={(event) => {
              const selectedCoach = coaches.find((x) => x.traineeId === event.target.value);
              if (!selectedCoach) return;
              onCoachChange(selectedCoach);
              router.push(`/app/athlete/${selectedCoach.traineeId}/${activeTab}`);
            }}
            className="h-10 w-[160px] rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 text-sm text-[var(--shell-ink)] outline-none transition hover:bg-[var(--shell-surface-strong)] focus:border-[var(--shell-accent)] md:w-auto md:min-w-56"
          >
            {coaches.map((coach) => (
              <option key={coach.traineeId} value={coach.traineeId}>
                {coach.givenName} {coach.familyName}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
