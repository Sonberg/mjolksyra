using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Admin.GetDiscountCodes;

public sealed class GetDiscountCodesRequestHandler : IRequestHandler<GetDiscountCodesRequest, ICollection<DiscountCodeItem>>
{
    private readonly IDiscountCodeRepository _repository;

    public GetDiscountCodesRequestHandler(IDiscountCodeRepository repository)
    {
        _repository = repository;
    }

    public async Task<ICollection<DiscountCodeItem>> Handle(GetDiscountCodesRequest request, CancellationToken cancellationToken)
    {
        var codes = await _repository.GetAllAsync(cancellationToken);

        return codes.Select(c => new DiscountCodeItem
        {
            Id = c.Id,
            Code = c.Code,
            Description = c.Description,
            MaxRedemptions = c.MaxRedemptions,
            RedeemedCount = c.RedeemedCount,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
        }).ToList();
    }
}
