using MediatR;

namespace Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;

public class GetTraineeInvitationsRequest : IRequest<ICollection<TraineeInvitationsResponse>>
{
    public required Guid UserId { get; set; }
}