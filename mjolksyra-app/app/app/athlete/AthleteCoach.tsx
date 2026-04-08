import { cn } from "@/lib/utils";
import { UserTrainee } from "@/services/users/type";
import { UserCircle2Icon } from "lucide-react";
import Link from "next/link";

type Props = {
  coach: UserTrainee;
  isSelected: boolean;
  href: string;
  onSelect: () => void;
};

export function AthleteCoach({ coach, isSelected, href, onSelect }: Props) {
  const classNames = cn({
    "flex items-center gap-3 border p-3 transition-[background-color] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)]": true,
    "cursor-pointer border-[var(--shell-border)] bg-[var(--shell-surface)] hover:bg-[var(--shell-surface-strong)]":
      !isSelected,
    "border-[var(--shell-border)] bg-[var(--shell-surface-strong)]": isSelected,
  });
  return (
    <Link
      className={classNames}
      href={href}
      onClick={isSelected ? undefined : onSelect}
    >
      <div className="grid h-9 w-9 place-items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
        <UserCircle2Icon className="h-4 w-4 text-[var(--shell-muted)]" />
      </div>
      <div>
        <h3 className="font-medium text-[var(--shell-ink)]">
          {coach.givenName} {coach.familyName}
        </h3>
      </div>
    </Link>
  );
}
