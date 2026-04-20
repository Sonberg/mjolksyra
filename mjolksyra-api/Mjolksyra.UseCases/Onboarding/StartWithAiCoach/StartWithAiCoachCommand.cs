using MediatR;
using Mjolksyra.Domain.Constants;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Onboarding.StartWithAiCoach;

public class StartWithAiCoachCommand : IRequest<StartWithAiCoachResponse>
{
    public required Guid AthleteUserId { get; set; }
}

public class StartWithAiCoachResponse
{
    public Guid TraineeId { get; set; }
}

public class StartWithAiCoachCommandHandler(
    ITraineeRepository traineeRepository) : IRequestHandler<StartWithAiCoachCommand, StartWithAiCoachResponse>
{
    public async Task<StartWithAiCoachResponse> Handle(StartWithAiCoachCommand request, CancellationToken cancellationToken)
    {
        var aiCoachId = AiCoachConstants.UserId;

        var existing = await traineeRepository.GetRelationship(aiCoachId, request.AthleteUserId, cancellationToken);
        if (existing is not null)
        {
            return new StartWithAiCoachResponse { TraineeId = existing.Id };
        }

        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = aiCoachId,
            AthleteUserId = request.AthleteUserId,
            Status = TraineeStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await traineeRepository.Create(trainee, cancellationToken);

        return new StartWithAiCoachResponse { TraineeId = trainee.Id };
    }
}
