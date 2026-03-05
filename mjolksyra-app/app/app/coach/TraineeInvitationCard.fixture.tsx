import { TraineeInvitation } from "@/services/traineeInvitations/type";
import { TraineeInvitationCard } from "./TraineeInvitationCard";
import dayjs from "dayjs";

const invitation: TraineeInvitation = {
  id: "inv1",
  email: "new.athlete@example.com",
  monthlyPriceAmount: 1000,
  coach: { givenName: "Per", familyName: "Sonberg" },
  acceptedAt: null,
  rejectedAt: null,
  createdAt: dayjs().subtract(2, "day").toDate(),
};

export default {
  Default: () => <TraineeInvitationCard invitation={invitation} />,
};
