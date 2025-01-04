import { DumbbellIcon } from "lucide-react";

type Props = {
  name: string;
};
export function DraggingExercise({ name }: Props) {
  return (
    <div className="flex gap-1 p-1 border bg-background items-center w-min whitespace-nowrap">
      <DumbbellIcon className="h-3" />
      <div className="text-sm">{name}</div>
    </div>
  );
}
