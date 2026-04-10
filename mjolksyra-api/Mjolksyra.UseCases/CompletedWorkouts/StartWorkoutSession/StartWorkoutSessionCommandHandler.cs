using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;

public class StartWorkoutSessionCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<StartWorkoutSessionCommand, CompletedWorkoutResponse?>
{
    public async Task<CompletedWorkoutResponse?> Handle(StartWorkoutSessionCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var plannedWorkout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null || plannedWorkout.TraineeId != request.TraineeId)
        {
            return null;
        }

        // Idempotent: return existing session if already started
        var existing = await completedWorkoutRepository.GetByPlannedWorkoutId(request.PlannedWorkoutId, cancellationToken);
        if (existing is not null)
        {
            var existingExerciseIds = existing.Exercises
                .Select(e => e.ExerciseId)
                .OfType<Guid>()
                .ToList();

            var existingMasterExercises = await exerciseRepository.GetMany(existingExerciseIds, cancellationToken);
            return CompletedWorkoutResponse.From(existing, existingMasterExercises);
        }

        // Initialize exercises from PublishedExercises (clear all Actual values)
        var sessionExercises = plannedWorkout.PublishedExercises
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

        var session = await completedWorkoutRepository.Create(new CompletedWorkout
        {
            Id = Guid.NewGuid(),
            PlannedWorkoutId = request.PlannedWorkoutId,
            TraineeId = request.TraineeId,
            PlannedAt = plannedWorkout.PlannedAt,
            Exercises = sessionExercises,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        var exerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var masterExercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return CompletedWorkoutResponse.From(session, masterExercises);
    }
}
