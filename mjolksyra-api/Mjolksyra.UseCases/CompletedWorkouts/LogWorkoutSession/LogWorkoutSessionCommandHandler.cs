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
    INotificationService notificationService) : IRequestHandler<LogWorkoutSessionCommand, WorkoutResponse?>
{
    public async Task<WorkoutResponse?> Handle(LogWorkoutSessionCommand request, CancellationToken cancellationToken)
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

        if (session.CompletedAt is not null)
        {
            session.ReviewedAt = null;
        }

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
                body: $"Athlete completed the workout for {session.PlannedAt:yyyy-MM-dd}. It now needs review.",
                href: $"/app/coach/athletes/{trainee.Id}/workouts?tab=changes&workoutId={session.Id}",
                cancellationToken: cancellationToken);
        }

        var plannedWorkout = await plannedWorkoutRepository.Get(session.PlannedWorkoutId, cancellationToken);

        var planExerciseIds = plannedWorkout?.PublishedExercises
            .Concat(plannedWorkout.DraftExercises ?? [])
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList() ?? [];

        var sessionExerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var allIds = planExerciseIds.Union(sessionExerciseIds).ToList();
        var masterExercises = await exerciseRepository.GetMany(allIds, cancellationToken);

        return WorkoutResponse.From(plannedWorkout!, session, masterExercises, masterExercises);
    }
}
