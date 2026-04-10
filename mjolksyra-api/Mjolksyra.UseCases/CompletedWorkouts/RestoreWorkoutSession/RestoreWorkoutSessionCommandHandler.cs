using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;

/// <summary>
/// Resets the athlete's session exercises back to the original published prescription.
/// Clears all Actual data and completion state.
/// </summary>
public class RestoreWorkoutSessionCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<RestoreWorkoutSessionCommand, WorkoutResponse?>
{
    public async Task<WorkoutResponse?> Handle(RestoreWorkoutSessionCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var session = await completedWorkoutRepository.GetById(request.Id, cancellationToken);
        if (session is null || session.TraineeId != request.TraineeId)
        {
            return null;
        }

        var plannedWorkout = await plannedWorkoutRepository.Get(session.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null || plannedWorkout.TraineeId != request.TraineeId)
        {
            return null;
        }

        // Reset exercises to published prescription, clearing all Actual values
        session.Exercises = plannedWorkout.PublishedExercises
            .Select(e => new CompletedExercise
            {
                Id = e.Id,
                ExerciseId = e.ExerciseId,
                Name = e.Name,
                Note = e.Note,
                Prescription = e.Prescription is null
                    ? null
                    : new ExercisePrescription
                    {
                        Type = e.Prescription.Type,
                        Sets = e.Prescription.Sets
                            ?.Select(s => new ExercisePrescriptionSet
                            {
                                Target = s.Target is null ? null : new ExercisePrescriptionSetTarget
                                {
                                    Reps = s.Target.Reps,
                                    DurationSeconds = s.Target.DurationSeconds,
                                    DistanceMeters = s.Target.DistanceMeters,
                                    WeightKg = s.Target.WeightKg,
                                    Note = s.Target.Note,
                                },
                                Actual = null,
                            })
                            .ToList()
                    }
            })
            .ToList();

        session.CompletedAt = null;
        session.ReviewedAt = null;
        session.Media = [];

        await completedWorkoutRepository.Update(session, cancellationToken);

        var planExerciseIds = plannedWorkout.PublishedExercises
            .Concat(plannedWorkout.DraftExercises ?? [])
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var sessionExerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var allIds = planExerciseIds.Union(sessionExerciseIds).ToList();
        var masterExercises = await exerciseRepository.GetMany(allIds, cancellationToken);

        return WorkoutResponse.From(plannedWorkout, session, masterExercises, masterExercises);
    }
}
