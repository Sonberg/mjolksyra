using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Contracts;


namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutResponse
{
    public required Guid Id { get; set; }

    public required Guid TraineeId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required ICollection<PlannedExerciseResponse> PublishedExercises { get; set; }

    public ICollection<PlannedExerciseResponse>? DraftExercises { get; set; }

    public required DateOnly PlannedAt { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public PlannedWorkoutAppliedBlockResponse? AppliedBlock { get; set; }

    public ICollection<PlannedWorkoutChangeResponse> Changes { get; set; } = [];

    public static PlannedWorkoutResponse From(PlannedWorkout workout, ICollection<Exercise> exercises)
    {
        return new PlannedWorkoutResponse
        {
            Id = workout.Id,
            TraineeId = workout.TraineeId,
            Name = workout.Name,
            Note = workout.Note,
            PublishedExercises = workout.PublishedExercises
                .Select(x => PlannedExerciseResponse.From(x, exercises))
                .ToList(),
            DraftExercises = workout.DraftExercises?
                .Select(x => PlannedExerciseResponse.From(x, exercises))
                .ToList(),
            Changes = ComputeChanges(workout),
            CreatedAt = workout.CreatedAt,
            PlannedAt = workout.PlannedAt,
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

    private static ICollection<PlannedWorkoutChangeResponse> ComputeChanges(PlannedWorkout workout)
    {
        if (workout.DraftExercises is null)
            return [];

        var changes = new List<PlannedWorkoutChangeResponse>();
        var publishedById = workout.PublishedExercises.ToDictionary(x => x.Id);
        var draftById = workout.DraftExercises.ToDictionary(x => x.Id);

        foreach (var (id, draft) in draftById)
        {
            if (!publishedById.TryGetValue(id, out var pub))
                changes.Add(new PlannedWorkoutChangeResponse { PlannedExerciseId = id, Name = draft.Name ?? string.Empty, Status = "Added" });
            else if (IsModified(pub, draft))
                changes.Add(new PlannedWorkoutChangeResponse { PlannedExerciseId = id, Name = draft.Name ?? string.Empty, Status = "Modified" });
        }

        foreach (var (id, pub) in publishedById)
        {
            if (!draftById.ContainsKey(id))
                changes.Add(new PlannedWorkoutChangeResponse { PlannedExerciseId = id, Name = pub.Name ?? string.Empty, Status = "Removed" });
        }

        return changes;
    }

    private static bool IsModified(PlannedExercise pub, PlannedExercise draft)
    {
        if (pub.Name != draft.Name || pub.Note != draft.Note) return true;
        if ((pub.Prescription is null) != (draft.Prescription is null)) return true;
        if (pub.Prescription is null) return false;

        if (pub.Prescription.Type != draft.Prescription!.Type) return true;

        var pubSets = pub.Prescription.Sets ?? [];
        var draftSets = draft.Prescription.Sets ?? [];
        if (pubSets.Count != draftSets.Count) return true;

        foreach (var (ps, ds) in pubSets.Zip(draftSets))
        {
            if (ps.Target?.Reps != ds.Target?.Reps) return true;
            if (ps.Target?.WeightKg != ds.Target?.WeightKg) return true;
            if (ps.Target?.DurationSeconds != ds.Target?.DurationSeconds) return true;
            if (ps.Target?.DistanceMeters != ds.Target?.DistanceMeters) return true;
            if (ps.Target?.Note != ds.Target?.Note) return true;
        }

        return false;
    }
}

public class PlannedWorkoutChangeResponse
{
    public required Guid PlannedExerciseId { get; set; }
    public required string Name { get; set; }
    public required string Status { get; set; }
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

    public ExerciseAddedBy? AddedBy { get; set; }

    public PlannedExercisePrescriptionResponse? Prescription { get; set; }

    public ExerciseLevel? Level { get; set; }

    public ICollection<ExerciseSport> Sports { get; set; } = [];

    public static PlannedExerciseResponse From(
        PlannedExercise plannedExercise,
        ICollection<Exercise> exercises)
    {
        var exercise = exercises.FirstOrDefault(e => e.Id == plannedExercise.ExerciseId);
        var targetType = plannedExercise.Prescription?.Type;

        return new PlannedExerciseResponse
        {
            Id = plannedExercise.Id,
            ExerciseId = plannedExercise.ExerciseId,
            Name = exercise?.Name ?? plannedExercise.Name,
            Note = plannedExercise.Note,
            IsPublished = plannedExercise.IsPublished,
            AddedBy = plannedExercise.AddedBy,
            Prescription = plannedExercise.Prescription is null
                ? null
                : new PlannedExercisePrescriptionResponse
                {
                    Type = plannedExercise.Prescription.Type,
                    Sets = plannedExercise.Prescription.Sets
                        ?.Select(x => new ExercisePrescriptionSetResponse
                        {
                            Target = x.Target is null ? null : new ExercisePrescriptionSetTargetResponse
                            {
                                Reps = x.Target.Reps,
                                DurationSeconds = x.Target.DurationSeconds,
                                DistanceMeters = x.Target.DistanceMeters,
                                WeightKg = targetType == ExerciseType.SetsReps
                                    ? x.Target.WeightKg
                                    : null,
                                Note = x.Target.Note,
                            },
                        })
                        .ToList()
                },
            Level = exercise?.Level,
            Sports = exercise?.Sports ?? []
        };
    }
}

public class PlannedExercisePrescriptionResponse
{
    public ExerciseType? Type { get; set; }

    public ICollection<ExercisePrescriptionSetResponse>? Sets { get; set; }
}

public class ExercisePrescriptionSetResponse
{
    public ExercisePrescriptionSetTargetResponse? Target { get; set; }
}

public class ExercisePrescriptionSetTargetResponse
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}
