using System.Text.Json;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Common;

public record PlannedWorkoutCursor : Cursor
{
    public static implicit operator string?(PlannedWorkoutCursor? cursor)
    {
        return cursor?.ToString();
    }

    public required Guid TraineeId { get; set; }

    public required DateOnly? FromDate { get; set; }

    public required DateOnly? ToDate { get; set; }

    public required string[]? SortBy { get; set; }

    public required SortOrder Order { get; set; }

    public override string ToString()
    {
        var str = JsonSerializer.Serialize(this);
        var bytes = System.Text.Encoding.UTF8.GetBytes(str);

        return Convert.ToBase64String(bytes);
    }
}