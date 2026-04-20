namespace Mjolksyra.Domain.Database.Models;

public enum ExperienceLevel
{
    Beginner,
    Intermediate,
    Advanced
}

public enum IntensityMethod
{
    Weight,
    Rpe,
    Rir
}

public enum RepStyle
{
    Regular,
    Paused,
    Eccentric,
    Mixed
}

public class AthleteTrainingProfile
{
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Beginner;

    public IntensityMethod IntensityMethod { get; set; } = IntensityMethod.Weight;

    public RepStyle PreferredRepStyle { get; set; } = RepStyle.Regular;

    public int WorkoutsPerWeek { get; set; } = 3;

    public ExerciseSport GoalSport { get; set; } = ExerciseSport.Powerlifting;

    public ICollection<string> Goals { get; set; } = [];

    public DateOnly? CompetitionDate { get; set; }

    public string? CoachNotes { get; set; }
}
