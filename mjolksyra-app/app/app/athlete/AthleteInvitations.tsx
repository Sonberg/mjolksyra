import { acceptTraineeInvitation } from "@/services/traineeInvitations/acceptTraineeInvitation";
import { declineTraineeInvitation } from "@/services/traineeInvitations/declineTraineeInvitation";
import { UserInvitation } from "@/services/users/type";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="mt-2 space-y-3">
      {invitations.map((x) => (
        <div
          key={x.id}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="font-medium text-zinc-100">
            {x.givenName} {x.familyName}
          </div>
          <div className="flex gap-4">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500"
              onClick={() => accept.mutateAsync(x.id)}
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-zinc-200 transition hover:bg-white/20"
              onClick={() => decline.mutateAsync(x.id)}
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
