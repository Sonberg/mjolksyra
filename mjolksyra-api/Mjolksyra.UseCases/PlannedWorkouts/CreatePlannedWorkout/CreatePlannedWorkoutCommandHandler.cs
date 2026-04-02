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
            Exercises = request.Workout.Exercises
                .Select(e => new PlannedExercise
                {
                    Id = e.Id,
                    ExerciseId = e.ExerciseId,
                    Name = e.Name,
                    Note = e.Note,
                    IsPublished = e.IsPublished,
                    Prescription = e.Prescription is null
                        ? null
                        : new ExercisePrescription
                        {
                            Type = e.Prescription.Type,
                            Sets = e.Prescription.Sets
                                ?.Select(x => new ExercisePrescriptionSet
                                {
                                    Target = x.Target is null ? null : new ExercisePrescriptionSetTarget
                                    {
                                        Reps = x.Target.Reps,
                                        DurationSeconds = x.Target.DurationSeconds,
                                        DistanceMeters = x.Target.DistanceMeters,
                                        WeightKg = e.Prescription.Type == ExerciseType.SetsReps
                                            ? x.Target.WeightKg
                                            : null,
                                        Note = x.Target.Note,
                                    },
                                    Actual = null
                                })
                                .ToList()
                        }
                }).ToList(),
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        var exerciseIds = plannedWorkout.Exercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return PlannedWorkoutResponse.From(plannedWorkout, exercises);
    }
}
