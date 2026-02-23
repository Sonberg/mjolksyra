import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TraineeInvitation } from "@/services/traineeInvitations/type";
import dayjs from "dayjs";

type Props = {
  invitation: TraineeInvitation;
};

export function TraineeInvitationCard({ invitation }: Props) {
  return (
    <div className="group rounded-[1.25rem] border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:border-zinc-700 hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-zinc-700">
          <AvatarFallback className="bg-zinc-900 text-zinc-100">
            {invitation.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-white">
            {invitation.email}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Sent {dayjs(invitation.createdAt).format("YYYY-MM-DD")}
          </p>
        </div>
      </div>
    </div>
  );
}
