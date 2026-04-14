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

    private readonly ICompletedWorkoutRepository _completedWorkoutRepository;

    private readonly IUserContext _userContext;

    public GetPlannedWorkoutsRequestHandler(
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IExerciseRepository exerciseRepository,
        ITraineeRepository traineeRepository,
        ICompletedWorkoutRepository completedWorkoutRepository,
        IUserContext userContext)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _exerciseRepository = exerciseRepository;
        _traineeRepository = traineeRepository;
        _completedWorkoutRepository = completedWorkoutRepository;
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

        var cursor = request.Cursor switch
        {
            not null => request.Cursor with
            {
                TraineeId = request.TraineeId,
                DraftOnly = request.DraftOnly,
                SkippedOnly = request.SkippedOnly
            },
            _ => new PlannedWorkoutCursor
            {
                Page = 0,
                TraineeId = request.TraineeId,
                FromDate = request.From,
                ToDate = request.To,
                Size = request.Limit,
                SortBy = request.SortBy,
                Order = request.Order,
                DraftOnly = request.DraftOnly,
                SkippedOnly = request.SkippedOnly
            }
        };

        var workouts = await _plannedWorkoutRepository.Get(cursor, cancellationToken);
        var plannedWorkoutIds = workouts.Data.Select(x => x.Id).ToList();
        var sessions = plannedWorkoutIds.Count == 0
            ? []
            : await _completedWorkoutRepository.GetByPlannedWorkoutIds(plannedWorkoutIds, cancellationToken);

        var completedWorkoutIds = (request.DraftOnly ? [] : sessions)
            .Where(x => x.CompletedAt.HasValue && x.PlannedWorkoutId.HasValue)
            .Select(x => x.PlannedWorkoutId!.Value)
            .ToHashSet();

        var workoutsWithoutCompletedSessions = workouts.Data
            .Where(x => request.DraftOnly || !completedWorkoutIds.Contains(x.Id))
            .ToList();

        var visibleWorkouts = (isAthleteViewer
            ? workoutsWithoutCompletedSessions.Where(x => x.PublishedExercises.Count > 0)
            : workoutsWithoutCompletedSessions)
            .ToList();

        var exerciseIds = visibleWorkouts
            .SelectMany(x => x.PublishedExercises.Concat(x.DraftExercises ?? []))
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await _exerciseRepository.GetMany(exerciseIds, cancellationToken);
        var workoutIdsWithActiveSession = sessions
            .Where(x => !x.CompletedAt.HasValue &&
                        x.PlannedWorkoutId.HasValue &&
                        x.Exercises.Any(e =>
                            e.Prescription != null &&
                            e.Prescription.Sets != null &&
                            e.Prescription.Sets.Any(s => s.Actual != null && s.Actual.IsDone)))
            .Select(x => x.PlannedWorkoutId!.Value)
            .ToHashSet();

        return new PaginatedResponse<PlannedWorkoutResponse>
        {
            Next = workouts.Cursor,
            Data = visibleWorkouts
                .Select(x =>
                {
                    var response = PlannedWorkoutResponse.From(x, exercises);
                    response.HasActiveSession = workoutIdsWithActiveSession.Contains(x.Id);
                    if (isAthleteViewer)
                    {
                        response.DraftExercises = null;
                    }
                    return response;
                })
                .ToList(),
        };
    }
}
