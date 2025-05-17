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
    <div>
      {invitations.map((x) => (
        <div
          key={x.id}
          className="flex items-center py-2 justify-between  border-b-1"
        >
          <div className="font-bold bm-2">
            {x.givenName} {x.familyName}
          </div>
          <div className="flex gap-4">
            <button
              className="h-10 w-10 rounded-lg bg-green-600 hover:bg-green-500 grid place-items-center"
              onClick={() => accept.mutateAsync(x.id)}
            >
              <CheckIcon />
            </button>
            <button
              className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center"
              onClick={() => decline.mutateAsync(x.id)}
            >
              <XIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
