using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;

public class CreatePlannedWorkoutCommandHandler : IRequestHandler<CreatePlannedWorkoutCommand, PlannedWorkoutResponse>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    public CreatePlannedWorkoutCommandHandler(IPlannedWorkoutRepository plannedWorkoutRepository)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
    }

    public async Task<PlannedWorkoutResponse> Handle(CreatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = new PlannedWorkout
        {
            TraineeId = request.TraineeId,
            Name = request.Workout.Name,
            Note = request.Workout.Note,
            PlannedAt = request.Workout.PlannedAt,
            Exercises = request.Workout.Exercises
                .Select(e => new PlannedExercise
                {
                    Id = e.Id,
                    ExerciseId = e.ExerciseId,
                    Name = e.Name,
                    Note = e.Note
                }).ToList(),
            CreatedAt = DateTimeOffset.UtcNow
        };


        return PlannedWorkoutResponse.From(await _plannedWorkoutRepository.Create(plannedWorkout, cancellationToken));
    }
}