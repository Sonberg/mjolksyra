import { Trash2 } from "lucide-react";
import { Exercise } from "@/api/exercises/type";
import { cn } from "@/lib/utils";
import { deleteExercise } from "@/api/exercises/deleteExercise";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/dialogs/ConfirmDialog";

type Props = {
  exercise: Exercise;
};

export function ExerciseRowDelete({ exercise }: Props) {
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
      title={`Sure you want to delete "${exercise.name}"`}
      description="This action cannot be reversed"
      continueButtonVariant="destructive"
      continueButton="Yes, delete"
      cancelButton="Nevermind"
      onConfirm={async () => {
        await deleteExercise({ id: exercise.id });
        await client.refetchQueries({
          queryKey: ["exercises"],
        });
      }}
      trigger={<Trash2 className={className} />}
    />
  );
}
