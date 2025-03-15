import { Trash2 } from "lucide-react";
import { Exercise } from "@/services/exercises/type";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/dialogs/ConfirmDialog";
import { useExerciseProvider } from "./ExerciseProvider";

type Props = {
  exercise: Exercise;
};

export function ExerciseRowDelete({ exercise }: Props) {
  const exercises = useExerciseProvider();
  const client = useQueryClient();
  const className = cn({
    "h-4": true,
    "hover:text-accent-foreground": true,
    "text-accent": true,
    "cursor-pointer": true,
  });

  if (!exercise.canDelete) {
    return null;
  }

  return (
    <ConfirmDialog
      title={`Sure you want to delete "${exercise.name}"?`}
      description="This action cannot be reversed"
      continueButtonVariant="destructive"
      continueButton="Yes, delete"
      cancelButton="No, keep it"
      onConfirm={async () => {
        await exercises.delete({ exerciseId: exercise.id });
        await client.refetchQueries({
          queryKey: ["exercises"],
        });
      }}
      trigger={<Trash2 className={className} />}
    />
  );
}
