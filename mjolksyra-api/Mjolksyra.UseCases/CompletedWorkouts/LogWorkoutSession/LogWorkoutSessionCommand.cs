using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;

public class LogWorkoutSessionCommand : IRequest<CompletedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid Id { get; set; }

    public required LogWorkoutSessionRequest Log { get; set; }
}

public class LogWorkoutSessionRequest
{
    public DateTimeOffset? CompletedAt { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];

    public required ICollection<LogWorkoutExerciseRequest> Exercises { get; set; }
}

public class LogWorkoutExerciseRequest
{
    public required Guid Id { get; set; }

    public required ICollection<LogWorkoutSetActualRequest> Sets { get; set; }
}

public class LogWorkoutSetActualRequest
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }

    public bool IsDone { get; set; }
}
