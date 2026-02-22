using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Blocks;

public class BlockResponse
{
    public required Guid Id { get; set; }

    public required Guid CoachId { get; set; }

    public required string Name { get; set; }

    public required int NumberOfWeeks { get; set; }

    public required ICollection<BlockWorkoutResponse> Workouts { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public static BlockResponse From(Block block)
    {
        return new BlockResponse
        {
            Id = block.Id,
            CoachId = block.CoachId,
            Name = block.Name,
            NumberOfWeeks = block.NumberOfWeeks,
            Workouts = block.Workouts.Select(BlockWorkoutResponse.From).ToList(),
            CreatedAt = block.CreatedAt,
        };
    }
}

public class BlockWorkoutResponse
{
    public required Guid Id { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required ICollection<BlockExerciseResponse> Exercises { get; set; }

    public required int Week { get; set; }

    public required int DayOfWeek { get; set; }

    public static BlockWorkoutResponse From(BlockWorkout workout)
    {
        return new BlockWorkoutResponse
        {
            Id = workout.Id,
            Name = workout.Name,
            Note = workout.Note,
            Exercises = workout.Exercises.Select(BlockExerciseResponse.From).ToList(),
            Week = workout.Week,
            DayOfWeek = workout.DayOfWeek,
        };
    }
}

public class BlockExerciseResponse
{
    public required Guid Id { get; set; }

    public required Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public required string? Note { get; set; }

    public static BlockExerciseResponse From(BlockExercise exercise)
    {
        return new BlockExerciseResponse
        {
            Id = exercise.Id,
            ExerciseId = exercise.ExerciseId,
            Name = exercise.Name,
            Note = exercise.Note,
        };
    }
}
