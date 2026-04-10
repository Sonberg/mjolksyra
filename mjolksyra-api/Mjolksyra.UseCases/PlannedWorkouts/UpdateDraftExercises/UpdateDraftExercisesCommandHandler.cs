using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdateDraftExercises;

public class UpdateDraftExercisesCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<UpdateDraftExercisesCommand, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(UpdateDraftExercisesCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        workout.DraftExercises = request.Exercises
            .Select(x => new PlannedExercise
            {
                Id = x.Id == Guid.Empty ? Guid.NewGuid() : x.Id,
                ExerciseId = x.ExerciseId,
                Name = x.Name,
                Note = x.Note,
                IsPublished = false,
                AddedBy = ExerciseAddedBy.Coach,
                Prescription = x.Prescription is null
                    ? null
                    : new ExercisePrescription
                    {
                        Type = x.Prescription.Type,
                        Sets = x.Prescription.Sets
                            ?.Select(s => new ExercisePrescriptionSet
                            {
                                Target = s.Target is null ? null : new ExercisePrescriptionSetTarget
                                {
                                    Reps = s.Target.Reps,
                                    DurationSeconds = s.Target.DurationSeconds,
                                    DistanceMeters = s.Target.DistanceMeters,
                                    WeightKg = x.Prescription.Type == ExerciseType.SetsReps
                                        ? s.Target.WeightKg
                                        : null,
                                    Note = s.Target.Note,
                                },
                                Actual = null,
                            })
                            .ToList()
                    }
            })
            .ToList();

        await plannedWorkoutRepository.Update(workout, cancellationToken);

        var exerciseIds = workout.PublishedExercises
            .Concat(workout.DraftExercises ?? [])
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return PlannedWorkoutResponse.From(workout, exercises);
    }
}
