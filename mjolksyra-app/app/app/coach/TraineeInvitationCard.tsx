import { TraineeInvitation } from "@/services/traineeInvitations/type";
import dayjs from "dayjs";

type Props = {
  invitation: TraineeInvitation;
};

export function TraineeInvitationCard({ invitation }: Props) {
  return (
    <div className="group relative flex items-center justify-between py-6 px-4 rounded-xl  border border-gray-800/50  transition-all duration-200">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div>
            <h3 className="text-md font-semibold text-gray-100 group-hover:text-white transition-colors">
              {invitation.email}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-400">
                Sent at: {dayjs(invitation.createdAt).format('YYYY-MM-DD')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
