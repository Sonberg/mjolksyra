import { useQuery } from "@tanstack/react-query";

export function AthleteInvitations() {
  const invitations = useQuery({
    queryKey: ["user", "invitations"],
    queryFn: async () => [],
  });

  console.log(invitations);

  return (
    <div>
      <div className="mb-4 text-2xl font-bold">Invitations</div>
    </div>
  );
}
