using System.Text.Json;

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

    public override string ToString()
    {
        var str = JsonSerializer.Serialize(this);
        var bytes = System.Text.Encoding.UTF8.GetBytes(str);

        return Convert.ToBase64String(bytes);
    }
}