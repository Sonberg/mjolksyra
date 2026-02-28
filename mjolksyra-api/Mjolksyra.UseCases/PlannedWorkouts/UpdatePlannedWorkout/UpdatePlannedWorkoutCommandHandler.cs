using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

public class UpdatePlannedWorkoutCommandHandler : IRequestHandler<UpdatePlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly IExerciseRepository _exerciseRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserContext _userContext;

    private readonly INotificationService _notificationService;

    public UpdatePlannedWorkoutCommandHandler(
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IExerciseRepository exerciseRepository,
        ITraineeRepository traineeRepository,
        IUserContext userContext,
        INotificationService notificationService)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _exerciseRepository = exerciseRepository;
        _traineeRepository = traineeRepository;
        _userContext = userContext;
        _notificationService = notificationService;
    }

    public async Task<PlannedWorkoutResponse?> Handle(UpdatePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var plannedWorkout = await _plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (plannedWorkout is null)
        {
            return null;
        }

        var previousCompletedAt = plannedWorkout.CompletedAt;
        var previousCompletionNote = plannedWorkout.CompletionNote;
        var previousReviewedAt = plannedWorkout.ReviewedAt;
        var previousReviewNote = plannedWorkout.ReviewNote;
        var actorUserId = await _userContext.GetUserId(cancellationToken);
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        var actorIsAthlete = actorUserId.HasValue && trainee is not null && actorUserId.Value == trainee.AthleteUserId;
        var actorIsCoach = actorUserId.HasValue && trainee is not null && actorUserId.Value == trainee.CoachUserId;
        var completionChanged = previousCompletedAt != request.Workout.CompletedAt ||
                                previousCompletionNote != request.Workout.CompletionNote;
        var reviewChanged = previousReviewedAt != request.Workout.ReviewedAt ||
                            previousReviewNote != request.Workout.ReviewNote;

        plannedWorkout.Name = request.Workout.Name;
        plannedWorkout.Note = request.Workout.Note;
        plannedWorkout.CompletedAt = request.Workout.CompletedAt;
        plannedWorkout.CompletionNote = request.Workout.CompletionNote;
        plannedWorkout.ReviewedAt = request.Workout.ReviewedAt;
        plannedWorkout.ReviewNote = request.Workout.ReviewNote;

        if (request.Workout.CompletedAt is null || (actorIsAthlete && completionChanged))
        {
            plannedWorkout.ReviewedAt = null;
            plannedWorkout.ReviewNote = null;
        }

        plannedWorkout.Exercises = request.Workout.Exercises
            .Select(x => new PlannedExercise
            {
                Id = x.Id,
                Name = x.Name,
                Note = x.Note,
                ExerciseId = x.ExerciseId
            })
            .ToList();

        var exerciseIds = plannedWorkout.Exercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);

        await _plannedWorkoutRepository.Update(plannedWorkout, cancellationToken);

        if (previousCompletedAt is null &&
            plannedWorkout.CompletedAt is not null &&
            actorIsAthlete &&
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

        if (actorIsCoach &&
            trainee is not null &&
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
