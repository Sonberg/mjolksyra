using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;

public class GetWorkoutsRequestHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    INotificationRepository notificationRepository,
    IUserContext userContext) : IRequestHandler<GetWorkoutsRequest, PaginatedResponse<CompletedWorkoutResponse>>
{
    public async Task<PaginatedResponse<CompletedWorkoutResponse>> Handle(GetWorkoutsRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new PaginatedResponse<CompletedWorkoutResponse> { Data = [], Next = null };
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return new PaginatedResponse<CompletedWorkoutResponse> { Data = [], Next = null };
        }

        var cursor = request.Cursor switch
        {
            not null => request.Cursor with
            {
                TraineeId = request.TraineeId,
                CompletedOnly = true,
            },
            _ => new CompletedWorkoutCursor
            {
                Page = 0,
                TraineeId = request.TraineeId,
                FromDate = request.From,
                ToDate = request.To,
                Size = request.Limit,
                SortBy = request.SortBy,
                Order = request.Order,
                CompletedOnly = true,
            }
        };

        var workouts = await completedWorkoutRepository.Get(cursor, cancellationToken);

        var exerciseIds = workouts.Data
            .SelectMany(s => s.Exercises.Select(e => e.ExerciseId))
            .OfType<Guid>()
            .Distinct()
            .ToList();

        var masterExercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        var unreadWorkoutIds = new HashSet<Guid>(
            await notificationRepository.GetUnreadCompletedWorkoutIds(userId, cancellationToken));

        var data = workouts.Data
            .Select(workout =>
            {
                var response = CompletedWorkoutResponse.From(workout, masterExercises);
                response.HasUnreadActivity = unreadWorkoutIds.Contains(workout.Id);
                return response;
            })
            .ToList();

        return new PaginatedResponse<CompletedWorkoutResponse>
        {
            Data = data,
            Next = workouts.Cursor,
        };
    }
}
