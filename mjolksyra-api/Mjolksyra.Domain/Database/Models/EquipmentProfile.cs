using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class EquipmentProfile : IDocument
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public ICollection<EquipmentItem> Items { get; set; } = [];

    public string? ImageUrl { get; set; }

    public DateTimeOffset? DetectedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}

public class EquipmentItem
{
    public required string Name { get; set; }

    public bool Available { get; set; } = true;
}
