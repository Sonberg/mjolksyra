using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

public class UpdatePlannedWorkoutCommandHandler : IRequestHandler<UpdatePlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    public UpdatePlannedWorkoutCommandHandler(IPlannedWorkoutRepository plannedWorkoutRepository)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
    }

    public async Task<PlannedWorkoutResponse?> Handle(UpdatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await _plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        
        plannedWorkout.Name = request.Workout.Name;
        plannedWorkout.Note = request.Workout.Note;
        plannedWorkout.Exercises = request.Workout.Exercises
            .Select(x => new PlannedExercise
            {
                Id = x.Id,
                Name = x.Name,
                Note = x.Note,
                ExerciseId = x.ExerciseId
            })
            .ToList();

        await _plannedWorkoutRepository.Update(plannedWorkout, cancellationToken);

        return PlannedWorkoutResponse.From(plannedWorkout);
    }
}