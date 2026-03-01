namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedExerciseRequest
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public bool IsPublished { get; set; } = true;
}
