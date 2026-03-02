using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

public class LogPlannedWorkoutCommandHandler : IRequestHandler<LogPlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly IExerciseRepository _exerciseRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly INotificationService _notificationService;

    public LogPlannedWorkoutCommandHandler(
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IExerciseRepository exerciseRepository,
        ITraineeRepository traineeRepository,
        INotificationService notificationService)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _exerciseRepository = exerciseRepository;
        _traineeRepository = traineeRepository;
        _notificationService = notificationService;
    }

    public async Task<PlannedWorkoutResponse?> Handle(LogPlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await _plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null)
        {
            return null;
        }

        var previousCompletedAt = plannedWorkout.CompletedAt;
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);

        plannedWorkout.CompletedAt = request.Log.CompletedAt;
        plannedWorkout.CompletionNote = request.Log.CompletionNote;

        if (request.Log.CompletedAt is null || previousCompletedAt != request.Log.CompletedAt)
        {
            plannedWorkout.ReviewedAt = null;
            plannedWorkout.ReviewNote = null;
        }

        foreach (var exerciseLog in request.Log.Exercises)
        {
            var exercise = plannedWorkout.Exercises.FirstOrDefault(e => e.Id == exerciseLog.Id);
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
                        WeightKg = exercise.Prescription.TargetType == ExercisePrescriptionTargetType.sets_reps
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

        var exerciseIds = plannedWorkout.Exercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);

        await _plannedWorkoutRepository.Update(plannedWorkout, cancellationToken);

        if (previousCompletedAt is null &&
            plannedWorkout.CompletedAt is not null &&
            trainee is not null)
        {
            var title = "Workout completed";
            var body = string.IsNullOrWhiteSpace(plannedWorkout.CompletionNote)
                ? $"Athlete completed the workout for {plannedWorkout.PlannedAt:yyyy-MM-dd}."
                : $"Athlete completed the workout and left a note: {plannedWorkout.CompletionNote}";

            await _notificationService.Notify(
                trainee.CoachUserId,
                type: "workout.completed",
                title: title,
                body: body,
                href: $"/app/coach/athletes/{trainee.Id}/workouts?tab=changes&workoutId={plannedWorkout.Id}",
                cancellationToken: cancellationToken);
        }

        return PlannedWorkoutResponse.From(plannedWorkout, exercises);
    }
}
