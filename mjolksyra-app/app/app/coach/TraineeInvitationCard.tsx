import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TraineeInvitation } from "@/services/traineeInvitations/type";
import dayjs from "dayjs";

type Props = {
  invitation: TraineeInvitation;
};

export function TraineeInvitationCard({ invitation }: Props) {
  return (
    <div className="group relative flex items-center justify-between py-4 px-4 rounded-xl bg-black border border-white/10  transition-all duration-200">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback children={invitation.email[0].toUpperCase()} />
            </Avatar>
            <div>
              <h3 className="text-md font-semibold text-gray-100 group-hover:text-white transition-colors">
                {invitation.email}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-400">
                  Sent at: {dayjs(invitation.createdAt).format("YYYY-MM-DD")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
