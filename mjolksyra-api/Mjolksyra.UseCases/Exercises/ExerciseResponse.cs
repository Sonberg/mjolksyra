using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.Exercises;

public class ExerciseResponse : IExerciseResponse
{
    public required Guid Id { get; set; }

    public required string Name { get; set; }

    public required string? Force { get; set; }

    public required string? Level { get; set; }

    public required string? Mechanic { get; set; }

    public required string? Equipment { get; set; }

    public required string? Category { get; set; }

    public required ICollection<string> Instructions { get; set; } 

    public required ICollection<string> PrimaryMuscles { get; set; }

    public required ICollection<string> SecondaryMuscles { get; set; }

    public required bool Starred { get; set; }

    public required bool CanDelete { get; set; }

    public static ExerciseResponse From(Exercise exercise, Guid? userId)
    {
        return new ExerciseResponse
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Category = exercise.Category,
            Equipment = exercise.Equipment,
            Force = exercise.Force,
            Level = exercise.Level,
            Mechanic = exercise.Mechanic,
            Starred = userId != null && exercise.StarredBy.Contains(userId.Value),
            CanDelete = userId != null && exercise.CreatedByUserId == userId,
            Instructions = exercise.Instructions,
            PrimaryMuscles = exercise.PrimaryMuscles,
            SecondaryMuscles = exercise.SecondaryMuscles
        };
    }
}