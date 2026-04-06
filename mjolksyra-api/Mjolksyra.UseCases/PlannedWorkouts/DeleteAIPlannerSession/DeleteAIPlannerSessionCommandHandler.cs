using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeleteAIPlannerSession;

public class DeleteAIPlannerSessionCommandHandler(
    IAIPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<DeleteAIPlannerSessionCommand, bool>
{
    public async Task<bool> Handle(DeleteAIPlannerSessionCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return false;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return false;
        }

        var session = await sessionRepository.GetById(request.SessionId, cancellationToken);
        if (session is not null && (session.TraineeId != request.TraineeId || session.CoachUserId != userId))
        {
            return false;
        }

        if (session is not null)
        {
            await sessionRepository.Delete(request.SessionId, cancellationToken);
        }

        return true;
    }
}
