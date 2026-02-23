using MediatR;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

public class DeclineTraineeInvitationCommandHandler(
    ITraineeInvitationsRepository repository,
    IUserRepository userRepository
) : IRequestHandler<DeclineTraineeInvitationCommand>
{
    public async Task Handle(DeclineTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await repository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);
        if (invitation is null) return;
        if (invitation.AcceptedAt is not null || invitation.RejectedAt is not null) return;

        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        if (athlete is null) return;

        if (invitation.Email.Normalized != EmailNormalizer.Normalize(athlete.Email.Value)) return;

        await repository.RejectAsync(request.TraineeInvitationId, cancellationToken);
    }
}
