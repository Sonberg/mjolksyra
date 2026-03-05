using MediatR;

namespace Mjolksyra.UseCases.Admin.GetDiscountCodes;

public class GetDiscountCodesRequest : IRequest<ICollection<DiscountCodeItem>>
{
}

public class DiscountCodeItem
{
    public required Guid Id { get; set; }

    public required string Code { get; set; }

    public required string Description { get; set; }

    public int? MaxRedemptions { get; set; }

    public required int RedeemedCount { get; set; }

    public required bool IsActive { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}
