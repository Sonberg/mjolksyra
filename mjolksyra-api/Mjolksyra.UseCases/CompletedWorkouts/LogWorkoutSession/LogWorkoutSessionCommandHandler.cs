using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Media;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;

public class LogWorkoutSessionCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    INotificationService notificationService) : IRequestHandler<LogWorkoutSessionCommand, CompletedWorkoutResponse?>
{
    public async Task<CompletedWorkoutResponse?> Handle(LogWorkoutSessionCommand request, CancellationToken cancellationToken)
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

        session.CompletedAt = request.Log.CompletedAt;
        session.Media = request.Log.MediaUrls
            .Select(url => new PlannedWorkoutMedia
            {
                RawUrl = url,
                Type = MediaUrlHelper.IsVideoUrl(url) ? PlannedWorkoutMediaType.Video : PlannedWorkoutMediaType.Image,
            })
            .ToList();

        foreach (var exerciseLog in request.Log.Exercises)
        {
            var exercise = session.Exercises.FirstOrDefault(e => e.Id == exerciseLog.Id);
            if (exercise?.Prescription?.Sets is null)
            {
                continue;
            }

            var setsList = exercise.Prescription.Sets.ToList();
            for (var i = 0; i < exerciseLog.Sets.Count && i < setsList.Count; i++)
            {
                var actualRequest = exerciseLog.Sets.ElementAt(i);
                setsList[i] = new ExercisePrescriptionSet
                {
                    Target = setsList[i].Target,
                    Actual = new ExercisePrescriptionSetActual
                    {
                        Reps = actualRequest.Reps,
                        WeightKg = exercise.Prescription.Type == ExerciseType.SetsReps
                            ? actualRequest.WeightKg
                            : null,
                        DurationSeconds = actualRequest.DurationSeconds,
                        DistanceMeters = actualRequest.DistanceMeters,
                        Note = actualRequest.Note,
                        IsDone = actualRequest.IsDone,
                    }
                };
            }

            exercise.Prescription.Sets = setsList;
        }

        await completedWorkoutRepository.Update(session, cancellationToken);

        if (previousCompletedAt is null && session.CompletedAt is not null && trainee is not null)
        {
            await notificationService.Notify(
                trainee.CoachUserId,
                type: "workout.completed",
                title: "Workout completed",
                body: $"Athlete completed the workout for {session.PlannedAt:yyyy-MM-dd}.",
                href: $"/app/coach/athletes/{trainee.Id}/workouts/completed/{session.Id}",
                cancellationToken: cancellationToken);
        }

        var sessionExerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var plannedWorkout = session.PlannedWorkoutId.HasValue
            ? await plannedWorkoutRepository.Get(session.PlannedWorkoutId.Value, cancellationToken)
            : null;

        var planExerciseIds = plannedWorkout?.PublishedExercises
            .Concat(plannedWorkout.DraftExercises ?? [])
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList() ?? [];

        var masterExercises = await exerciseRepository.GetMany(planExerciseIds.Union(sessionExerciseIds).ToList(), cancellationToken);

        return CompletedWorkoutResponse.From(session, masterExercises);
    }
}
