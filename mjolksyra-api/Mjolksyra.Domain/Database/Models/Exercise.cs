using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class Exercise : IDocument
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Name { get; init; }

    public ExerciseLevel? Level { get; set; }
    
    public ExerciseSport? Sport { get; set; }


    public ExerciseType Type { get; init; }

    public Guid? CreatedBy { get; set; }

    public ICollection<Guid> StarredBy { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}

public enum ExerciseType
{
    SetsReps,
    DurationSeconds,
    DistanceMeters
}

public enum ExerciseLevel
{
    Beginner,
    Intermediate,
    Expert
}

public enum ExerciseSport
{
    Powerlifting,
    Strongman,
    OlympicWeightlifting,
    Bodybuilding,
    Crossfit,
    Hyrox,
    Calisthenics,
    Functional
}