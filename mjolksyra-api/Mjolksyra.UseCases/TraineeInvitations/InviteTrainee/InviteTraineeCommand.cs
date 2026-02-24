using MediatR;
using Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;

namespace Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

public class InviteTraineeCommand : IRequest<TraineeInvitationsResponse>
{
    public required Guid CoachUserId { get; set; }

    public required string Email { get; set; }

    public required int MonthlyPriceAmount { get; set; }
}
