using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees;

public interface ITraineeResponseBuilder
{
    Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken);
}

public class TraineeResponseBuilder : ITraineeResponseBuilder
{
    private readonly IUserRepository _userRepository;

    public TraineeResponseBuilder(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken)
    {
        var athleteTask = _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coachTask = _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        await Task.WhenAll(athleteTask, coachTask);
        
        return new TraineeResponse
        {
            Id = trainee.Id,
            Athlete = TraineeUserResponse.From(athleteTask.Result),
            Coach = TraineeUserResponse.From(coachTask.Result),
            Cost = TraineeCostResponse.From(TraineeTransactionCost.From(trainee.Cost)),
            LastWorkoutAt = DateTimeOffset.UtcNow.AddMonths(1),
            NextWorkoutAt = DateTimeOffset.UtcNow.AddHours(2),
            CreatedAt = trainee.CreatedAt
        };
    }
}