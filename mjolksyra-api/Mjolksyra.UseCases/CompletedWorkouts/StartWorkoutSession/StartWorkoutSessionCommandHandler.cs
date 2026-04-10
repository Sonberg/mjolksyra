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
    IUserContext userContext) : IRequestHandler<StartWorkoutSessionCommand, WorkoutResponse?>
{
    public async Task<WorkoutResponse?> Handle(StartWorkoutSessionCommand request, CancellationToken cancellationToken)
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
            return await BuildResponse(plannedWorkout, existing, cancellationToken);
        }

        // Initialize exercises from PublishedExercises
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
                .ToList<CompletedExercise>();


        var session = await completedWorkoutRepository.Create(new CompletedWorkout
        {
            Id = Guid.NewGuid(),
            PlannedWorkoutId = request.PlannedWorkoutId,
            TraineeId = request.TraineeId,
            PlannedAt = plannedWorkout.PlannedAt,
            Exercises = sessionExercises,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return await BuildResponse(plannedWorkout, session, cancellationToken);
    }

    private async Task<WorkoutResponse> BuildResponse(
        PlannedWorkout plannedWorkout,
        CompletedWorkout session,
        CancellationToken cancellationToken)
    {
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
