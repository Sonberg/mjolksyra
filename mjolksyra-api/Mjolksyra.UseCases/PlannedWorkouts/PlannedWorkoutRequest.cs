namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutRequest
{
    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<PlannedExerciseRequest> Exercises { get; set; }

    public DateOnly PlannedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public string? CompletionNote { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public string? ReviewNote { get; set; }
}
