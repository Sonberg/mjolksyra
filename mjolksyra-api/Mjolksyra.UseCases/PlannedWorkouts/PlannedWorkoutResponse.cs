using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutResponse
{
    public required Guid Id { get; set; }

    public required Guid TraineeId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required ICollection<PlannedExerciseResponse> Exercises { get; set; }

    public required DateOnly PlannedAt { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public static PlannedWorkoutResponse From(PlannedWorkout workout, ICollection<Exercise> exercises)
    {
        return new PlannedWorkoutResponse
        {
            Id = workout.Id,
            TraineeId = workout.TraineeId,
            Name = workout.Name,
            Note = workout.Note,
            Exercises = workout.Exercises.Select(x => PlannedExerciseResponse.From(x, exercises)).ToList(),
            CreatedAt = workout.CreatedAt,
            PlannedAt = workout.PlannedAt
        };
    }
}

public class PlannedExerciseResponse : IExerciseResponse
{
    public required Guid Id { get; set; }

    public required Guid? ExerciseId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required string? Force { get; set; }

    public required string? Level { get; set; }

    public required string? Mechanic { get; set; }

    public required string? Equipment { get; set; }

    public required string? Category { get; set; }

    public required ICollection<string> Instructions { get; set; }

    public required ICollection<string> PrimaryMuscles { get; set; }

    public required ICollection<string> SecondaryMuscles { get; set; }

    public static PlannedExerciseResponse From(PlannedExercise plannedExercise, ICollection<Exercise> exercises)
    {
        var exercise = exercises.FirstOrDefault(e => e.Id == plannedExercise.ExerciseId);

        return new PlannedExerciseResponse
        {
            Id = plannedExercise.Id,
            ExerciseId = plannedExercise.ExerciseId,
            Name = exercise?.Name ?? string.Empty,
            Note = plannedExercise.Note,
            Category = exercise?.Category ?? string.Empty,
            Equipment = exercise?.Equipment ?? string.Empty,
            Force = exercise?.Force ?? string.Empty,
            Level = exercise?.Level ?? string.Empty,
            Mechanic = exercise?.Mechanic ?? string.Empty,
            Instructions = exercise?.Instructions ?? Array.Empty<string>(),
            PrimaryMuscles = exercise?.PrimaryMuscles ?? Array.Empty<string>(),
            SecondaryMuscles = exercise?.SecondaryMuscles ?? Array.Empty<string>()
        };
    }
}