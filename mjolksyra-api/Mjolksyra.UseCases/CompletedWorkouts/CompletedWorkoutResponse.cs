using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts;

public class CompletedWorkoutMediaResponse
{
    public required string RawUrl { get; set; }
    public string? CompressedUrl { get; set; }
    public PlannedWorkoutMediaType Type { get; set; }
}

public class CompletedWorkoutResponse
{
    public required Guid Id { get; set; }

    public Guid? PlannedWorkoutId { get; set; }

    public required Guid TraineeId { get; set; }

    public required DateOnly PlannedAt { get; set; }

    public required ICollection<CompletedExerciseResponse> Exercises { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public ICollection<CompletedWorkoutMediaResponse> Media { get; set; } = [];

    public required DateTimeOffset CreatedAt { get; set; }

    public bool HasUnreadActivity { get; set; }

    public static CompletedWorkoutResponse From(CompletedWorkout session, ICollection<Exercise> exercises)
    {
        return new CompletedWorkoutResponse
        {
            Id = session.Id,
            PlannedWorkoutId = session.PlannedWorkoutId,
            TraineeId = session.TraineeId,
            PlannedAt = session.PlannedAt,
            Exercises = session.Exercises
                .Select(e => CompletedExerciseResponse.From(e, exercises))
                .ToList(),
            CompletedAt = session.CompletedAt,
            ReviewedAt = session.ReviewedAt,
            Media = session.Media
                .Select(m => new CompletedWorkoutMediaResponse
                {
                    RawUrl = m.RawUrl,
                    CompressedUrl = m.CompressedUrl,
                    Type = m.Type,
                })
                .ToList(),
            CreatedAt = session.CreatedAt,
        };
    }
}

public class CompletedExerciseResponse
{
    public required Guid Id { get; set; }

    public required Guid? ExerciseId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required bool IsDone { get; set; }

    public CompletedExercisePrescriptionResponse? Prescription { get; set; }

    public static CompletedExerciseResponse From(CompletedExercise exercise, ICollection<Exercise> exercises)
    {
        var masterExercise = exercises.FirstOrDefault(e => e.Id == exercise.ExerciseId);
        var targetType = exercise.Prescription?.Type;
        var sets = exercise.Prescription?.Sets;

        return new CompletedExerciseResponse
        {
            Id = exercise.Id,
            ExerciseId = exercise.ExerciseId,
            Name = masterExercise?.Name ?? exercise.Name,
            Note = exercise.Note,
            IsDone = sets?.Count > 0
                ? sets.All(s => s.Actual?.IsDone == true)
                : false,
            Prescription = exercise.Prescription is null
                ? null
                : new CompletedExercisePrescriptionResponse
                {
                    Type = exercise.Prescription.Type,
                    Sets = sets
                        ?.Select(x => new CompletedExercisePrescriptionSetResponse
                        {
                            Target = x.Target is null ? null : new CompletedSetTargetResponse
                            {
                                Reps = x.Target.Reps,
                                DurationSeconds = x.Target.DurationSeconds,
                                DistanceMeters = x.Target.DistanceMeters,
                                WeightKg = targetType == ExerciseType.SetsReps ? x.Target.WeightKg : null,
                                Note = x.Target.Note,
                            },
                            Actual = x.Actual is null ? null : new CompletedSetActualResponse
                            {
                                Reps = x.Actual.Reps,
                                WeightKg = targetType == ExerciseType.SetsReps ? x.Actual.WeightKg : null,
                                DurationSeconds = x.Actual.DurationSeconds,
                                DistanceMeters = x.Actual.DistanceMeters,
                                Note = x.Actual.Note,
                                IsDone = x.Actual.IsDone,
                            }
                        })
                        .ToList()
                },
        };
    }
}

public class CompletedExercisePrescriptionResponse
{
    public ExerciseType? Type { get; set; }

    public ICollection<CompletedExercisePrescriptionSetResponse>? Sets { get; set; }
}

public class CompletedExercisePrescriptionSetResponse
{
    public CompletedSetTargetResponse? Target { get; set; }

    public CompletedSetActualResponse? Actual { get; set; }
}

public class CompletedSetTargetResponse
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}

public class CompletedSetActualResponse
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }

    public bool IsDone { get; set; }
}
