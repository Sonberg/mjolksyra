using MediatR;
using Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;
using OneOf;

namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeCommand : IRequest<OneOf<TraineeInvitationsResponse, InviteTraineeError>>
{
    public required Guid CoachUserId { get; set; }

    public required string Email { get; set; }

    public required int MonthlyPriceAmount { get; set; }
}
