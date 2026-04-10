using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

public class UpdatePlannedWorkoutCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<UpdatePlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(UpdatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null)
        {
            return null;
        }

        plannedWorkout.Name = request.Workout.Name;
        plannedWorkout.Note = request.Workout.Note;
        plannedWorkout.PlannedAt = request.Workout.PlannedAt;

        if (request.Workout.DraftExercises != null)
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

            plannedWorkout.DraftExercises = request.Workout.DraftExercises
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
        }

        var exerciseIds = plannedWorkout.PublishedExercises
            .Concat(plannedWorkout.DraftExercises ?? [])
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        await plannedWorkoutRepository.Update(plannedWorkout, cancellationToken);

        return PlannedWorkoutResponse.From(plannedWorkout, exercises);
    }
}
