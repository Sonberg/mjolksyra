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
    "flex items-center gap-2 p-2 rounded-lg bg-black  transition-colors":
      true,
    "cursor-pointer border-white/10 hover:bg-white/5": !isSelected,
    "bg-white/10 border-0": isSelected,
  });
  return (
    <div
      key={coach.traineeId}
      className={classNames}
      onClick={isSelected ? undefined : onSelect}
    >
      <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center">
        <UserCircle2Icon className="w-4 h-4 text-stone-200" />
      </div>
      <div>
        <h3 className="font-medium text-gray-100">
          {coach.givenName} {coach.familyName}
        </h3>
      </div>
    </div>
  );
}
