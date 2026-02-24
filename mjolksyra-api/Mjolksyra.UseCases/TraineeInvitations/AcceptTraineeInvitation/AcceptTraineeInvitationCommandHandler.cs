using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;

public class AcceptTraineeInvitationCommandHandler(
    ITraineeRepository traineeRepository,
    ITraineeInvitationsRepository traineeInvitationsRepository,
    IUserRepository userRepository
) : IRequestHandler<AcceptTraineeInvitationCommand>
{
    public async Task Handle(AcceptTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await traineeInvitationsRepository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);
        if (invitation.AcceptedAt is not null || invitation.RejectedAt is not null) return;

        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        if (invitation.Email.Normalized != athlete.Email.Normalized) return;

        if (await traineeRepository.ExistsActiveRelationship(invitation.CoachUserId, request.AthleteUserId, cancellationToken))
        {
            await traineeInvitationsRepository.AcceptAsync(invitation.Id, cancellationToken);
            return;
        }

        await traineeRepository.Create(new Trainee
        {
            Id = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            AthleteUserId = request.AthleteUserId,
            CoachUserId = invitation.CoachUserId,
            TraineeInvitationId = invitation.Id,
            Cost = new TraineeCost
            {
                Amount = Math.Max(0, invitation.MonthlyPriceAmount ?? 0)
            },
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await traineeInvitationsRepository.AcceptAsync(
            invitation.Id,
            cancellationToken);
    }
}
