import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TraineeInvitation } from "@/services/traineeInvitations/type";
import dayjs from "dayjs";

type Props = {
  invitation: TraineeInvitation;
};

export function TraineeInvitationCard({ invitation }: Props) {
  return (
    <div className="group rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-4 transition-all duration-300 hover:bg-[var(--shell-surface-strong)] hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-[var(--shell-border)]">
          <AvatarFallback className="bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]">
            {invitation.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate text-sm text-[var(--shell-ink)] transition-colors">
            {invitation.email}
          </h3>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">
            Sent {dayjs(invitation.createdAt).format("YYYY-MM-DD")}
          </p>
        </div>
      </div>
    </div>
  );
}
