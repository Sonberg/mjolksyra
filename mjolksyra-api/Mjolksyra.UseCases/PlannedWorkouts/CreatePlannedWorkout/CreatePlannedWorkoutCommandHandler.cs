using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;

public class CreatePlannedWorkoutCommandHandler : IRequestHandler<CreatePlannedWorkoutCommand, PlannedWorkoutResponse>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly IExerciseRepository _exerciseRepository;

    public CreatePlannedWorkoutCommandHandler(IPlannedWorkoutRepository plannedWorkoutRepository, IExerciseRepository exerciseRepository)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _exerciseRepository = exerciseRepository;
    }

    public async Task<PlannedWorkoutResponse> Handle(CreatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await _plannedWorkoutRepository.Create(new PlannedWorkout
        {
            TraineeId = request.TraineeId,
            Name = request.Workout.Name,
            Note = request.Workout.Note,
            PlannedAt = request.Workout.PlannedAt,
            PublishedExercises = [],
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return PlannedWorkoutResponse.From(plannedWorkout, []);
    }
}
