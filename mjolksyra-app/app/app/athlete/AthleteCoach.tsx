import { cn } from "@/lib/utils";
import { UserTrainee } from "@/services/users/type";
import { UserCircle2Icon } from "lucide-react";

type Props = {
  coach: UserTrainee;
  isSelected: boolean;
  onSelect: () => void;
};

export function AthleteCoach({ coach, isSelected, onSelect }: Props) {
  const classNames = cn({
    "flex items-center gap-3 rounded-xl border p-3 transition-all": true,
    "cursor-pointer border-white/10 bg-white/[0.02] hover:border-cyan-200/20 hover:bg-white/[0.05]":
      !isSelected,
    "border-cyan-200/30 bg-cyan-300/10": isSelected,
  });
  return (
    <div
      key={coach.traineeId}
      className={classNames}
      onClick={isSelected ? undefined : onSelect}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-zinc-900">
        <UserCircle2Icon className="h-4 w-4 text-zinc-200" />
      </div>
      <div>
        <h3 className="font-medium text-zinc-100">
          {coach.givenName} {coach.familyName}
        </h3>
      </div>
    </div>
  );
}
