using MediatR;

namespace Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

public class DeclineTraineeInvitationCommand : IRequest
{
    public required Guid TraineeInvitationId { get; set; }

    public required Guid AthleteUserId { get; set; }
}
