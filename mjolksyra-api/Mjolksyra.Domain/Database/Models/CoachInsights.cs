using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class CoachInsights : IDocument
{
    /// <summary>Set to CoachUserId — one document per coach.</summary>
    public Guid Id { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public string Status { get; set; } = InsightsStatus.Pending;

    public DateTimeOffset? LastRebuiltAt { get; set; }

    public string CoachingStyleSummary { get; set; } = string.Empty;

    public ICollection<CoachEffectivenessPattern> EffectivenessPatterns { get; set; } = [];
}

public class CoachEffectivenessPattern
{
    public string Pattern { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;
}
