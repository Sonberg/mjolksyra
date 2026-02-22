import { Trash2 } from "lucide-react";
import { Exercise } from "@/services/exercises/type";
import { cn } from "@/lib/utils";
import { DeleteExercise } from "@/services/exercises/deleteExercise";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/dialogs/ConfirmDialog";

type Props = {
  exercise: Exercise;
  exercises: {
    delete: DeleteExercise;
  };
};

export function ExerciseRowDelete({ exercise, exercises }: Props) {
  const client = useQueryClient();
  const className = cn({
    "h-4 w-4": true,
    "hover:text-zinc-100": true,
    "text-zinc-500": true,
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
        await exercises.delete({ id: exercise.id });
        await client.refetchQueries({
          queryKey: ["exercises"],
        });
      }}
      trigger={<Trash2 className={className} />}
    />
  );
}
