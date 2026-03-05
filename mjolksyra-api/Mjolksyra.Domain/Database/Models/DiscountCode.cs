namespace Mjolksyra.Domain.Database.Models;

public class DiscountCode
{
    public Guid Id { get; set; }

    public required string Code { get; set; }

    public required string StripeCouponId { get; set; }

    public required string Description { get; set; }

    public int? MaxRedemptions { get; set; }

    public int RedeemedCount { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; }
}
