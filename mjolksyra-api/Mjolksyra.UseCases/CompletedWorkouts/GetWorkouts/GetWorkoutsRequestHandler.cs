using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;

public class GetWorkoutsRequestHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetWorkoutsRequest, PaginatedResponse<WorkoutResponse>>
{
    public async Task<PaginatedResponse<WorkoutResponse>> Handle(GetWorkoutsRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new PaginatedResponse<WorkoutResponse> { Data = [], Next = null };
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return new PaginatedResponse<WorkoutResponse> { Data = [], Next = null };
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        var isAthleteViewer = trainee is not null && trainee.CoachUserId != userId;

        var cursor = request.Cursor switch
        {
            not null => request.Cursor with
            {
                TraineeId = request.TraineeId,
                DraftOnly = request.DraftOnly
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
                DraftOnly = request.DraftOnly
            }
        };

        var workouts = await plannedWorkoutRepository.Get(cursor, cancellationToken);

        var visibleWorkouts = isAthleteViewer
            ? workouts.Data.Where(x => x.PublishedExercises.Count > 0).ToList()
            : workouts.Data;

        // Batch-fetch all sessions for this page of planned workouts
        var plannedWorkoutIds = visibleWorkouts.Select(x => x.Id).ToList();
        var sessions = await completedWorkoutRepository.GetByPlannedWorkoutIds(plannedWorkoutIds, cancellationToken);
        var sessionByPlannedWorkoutId = sessions.ToDictionary(s => s.PlannedWorkoutId);

        // Collect all exercise IDs across plans and sessions for a single master lookup
        var exerciseIds = visibleWorkouts
            .SelectMany(x => x.PublishedExercises.Concat(x.DraftExercises ?? []))
            .Select(x => x.ExerciseId)
            .Concat(sessions.SelectMany(s => s.Exercises.Select(e => e.ExerciseId)))
            .OfType<Guid>()
            .Distinct()
            .ToList();

        var masterExercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        var data = visibleWorkouts
            .Select(workout =>
            {
                sessionByPlannedWorkoutId.TryGetValue(workout.Id, out var session);
                var response = WorkoutResponse.From(workout, session, masterExercises, masterExercises);
                if (isAthleteViewer)
                {
                    response.DraftExercises = null;
                }
                return response;
            })
            .ToList();

        return new PaginatedResponse<WorkoutResponse>
        {
            Data = data,
            Next = workouts.Cursor,
        };
    }
}
