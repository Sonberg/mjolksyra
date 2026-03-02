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

    public DateTimeOffset? CompletedAt { get; set; }

    public string? CompletionNote { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public string? ReviewNote { get; set; }

    public PlannedWorkoutAppliedBlockResponse? AppliedBlock { get; set; }

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
            PlannedAt = workout.PlannedAt,
            CompletedAt = workout.CompletedAt,
            CompletionNote = workout.CompletionNote,
            ReviewedAt = workout.ReviewedAt,
            ReviewNote = workout.ReviewNote,
            AppliedBlock = workout.AppliedBlock is null
                ? null
                : new PlannedWorkoutAppliedBlockResponse
                {
                    BlockId = workout.AppliedBlock.BlockId,
                    BlockName = workout.AppliedBlock.BlockName,
                    StartDate = workout.AppliedBlock.StartDate,
                    WeekNumber = workout.AppliedBlock.WeekNumber,
                    TotalWeeks = workout.AppliedBlock.TotalWeeks
                }
        };
    }
}

public class PlannedWorkoutAppliedBlockResponse
{
    public required Guid BlockId { get; set; }

    public required string BlockName { get; set; }

    public required DateOnly StartDate { get; set; }

    public required int WeekNumber { get; set; }

    public required int TotalWeeks { get; set; }
}

public class PlannedExerciseResponse : IExerciseResponse
{
    public required Guid Id { get; set; }

    public required Guid? ExerciseId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required bool IsPublished { get; set; }

    public required bool IsDone { get; set; }

    public PlannedExercisePrescriptionResponse? Prescription { get; set; }

    public required string? Force { get; set; }

    public required string? Level { get; set; }

    public required string? Mechanic { get; set; }

    public required string? Category { get; set; }

    public required ICollection<string> Instructions { get; set; }

    public required ICollection<string> Images { get; set; }

    public static PlannedExerciseResponse From(PlannedExercise plannedExercise, ICollection<Exercise> exercises)
    {
        var exercise = exercises.FirstOrDefault(e => e.Id == plannedExercise.ExerciseId);
        var sets = plannedExercise.Prescription?.Sets;

        return new PlannedExerciseResponse
        {
            Id = plannedExercise.Id,
            ExerciseId = plannedExercise.ExerciseId,
            Name = exercise?.Name ?? plannedExercise.Name,
            Note = plannedExercise.Note,
            IsPublished = plannedExercise.IsPublished,
            IsDone = sets?.Count > 0 && sets.All(s => s.Actual?.IsDone == true),
            Prescription = plannedExercise.Prescription is null
                ? null
                : new PlannedExercisePrescriptionResponse
                {
                    TargetType = plannedExercise.Prescription.TargetType,
                    Sets = plannedExercise.Prescription.Sets
                        ?.Select(x => new ExercisePrescriptionSetResponse
                        {
                            Target = x.Target is null ? null : new ExercisePrescriptionSetTargetResponse
                            {
                                Reps = x.Target.Reps,
                                DurationSeconds = x.Target.DurationSeconds,
                                DistanceMeters = x.Target.DistanceMeters,
                                WeightKg = x.Target.WeightKg,
                                Note = x.Target.Note,
                            },
                            Actual = x.Actual is null ? null : new ExercisePrescriptionSetActualResponse
                            {
                                WeightKg = x.Actual.WeightKg,
                                DurationSeconds = x.Actual.DurationSeconds,
                                DistanceMeters = x.Actual.DistanceMeters,
                                IsDone = x.Actual.IsDone,
                            }
                        })
                        .ToList()
                },
            Category = exercise?.Category ?? string.Empty,
            Force = exercise?.Force ?? string.Empty,
            Level = exercise?.Level ?? string.Empty,
            Mechanic = exercise?.Mechanic ?? string.Empty,
            Images = exercise?.Images ?? Array.Empty<string>(),
            Instructions = exercise?.Instructions ?? Array.Empty<string>()
        };
    }
}

public class PlannedExercisePrescriptionResponse
{
    public string? TargetType { get; set; }

    public ICollection<ExercisePrescriptionSetResponse>? Sets { get; set; }
}

public class ExercisePrescriptionSetResponse
{
    public ExercisePrescriptionSetTargetResponse? Target { get; set; }

    public ExercisePrescriptionSetActualResponse? Actual { get; set; }
}

public class ExercisePrescriptionSetTargetResponse
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}

public class ExercisePrescriptionSetActualResponse
{
    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public bool IsDone { get; set; }
}
