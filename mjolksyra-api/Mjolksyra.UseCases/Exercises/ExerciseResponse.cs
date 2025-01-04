using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Exercises;

public class ExerciseResponse
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Equipment { get; set; }

    public string? Category { get; set; }

    public bool Starred { get; set; }

    public static ExerciseResponse From(Exercise exercise)
    {
        return new ExerciseResponse
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Category = exercise.Category,
            Equipment = exercise.Equipment,
            Force = exercise.Force,
            Level = exercise.Level,
            Mechanic = exercise.Mechanic
        };
    }
}