using MediatR;

namespace Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;

public enum TraineeInvitationsType
{
    Coach,
    Athlete
}

public class GetTraineeInvitationsRequest : IRequest<ICollection<TraineeInvitationsResponse>>
{
    public required Guid UserId { get; set; }

    public required TraineeInvitationsType Type { get; set; }
}