using System.Text.Json;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Common;

public record CompletedWorkoutCursor : Cursor
{
    public static implicit operator string?(CompletedWorkoutCursor? cursor)
    {
        return cursor?.ToString();
    }

    public required Guid TraineeId { get; set; }

    public required DateOnly? FromDate { get; set; }

    public required DateOnly? ToDate { get; set; }

    public required string[]? SortBy { get; set; }

    public required SortOrder Order { get; set; }

    /// <summary>When true, only returns sessions where CompletedAt is set.</summary>
    public bool? CompletedOnly { get; set; }

    public override string ToString()
    {
        var str = JsonSerializer.Serialize(this);
        var bytes = System.Text.Encoding.UTF8.GetBytes(str);

        return Convert.ToBase64String(bytes);
    }
}
