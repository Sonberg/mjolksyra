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
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Active
        </h3>
        {user.coaches.map((x) => (
          <AthleteCoach
            key={x.traineeId}
            coach={x}
            isSelected={x.traineeId === selected?.traineeId}
            onSelect={() => onSelect(x)}
          />
        ))}
      </div>
    ) : null;

  const invitations = user.invitations.length ? (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
        Pending invitations
      </h3>
      <AthleteInvitations invitations={user.invitations} />
    </div>
  ) : null;

  return (
    <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-6">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setOpen((state) => !state)}
      >
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Your coaches</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {user.coaches.length} active connection
            {user.coaches.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-zinc-400">
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
