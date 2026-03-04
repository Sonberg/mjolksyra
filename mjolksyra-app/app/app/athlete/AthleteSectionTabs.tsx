"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserTrainee } from "@/services/users/type";
import {
  shellSectionTabClass,
  shellSegmentedContainerClass,
} from "@/components/Navigation/shellStyles";

type AthleteTab = "workouts" | "transactions" | "settings";

function getActiveTab(pathname: string): AthleteTab {
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/transactions")) return "transactions";
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
    { key: "settings", href: `/app/athlete/${traineeId}/settings`, label: "Settings" },
  ];

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className={`flex w-full ${shellSegmentedContainerClass}`}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`${shellSectionTabClass(isActive)} flex-1 text-center`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {coaches.length > 0 ? (
        <div className="flex w-full items-center gap-2 md:ml-auto md:w-auto">
          <span className="sr-only text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)] md:not-sr-only">
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
            className="h-10 w-full rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 text-sm text-[var(--shell-ink)] outline-none transition hover:bg-[var(--shell-surface-strong)] focus:border-[var(--shell-accent)] md:w-auto md:min-w-56"
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
