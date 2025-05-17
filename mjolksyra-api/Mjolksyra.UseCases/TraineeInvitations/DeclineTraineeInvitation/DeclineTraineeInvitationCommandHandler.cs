using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

public class DeclineTraineeInvitationCommandHandler(ITraineeInvitationsRepository repository) : IRequestHandler<DeclineTraineeInvitationCommand>
{
    public Task Handle(DeclineTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        return repository.RejectAsync(request.TraineeInvitationId, cancellationToken);
    }
}