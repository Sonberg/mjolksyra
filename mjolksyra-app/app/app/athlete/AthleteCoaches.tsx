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
      <div className="space-y-4 mt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Active</h3>
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
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-400">Pending Invitations</h3>
      <AthleteInvitations invitations={user.invitations} />
    </div>
  ) : null;

  return (
    <section className="rounded-xl border border-white/10 bg-black backdrop-blur-sm p-6">
      <div
        className="flex justify-between items-center"
        onClick={() => setOpen((state) => !state)}
      >
        <h2 className="text-xl font-semibold text-gray-100">Your Coaches</h2>
        <div>{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>
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
