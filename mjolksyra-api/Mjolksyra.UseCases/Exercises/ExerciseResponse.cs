using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.Exercises;

public class ExerciseResponse : IExerciseResponse
{
    public required Guid Id { get; set; }

    public required string Name { get; set; }

    public ExerciseLevel? Level { get; set; }

    public ICollection<ExerciseSport> Sports { get; set; } = [];

    public ExerciseType? Type { get; set; }

    public required bool Starred { get; set; }

    public required bool CanDelete { get; set; }

    public static ExerciseResponse From(Exercise exercise, Guid? userId)
    {
        return new ExerciseResponse
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Level = exercise.Level,
            Sports = exercise.Sports,
            Type = exercise.Type,
            Starred = userId != null && exercise.StarredBy.Contains(userId.Value),
            CanDelete = userId != null && exercise.CreatedBy == userId
        };
    }
}
