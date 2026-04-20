namespace Mjolksyra.Domain.AI;

public class SurpriseBlockInput
{
    public required AthleteContext Athlete { get; set; }

    public required ICollection<string> Equipment { get; set; }

    public string? PreviousBlockReflection { get; set; }

    public string? PreviousBlockType { get; set; }

    public string? CompetitionDate { get; set; }
}

public class AthleteContext
{
    public required string ExperienceLevel { get; set; }

    public required string IntensityMethod { get; set; }

    public required string PreferredRepStyle { get; set; }

    public int WorkoutsPerWeek { get; set; }

    public ICollection<string> Goals { get; set; } = [];

    public string? RecentWorkoutsSummary { get; set; }
}

public class SurpriseBlockOutput
{
    public required string Name { get; set; }

    public required int NumberOfWeeks { get; set; }

    public required string BlockType { get; set; }

    public required ICollection<SurpriseBlockWorkout> Workouts { get; set; }
}

public class SurpriseBlockWorkout
{
    public required string Name { get; set; }

    public int Week { get; set; }

    public int DayOfWeek { get; set; }

    public string? Note { get; set; }

    public required ICollection<SurpriseBlockExercise> Exercises { get; set; }
}

public class SurpriseBlockExercise
{
    public required string Name { get; set; }

    public string? Note { get; set; }

    public string? RepStyle { get; set; }

    public required ICollection<SurpriseBlockSet> Sets { get; set; }
}

public class SurpriseBlockSet
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public float? RpeTarget { get; set; }

    public int? RirTarget { get; set; }

    public string? Note { get; set; }
}

public interface ISurpriseBlockAgent
{
    Task<SurpriseBlockOutput> GenerateAsync(SurpriseBlockInput input, CancellationToken cancellationToken = default);
}
