using MediatR;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

public class GetPlannedWorkoutsRequest : IRequest<PaginatedResponse<PlannedWorkoutResponse>>
{
    public Guid TraineeId { get; set; }

    public DateOnly? From { get; set; }

    public DateOnly? To { get; set; }

    public required PlannedWorkoutCursor? Cursor { get; set; }

    public required int Limit { get; set; }

    public required string[]? SortBy { get; set; }

    public required SortOrder Order { get; set; } = SortOrder.Asc;
}