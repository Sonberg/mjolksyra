using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Media;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.UpdateWorkoutSession;

public class UpdateWorkoutSessionCommandHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    INotificationService notificationService,
    ITraineeInsightsRebuildPublisher traineeInsightsRebuildPublisher) : IRequestHandler<UpdateWorkoutSessionCommand, CompletedWorkoutResponse?>
{
    public async Task<CompletedWorkoutResponse?> Handle(UpdateWorkoutSessionCommand request, CancellationToken cancellationToken)
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

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        var previousCompletedAt = session.CompletedAt;

        // Athletes freely add/delete/reorder — no addedBy restriction
        session.Exercises = request.Session.Exercises
            .Select(e => new CompletedExercise
            {
                Id = e.Id == Guid.Empty ? Guid.NewGuid() : e.Id,
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
                                    WeightKg = e.Prescription.Type == ExerciseType.SetsReps
                                        ? s.Target.WeightKg
                                        : null,
                                    Note = s.Target.Note,
                                },
                                Actual = s.Actual is null ? null : new ExercisePrescriptionSetActual
                                {
                                    Reps = s.Actual.Reps,
                                    WeightKg = e.Prescription.Type == ExerciseType.SetsReps
                                        ? s.Actual.WeightKg
                                        : null,
                                    DurationSeconds = s.Actual.DurationSeconds,
                                    DistanceMeters = s.Actual.DistanceMeters,
                                    Note = s.Actual.Note,
                                    IsDone = s.Actual.IsDone,
                                }
                            })
                            .ToList()
                    }
            })
            .ToList();

        session.CompletedAt = request.Session.CompletedAt;
        session.Media = request.Session.MediaUrls
            .Select(url => new PlannedWorkoutMedia
            {
                RawUrl = url,
                Type = MediaUrlHelper.IsVideoUrl(url) ? PlannedWorkoutMediaType.Video : PlannedWorkoutMediaType.Image,
            })
            .ToList();

        // Clear ReviewedAt when marking complete so coach needs to re-review
        if (session.CompletedAt is not null)
        {
            session.ReviewedAt = null;
        }

        await completedWorkoutRepository.Update(session, cancellationToken);

        // Notify coach and trigger insights rebuild when athlete marks workout as completed for the first time
        if (previousCompletedAt is null && session.CompletedAt is not null && trainee is not null)
        {
            await notificationService.Notify(
                trainee.CoachUserId,
                type: "workout.completed",
                title: "Workout completed",
                body: $"Athlete completed the workout for {session.PlannedAt:yyyy-MM-dd}. It now needs review.",
                href: $"/app/coach/athletes/{trainee.Id}/workouts?tab=changes&workoutId={session.Id}",
                cancellationToken: cancellationToken);

            await traineeInsightsRebuildPublisher.Publish(new TraineeInsightsRebuildRequestedMessage(
                TraineeId: request.TraineeId,
                CoachUserId: trainee.CoachUserId,
                IsManual: false,
                RequestedAt: DateTimeOffset.UtcNow), cancellationToken);
        }

        var sessionExerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var masterExercises = await exerciseRepository.GetMany(sessionExerciseIds, cancellationToken);

        return CompletedWorkoutResponse.From(session, masterExercises);
    }
}
