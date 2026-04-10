using MediatR;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;

public class GetWorkoutsRequest : IRequest<PaginatedResponse<CompletedWorkoutResponse>>
{
    public Guid TraineeId { get; set; }

    public DateOnly? From { get; set; }

    public DateOnly? To { get; set; }

    public required CompletedWorkoutCursor? Cursor { get; set; }

    public required int Limit { get; set; }

    public required string[]? SortBy { get; set; }

    public required SortOrder Order { get; set; } = SortOrder.Asc;
}
