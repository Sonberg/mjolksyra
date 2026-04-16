using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

public class PublishDraftExercisesCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    ICoachInsightsRebuildPublisher coachInsightsRebuildPublisher) : IRequestHandler<PublishDraftExercisesCommand, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(PublishDraftExercisesCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        if (request.Exercises != null)
        {
            workout.DraftExercises = request.Exercises
                .Select(x => new PlannedExercise
                {
                    Id = x.Id == Guid.Empty ? Guid.NewGuid() : x.Id,
                    ExerciseId = x.ExerciseId,
                    Name = x.Name,
                    Note = x.Note,
                    IsPublished = false,
                    AddedBy = ExerciseAddedBy.Coach,
                    Prescription = x.Prescription is null
                        ? null
                        : new ExercisePrescription
                        {
                            Type = x.Prescription.Type,
                            Sets = x.Prescription.Sets
                                ?.Select(s => new ExercisePrescriptionSet
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
                                    Actual = null,
                                })
                                .ToList()
                        }
                })
                .ToList();
        }

        var draftExercises = workout.DraftExercises;
        if (draftExercises is null)
        {
            return PlannedWorkoutResponse.From(workout, []);
        }

        foreach (var exercise in draftExercises)
        {
            exercise.IsPublished = true;
        }

        workout.PublishedExercises = draftExercises;
        workout.DraftExercises = null;

        await plannedWorkoutRepository.Update(workout, cancellationToken);

        var exerciseIds = workout.PublishedExercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        await coachInsightsRebuildPublisher.Publish(new CoachInsightsRebuildRequestedMessage(
            CoachUserId: userId,
            RequestedAt: DateTimeOffset.UtcNow), cancellationToken);

        return PlannedWorkoutResponse.From(workout, exercises);
    }
}
