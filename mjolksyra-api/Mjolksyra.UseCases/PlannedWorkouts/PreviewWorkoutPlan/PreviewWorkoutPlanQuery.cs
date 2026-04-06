using MediatR;
using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

public class PreviewWorkoutPlanQuery : IRequest<PreviewWorkoutPlanResponse?>
{
    public required Guid TraineeId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];

    public required PreviewWorkoutPlanParams Params { get; set; }
}

public class PreviewWorkoutPlanParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class PreviewWorkoutPlanResponse
{
    public required ICollection<PreviewWorkoutPlanWorkout> Workouts { get; set; }
}

public class PreviewWorkoutPlanWorkout
{
    public required string PlannedAt { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<PreviewWorkoutPlanExercise> Exercises { get; set; }
}

public class PreviewWorkoutPlanExercise
{
    public required string Name { get; set; }

    public string? Note { get; set; }

    public string? PrescriptionType { get; set; }

    public ICollection<PreviewWorkoutPlanSet> Sets { get; set; } = [];
}

public class PreviewWorkoutPlanSet
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }
}
