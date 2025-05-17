using MediatR;

namespace Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;

public class AcceptTraineeInvitationCommand : IRequest
{
    public required Guid TraineeInvitationId { get; set; }

    public required Guid AthleteUserId { get; set; }
}