import { User, UserTrainee } from "@/services/users/type";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { AthleteCoach } from "./AthleteCoach";
import { AthleteInvitations } from "./AthleteInvitations";
import { useState } from "react";

type Props = {
  user: User;
  selected: UserTrainee | null;
  onSelect: (coach: UserTrainee) => void;
};

export function AthleteCoaches({ user, selected, onSelect }: Props) {
  const [isOpen, setOpen] = useState(true);

  const active =
    user.coaches?.length > 0 ? (
      <div className="mt-5 space-y-3">
        <h3 className="text-xs uppercase tracking-[0.16em] text-[var(--shell-muted)]">
          Active
        </h3>
        {user.coaches.map((x) => (
          <AthleteCoach
            key={x.traineeId}
            coach={x}
            isSelected={x.traineeId === selected?.traineeId}
            href={`/app/athlete/${x.traineeId}`}
            onSelect={() => onSelect(x)}
          />
        ))}
      </div>
    ) : null;

  const invitations = user.invitations.length ? (
    <div className="mt-5">
      <h3 className="text-xs uppercase tracking-[0.16em] text-[var(--shell-muted)]">
        Pending invitations
      </h3>
      <AthleteInvitations invitations={user.invitations} />
    </div>
  ) : null;

  return (
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setOpen((state) => !state)}
      >
        <div>
          <h2 className="text-xl text-[var(--shell-ink)]">Your coaches</h2>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            {user.coaches.length} active connection
            {user.coaches.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-[var(--shell-muted)]">
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      {isOpen ? (
        <>
          {active}
          {invitations}
        </>
      ) : null}
    </section>
  );
}
