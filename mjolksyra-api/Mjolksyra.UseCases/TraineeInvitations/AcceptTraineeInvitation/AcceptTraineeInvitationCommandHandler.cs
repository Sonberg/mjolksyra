using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;

public class AcceptTraineeInvitationCommandHandler(
    ITraineeRepository traineeRepository,
    ITraineeInvitationsRepository traineeInvitationsRepository
) : IRequestHandler<AcceptTraineeInvitationCommand>
{
    public async Task Handle(AcceptTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await traineeInvitationsRepository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);

        await traineeRepository.Create(new Trainee
        {
            Status = TraineeStatus.Active,
            AthleteUserId = request.AthleteUserId,
            CoachUserId = invitation.CoachUserId,
            TraineeInvitationId = invitation.Id
        }, cancellationToken);

        await traineeInvitationsRepository.AcceptAsync(
            invitation.Id,
            cancellationToken);
    }
}