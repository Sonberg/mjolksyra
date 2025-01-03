namespace Mjolksyra.Domain.Database.Models;

public class CompletedWorkout
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<CompletedExercise> Exercises { get; set; }

    public DateOnly PlannedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}