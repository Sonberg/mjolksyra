import { acceptTraineeInvitation } from "@/services/traineeInvitations/acceptTraineeInvitation";
import { declineTraineeInvitation } from "@/services/traineeInvitations/declineTraineeInvitation";
import { UserInvitation } from "@/services/users/type";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  invitations: UserInvitation[];
};

export function AthleteInvitations({ invitations }: Props) {
  const router = useRouter();
  const accept = useMutation({
    mutationKey: ["user", "invitations"],
    mutationFn: (id: string) => acceptTraineeInvitation({ id }),
    onSettled: () => router.refresh(),
  });

  const decline = useMutation({
    mutationKey: ["user", "invitations"],
    mutationFn: (id: string) => declineTraineeInvitation({ id }),
    onSettled: () => router.refresh(),
  });

  return (
    <div className="mt-2 flex flex-col gap-3">
      {invitations.map((x) => (
        <div
          key={x.id}
          className="flex items-center justify-between rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-3"
        >
          <div className="font-medium text-[var(--shell-ink)]">
            {x.givenName} {x.familyName}
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              size="icon"
              className="size-9 rounded-none"
              onClick={() => accept.mutateAsync(x.id)}
            >
              <CheckIcon data-icon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 rounded-none"
              onClick={() => decline.mutateAsync(x.id)}
            >
              <XIcon data-icon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
