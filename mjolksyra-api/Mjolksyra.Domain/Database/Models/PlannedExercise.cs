namespace Mjolksyra.Domain.Database.Models;

public class PlannedExercise
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }
}