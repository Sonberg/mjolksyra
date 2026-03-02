using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

public class UpdatePlannedWorkoutCommandHandler : IRequestHandler<UpdatePlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly IExerciseRepository _exerciseRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly INotificationService _notificationService;

    public UpdatePlannedWorkoutCommandHandler(
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

    public async Task<PlannedWorkoutResponse?> Handle(UpdatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await _plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null)
        {
            return null;
        }

        var previousReviewedAt = plannedWorkout.ReviewedAt;
        var previousReviewNote = plannedWorkout.ReviewNote;
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        var existingExercises = plannedWorkout.Exercises.ToList();

        plannedWorkout.Name = request.Workout.Name;
        plannedWorkout.Note = request.Workout.Note;
        plannedWorkout.ReviewedAt = request.Workout.ReviewedAt;
        plannedWorkout.ReviewNote = request.Workout.ReviewNote;

        plannedWorkout.Exercises = request.Workout.Exercises
            .Select(x =>
            {
                var existingExercise = existingExercises.FirstOrDefault(e => e.Id == x.Id);
                return new PlannedExercise
                {
                    Id = x.Id,
                    Name = x.Name,
                    Note = x.Note,
                    ExerciseId = x.ExerciseId,
                    IsPublished = x.IsPublished,
                    Prescription = x.Prescription is null
                        ? null
                        : new ExercisePrescription
                        {
                            TargetType = x.Prescription.TargetType,
                            Sets = x.Prescription.Sets
                                ?.Select((s, i) =>
                                {
                                    var existingActual = existingExercise?.Prescription?.Sets?.ElementAtOrDefault(i)?.Actual;
                                    return new ExercisePrescriptionSet
                                    {
                                        Target = s.Target is null ? null : new ExercisePrescriptionSetTarget
                                        {
                                            Reps = s.Target.Reps,
                                            DurationSeconds = s.Target.DurationSeconds,
                                            DistanceMeters = s.Target.DistanceMeters,
                                            WeightKg = s.Target.WeightKg,
                                            Note = s.Target.Note,
                                        },
                                        Actual = existingActual,
                                    };
                                })
                                .ToList()
                        }
                };
            })
            .ToList();

        var exerciseIds = plannedWorkout.Exercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);

        await _plannedWorkoutRepository.Update(plannedWorkout, cancellationToken);

        var reviewChanged = previousReviewedAt != plannedWorkout.ReviewedAt ||
                            previousReviewNote != plannedWorkout.ReviewNote;

        if (trainee is not null &&
            plannedWorkout.CompletedAt is not null &&
            reviewChanged &&
            (plannedWorkout.ReviewedAt is not null || !string.IsNullOrWhiteSpace(plannedWorkout.ReviewNote)))
        {
            var body = string.IsNullOrWhiteSpace(plannedWorkout.ReviewNote)
                ? "Your coach reviewed your completed workout."
                : $"Your coach left feedback: {plannedWorkout.ReviewNote}";

            await _notificationService.Notify(
                trainee.AthleteUserId,
                type: "workout.reviewed",
                title: "Coach reviewed your workout",
                body: body,
                href: $"/app/athlete/{trainee.Id}/workouts?workoutTab=past&workoutId={plannedWorkout.Id}",
                cancellationToken: cancellationToken);
        }

        return PlannedWorkoutResponse.From(plannedWorkout, exercises);
    }
}
