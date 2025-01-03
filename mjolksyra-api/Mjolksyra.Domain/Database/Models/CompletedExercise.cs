namespace Mjolksyra.Domain.Database.Models;

public class CompletedExercise
{
    public required string Name { get; set; }

    public string? Note { get; set; }
}