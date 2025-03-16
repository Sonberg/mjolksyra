import { OnboardingCard } from "../OnboardingCard";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { getTraineeInvitations } from "@/services/traineeInvitations/getTraineeInvitations";

interface InvitationStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function InvitationStep({ onNext, onBack }: InvitationStepProps) {
  const invitations = useQuery({
    queryKey: ["user", "invitations"],
    queryFn: async ({ signal }) => await getTraineeInvitations({ signal }),
  });

  return (
    <div className="space-y-6">
      <OnboardingCard
        title="Coach Invitations"
        text="Review and accept invitations from your coaches to get started."
      />

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {!invitations.data?.length ? (
          <div className="text-center text-gray-500 py-8">
            No pending invitations
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.data?.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">
                    {invitation.coach.givenName} {invitation.coach.familyName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Wants to be your fitness coach
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // Accept invitation logic here
                    onNext();
                  }}
                  className="font-bold"
                >
                  Accept
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" className="font-bold" onClick={onBack}>
          Back
        </Button>
        <Button className="font-bold" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
