using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class BlockCompletionContext : IDocument
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public Guid BlockId { get; set; }

    public string AthleteReflection { get; set; } = string.Empty;

    public Guid? GeneratedNextBlockId { get; set; }

    public DateTimeOffset CompletedAt { get; set; }
}
