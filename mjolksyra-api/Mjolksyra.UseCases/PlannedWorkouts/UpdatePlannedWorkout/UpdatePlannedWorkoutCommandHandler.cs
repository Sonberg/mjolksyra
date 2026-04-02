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
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        var existingExercises = plannedWorkout.Exercises.ToList();

        plannedWorkout.Name = request.Workout.Name;
        plannedWorkout.Note = request.Workout.Note;
        plannedWorkout.ReviewedAt = request.Workout.ReviewedAt;

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
                            Type = x.Prescription.Type,
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
                                            WeightKg = x.Prescription.Type == ExerciseType.SetsReps
                                                ? s.Target.WeightKg
                                                : null,
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

        var reviewChanged = previousReviewedAt != plannedWorkout.ReviewedAt;

        if (trainee is not null &&
            plannedWorkout.CompletedAt is not null &&
            reviewChanged &&
            plannedWorkout.ReviewedAt is not null)
        {
            await _notificationService.Notify(
                trainee.AthleteUserId,
                type: "workout.reviewed",
                title: "Coach reviewed your workout",
                body: "Your coach reviewed your completed workout.",
                href: $"/app/athlete/{trainee.Id}/workouts?workoutTab=past&workoutId={plannedWorkout.Id}",
                cancellationToken: cancellationToken);
        }

        return PlannedWorkoutResponse.From(plannedWorkout, exercises);
    }
}
