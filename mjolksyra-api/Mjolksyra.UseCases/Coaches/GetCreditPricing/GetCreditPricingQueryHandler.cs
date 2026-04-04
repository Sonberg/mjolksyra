using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetCreditPricing;

public class GetCreditPricingQueryHandler(ICreditActionPricingRepository pricingRepository)
    : IRequestHandler<GetCreditPricingQuery, ICollection<CreditPricingItemResponse>>
{
    public async Task<ICollection<CreditPricingItemResponse>> Handle(GetCreditPricingQuery request, CancellationToken cancellationToken)
    {
        var pricing = await pricingRepository.GetAll(cancellationToken);
        return pricing
            .OrderBy(x => x.Action.ToString())
            .Select(x => new CreditPricingItemResponse
            {
                Action = x.Action,
                CreditCost = x.CreditCost,
            })
            .ToList();
    }
}
