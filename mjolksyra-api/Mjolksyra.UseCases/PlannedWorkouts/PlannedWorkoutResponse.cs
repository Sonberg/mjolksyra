using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutResponse
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<PlannedExerciseResponse> Exercises { get; set; }

    public DateOnly PlannedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public static PlannedWorkoutResponse From(PlannedWorkout workout)
    {
        return new PlannedWorkoutResponse
        {
            Id = workout.Id,
            TraineeId = workout.TraineeId,
            Name = workout.Name,
            Note = workout.Note,
            Exercises = workout.Exercises.Select(PlannedExerciseResponse.From).ToList(),
            CreatedAt = workout.CreatedAt,
            PlannedAt = workout.PlannedAt
        };
    }
}

public class PlannedExerciseResponse
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public static PlannedExerciseResponse From(PlannedExercise exercise)
    {
        return new PlannedExerciseResponse
        {
            Id = exercise.Id,
            ExerciseId = exercise.ExerciseId,
            Name = exercise.Name,
            Note = exercise.Note,
        };
    }
}