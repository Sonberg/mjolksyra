using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class Exercise : IDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Category { get; set; }

    public ICollection<string> Instructions { get; set; } = Array.Empty<string>();
    
    public ICollection<string> Images { get; set; } = Array.Empty<string>();

    public Guid? CreatedBy { get; set; }

    public ICollection<Guid> StarredBy { get; set; } = Array.Empty<Guid>();

    public double Score { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
