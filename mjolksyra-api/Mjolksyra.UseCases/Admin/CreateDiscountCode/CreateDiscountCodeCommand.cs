using MediatR;

namespace Mjolksyra.UseCases.Admin.CreateDiscountCode;

public enum DiscountType
{
    Percent,
    FixedAmount,
}

public enum DiscountDuration
{
    Forever,
    Once,
    Repeating,
}

public class CreateDiscountCodeCommand : IRequest<CreateDiscountCodeResult>
{
    public required string Code { get; set; }

    public required string Description { get; set; }

    public required DiscountType DiscountType { get; set; }

    public required int DiscountValue { get; set; }

    public required DiscountDuration Duration { get; set; }

    public int? DurationInMonths { get; set; }

    public int? MaxRedemptions { get; set; }
}

public class CreateDiscountCodeResult
{
    public required Guid Id { get; set; }

    public required string Code { get; set; }

    public required string Description { get; set; }
}
