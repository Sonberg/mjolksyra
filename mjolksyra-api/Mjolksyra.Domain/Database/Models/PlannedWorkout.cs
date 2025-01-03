namespace Mjolksyra.Domain.Database.Models;

public class PlannedWorkout
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public Guid CoachUserId { get; set; }

    public Guid AthleteUserId { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<PlannedExercise> Exercises { get; set; }

    public DateOnly PlannedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}