using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class Exercise : IDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Equipment { get; set; }

    public string? Category { get; set; }

    public ICollection<string> Instructions { get; set; } = Array.Empty<string>();

    public ICollection<string> PrimaryMuscles { get; set; } = Array.Empty<string>();

    public ICollection<string> SecondaryMuscles { get; set; } = Array.Empty<string>();

    public Guid? CreatedByUserId { get; set; }

    public ICollection<Guid> LinkedBy { get; set; } = Array.Empty<Guid>();

    public double Score { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}