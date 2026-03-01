using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

public class GetPlannedWorkoutsRequestHandler : IRequestHandler<GetPlannedWorkoutsRequest, PaginatedResponse<PlannedWorkoutResponse>>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly IExerciseRepository _exerciseRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserContext _userContext;

    public GetPlannedWorkoutsRequestHandler(
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IExerciseRepository exerciseRepository,
        ITraineeRepository traineeRepository,
        IUserContext userContext)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _exerciseRepository = exerciseRepository;
        _traineeRepository = traineeRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedResponse<PlannedWorkoutResponse>> Handle(GetPlannedWorkoutsRequest request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new PaginatedResponse<PlannedWorkoutResponse>
            {
                Data = [],
                Next = null
            };
        }

        if (!await _traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return new PaginatedResponse<PlannedWorkoutResponse>
            {
                Data = [],
                Next = null
            };
        }

        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        var isAthleteViewer = trainee is not null && trainee.CoachUserId != userId;

        var workouts = request switch
        {
            { Cursor: not null } => await _plannedWorkoutRepository.Get(request.Cursor, cancellationToken),
            _ => await _plannedWorkoutRepository.Get(new PlannedWorkoutCursor
            {
                Page = 0,
                TraineeId = request.TraineeId,
                FromDate = request.From,
                ToDate = request.To,
                Size = request.Limit,
                SortBy = request.SortBy,
                Order = request.Order
            }, cancellationToken)
        };

        var visibleWorkouts = isAthleteViewer
            ? workouts.Data
                .Select(FilterPublishedExercises)
                .Where(x => x.Exercises.Count > 0)
                .ToList()
            : workouts.Data;

        var exerciseIds = visibleWorkouts.SelectMany(x => x.Exercises)
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return new PaginatedResponse<PlannedWorkoutResponse>
        {
            Next = workouts.Cursor,
            Data = visibleWorkouts
                .Select(x => PlannedWorkoutResponse.From(x, exercises))
                .ToList(),
        };
    }

    private static Domain.Database.Models.PlannedWorkout FilterPublishedExercises(
        Domain.Database.Models.PlannedWorkout workout)
    {
        return new Domain.Database.Models.PlannedWorkout
        {
            Id = workout.Id,
            TraineeId = workout.TraineeId,
            Name = workout.Name,
            Note = workout.Note,
            PlannedAt = workout.PlannedAt,
            CreatedAt = workout.CreatedAt,
            CompletedAt = workout.CompletedAt,
            CompletionNote = workout.CompletionNote,
            ReviewedAt = workout.ReviewedAt,
            ReviewNote = workout.ReviewNote,
            AppliedBlock = workout.AppliedBlock,
            Exercises = workout.Exercises
                .Where(e => e.IsPublished)
                .ToList()
        };
    }
}
