import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";
import { useQuery } from "@tanstack/react-query";

export function AthleteInvitations() {
  const invitations = useQuery({
    queryKey: ["user", "invitations"],
    queryFn: async ({ signal }) => await getTraineeInvitations({ signal }),
  });

  console.log(invitations);

  return (
    <div>
      <div className="mb-4 text-2xl font-bold">Invitations</div>
    </div>
  );
}
