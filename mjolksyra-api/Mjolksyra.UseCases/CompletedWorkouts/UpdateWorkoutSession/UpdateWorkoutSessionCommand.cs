using MediatR;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.UpdateWorkoutSession;

public class UpdateWorkoutSessionCommand : IRequest<WorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid Id { get; set; }

    public required UpdateWorkoutSessionRequest Session { get; set; }
}

public class UpdateWorkoutSessionRequest
{
    public required ICollection<CompletedExerciseRequest> Exercises { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];
}

public class CompletedExerciseRequest
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public CompletedExercisePrescriptionRequest? Prescription { get; set; }
}

public class CompletedExercisePrescriptionRequest
{
    public ExerciseType? Type { get; set; }

    public ICollection<CompletedExerciseSetRequest>? Sets { get; set; }
}

public class CompletedExerciseSetRequest
{
    public CompletedExerciseSetTargetRequest? Target { get; set; }

    public CompletedExerciseSetActualRequest? Actual { get; set; }
}

public class CompletedExerciseSetTargetRequest
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}

public class CompletedExerciseSetActualRequest
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }

    public bool IsDone { get; set; }
}
