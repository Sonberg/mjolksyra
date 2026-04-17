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

  return (
    <div className="bg-[var(--shell-surface-strong)] p-4">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setOpen((state) => !state)}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--shell-muted)]">Coaches</p>
          <p className="mt-1 text-lg font-semibold text-[var(--shell-ink)]">
            {user.coaches.length} active connection{user.coaches.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="text-[var(--shell-muted)]">
          {isOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
        </span>
      </div>

      {isOpen ? (
        <div className="mt-4 flex flex-col gap-4">
          {user.coaches.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--shell-muted)]">Active</p>
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
          ) : null}

          {user.invitations.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--shell-muted)]">Pending invitations</p>
              <AthleteInvitations invitations={user.invitations} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
