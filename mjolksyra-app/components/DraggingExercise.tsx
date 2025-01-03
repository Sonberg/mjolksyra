import { DumbbellIcon } from "lucide-react";

type Props = {
  name: string;
};
export function DraggingExercise({ name }: Props) {
  return (
    <div className="flex gap-2 p-2 border bg-background items-center w-min whitespace-nowrap">
      <DumbbellIcon className="h-6" />
      <div className="text-sm">{name}</div>
    </div>
  );
}
