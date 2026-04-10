namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutRequest
{
    public string? Name { get; set; }

    public string? Note { get; set; }

    public DateOnly PlannedAt { get; set; }
}
